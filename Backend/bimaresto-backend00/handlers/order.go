package handlers

import (
	"bimaresto-backend/middleware"
	"bimaresto-backend/services"
	"bimaresto-backend/utils"
	"encoding/json"
	"errors"
	"strconv"
	"log"

	"github.com/gofiber/fiber/v2"
)

type FlexibleInt int

func (i *FlexibleInt) UnmarshalJSON(data []byte) error {
	var num int
	if err := json.Unmarshal(data, &num); err == nil {
		*i = FlexibleInt(num)
		return nil
	}

	var text string
	if err := json.Unmarshal(data, &text); err == nil {
		if text == "" {
			*i = 0
			return nil
		}

		num, err := strconv.Atoi(text)
		if err != nil {
			return err
		}
		*i = FlexibleInt(num)
		return nil
	}

	return errors.New("nilai harus berupa angka")
}

type CreateOrderInput struct {
	TableID     FlexibleInt             `json:"table_id"`
	Source      string                  `json:"source"`
	ClientRefID string                  `json:"client_ref_id"`
	Items       []services.OrderItemDTO `json:"items"`
}

type OrderHandler struct {
	service services.OrderService
}

func NewOrderHandler(service services.OrderService) *OrderHandler {
	return &OrderHandler{service}
}

func (h *OrderHandler) GetOrders(c *fiber.Ctx) error {
	orders, err := h.service.GetOrders()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data order")
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil mengambil data order", orders)
}

func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	var body CreateOrderInput
	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	staffID := middleware.GetStaffID(c)
	order, err := h.service.CreateOrder(int(body.TableID), staffID, body.Source, body.ClientRefID, body.Items)

	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "Order berhasil dibuat", order)
}

func (h *OrderHandler) SyncOfflineData(c *fiber.Ctx) error {
	var body struct {
		Orders []struct {
			TableID     FlexibleInt             `json:"table_id"`
			Source      string                  `json:"source"`
			ClientRefID string                  `json:"client_ref_id"`
			Items       []services.OrderItemDTO `json:"items"`
		} `json:"orders"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}
	if len(body.Orders) == 0 {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Orders tidak boleh kosong")
	}

	ordersInput := make([]services.OfflineOrderDTO, 0, len(body.Orders))
	for _, input := range body.Orders {
		ordersInput = append(ordersInput, services.OfflineOrderDTO{
			TableID:     int(input.TableID),
			Source:      input.Source,
			ClientRefID: input.ClientRefID,
			Items:       input.Items,
		})
	}

	staffID := middleware.GetStaffID(c)
	synced, skipped, errorsList := h.service.SyncOfflineData(staffID, ordersInput)

	return utils.SuccessResponse(c, fiber.StatusOK, "Sync offline data selesai", fiber.Map{
		"synced":  synced,
		"skipped": skipped,
		"errors":  errorsList,
	})
}

func (h *OrderHandler) AddItems(c *fiber.Ctx) error {
	orderID, _ := c.ParamsInt("id")

	var body struct {
		Items []services.OrderItemDTO `json:"items"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, 400, "Format data tidak valid")
	}

	if len(body.Items) == 0 {
		return utils.ErrorResponse(c, 400, "Tidak ada item untuk ditambahkan")
	}

	updatedOrder, err := h.service.AddItems(orderID, body.Items)
	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error())
	}

	return utils.SuccessResponse(c, 200, "Item berhasil dikirim ke dapur", updatedOrder)
}

func (h *OrderHandler) CancelOrder(c *fiber.Ctx) error {
	orderID, _ := c.ParamsInt("id")

	if err := h.service.CancelOrder(orderID); err != nil {
		return utils.ErrorResponse(c, 400, err.Error())
	}

	return utils.SuccessResponse(c, 200, "Seluruh pesanan berhasil dibatalkan dan meja dikosongkan", nil)
}

func (h *OrderHandler) CancelOrderItem(c *fiber.Ctx) error {
	orderID, _ := c.ParamsInt("id")
	itemID, _ := c.ParamsInt("item_id")

	updatedOrder, err := h.service.CancelOrderItem(orderID, itemID)
	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error())
	}

	return utils.SuccessResponse(c, 200, "Item berhasil dibatalkan, total tagihan telah diperbarui", updatedOrder)
}

func (h *OrderHandler) MoveTable(c *fiber.Ctx) error {
	orderID, _ := c.ParamsInt("id")

	var body struct {
		NewTableID int `json:"new_table_id"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, 400, "Request tidak valid")
	}

	updatedOrder, err := h.service.MoveTable(orderID, body.NewTableID)
	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error())
	}

	return utils.SuccessResponse(c, 200, "Berhasil pindah meja", updatedOrder)
}

func (h *OrderHandler) SplitTable(c *fiber.Ctx) error {
	oldOrderID, _ := c.ParamsInt("id")

	var body struct {
		NewTableID int                     `json:"new_table_id"`
		Source     string                  `json:"source"` // dine_in
		Items      []services.SplitItemDTO `json:"items"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, 400, "Request tidak valid")
	}

	if len(body.Items) == 0 {
		return utils.ErrorResponse(c, 400, "Pilih minimal 1 item untuk dipindah")
	}

	staffID := middleware.GetStaffID(c)

	oldOrder, newOrder, err := h.service.SplitTable(oldOrderID, body.NewTableID, staffID, body.Items, body.Source)
	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error())
	}

	return utils.SuccessResponse(c, 200, "Berhasil memisahkan meja", fiber.Map{
		"old_order": oldOrder,
		"new_order": newOrder,
	})
}

func (h *OrderHandler) MergeOrders(c *fiber.Ctx) error {
	targetOrderID, _ := c.ParamsInt("id")

	var body struct {
		SourceOrderID int `json:"source_order_id"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, 400, "Request tidak valid")
	}

	updatedOrder, err := h.service.MergeOrders(targetOrderID, body.SourceOrderID)
	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error())
	}

	return utils.SuccessResponse(c, 200, "Meja berhasil digabungkan", updatedOrder)
}

func (h *OrderHandler) UpdateStatus(c *fiber.Ctx) error {
	orderID, _ := c.ParamsInt("id")

	var body struct {
		Status string `json:"status"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, 400, "Request tidak valid")
	}

	staffID := middleware.GetStaffID(c)
	log.Printf("API: UpdateOrderStatus orderID=%d status=%s by staff=%d", orderID, body.Status, staffID)

	updated, err := h.service.UpdateOrderStatus(orderID, body.Status)
	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error())
	}

	return utils.SuccessResponse(c, 200, "Status pesanan berhasil diperbarui", updated)
}
