package handlers

import (
	"bimaresto-backend/middleware"
	"bimaresto-backend/services"
	"bimaresto-backend/utils"

	"github.com/gofiber/fiber/v2"
)

type CreateOrderInput struct {
	TableID     int                     `json:"table_id"`
	Source      string                  `json:"source"`
	Notes       string                  `json:"notes"`
	ClientRefID string                  `json:"client_ref_id"`
	Items       []services.OrderItemDTO `json:"items"`
}

type OrderHandler struct {
	service services.OrderService
}

func NewOrderHandler(service services.OrderService) *OrderHandler {
	return &OrderHandler{service}
}

func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	var body CreateOrderInput
	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	staffID := middleware.GetStaffID(c)
	order, err := h.service.CreateOrder(body.TableID, staffID, body.Source, body.Notes, body.ClientRefID, body.Items)

	if err != nil {
		// Logika sederhana untuk membedakan HTTP Status Code berdasarkan error message
		if err.Error() == "order dengan client_ref_id ini sudah ada" {
			return utils.ErrorResponse(c, fiber.StatusConflict, err.Error())
		}
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "Order berhasil dibuat", order)
}

func (h *OrderHandler) SyncOfflineData(c *fiber.Ctx) error {
	var body struct {
		Orders []struct {
			TableID     int                     `json:"table_id"`
			Source      string                  `json:"source"`
			Notes       string                  `json:"notes"`
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

	staffID := middleware.GetStaffID(c)
	synced, skipped, errorsList := h.service.SyncOfflineData(staffID, body.Orders)

	return utils.SuccessResponse(c, fiber.StatusOK, "Sync offline data selesai", fiber.Map{
		"synced":  synced,
		"skipped": skipped,
		"errors":  errorsList,
	})
}
