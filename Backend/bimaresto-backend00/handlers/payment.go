package handlers

import (
	"bimaresto-backend/middleware"
	"bimaresto-backend/services"
	"bimaresto-backend/utils"
	"errors"
	"fmt"
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type PaymentHandler struct {
	service services.PaymentService
}

func NewPaymentHandler(service services.PaymentService) *PaymentHandler {
	return &PaymentHandler{service}
}

func (h *PaymentHandler) GetPayments(c *fiber.Ctx) error {
	payments, err := h.service.GetPayments()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data pembayaran")
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil mengambil data pembayaran", payments)
}

func (h *PaymentHandler) GenerateBill(c *fiber.Ctx) error {
	orderID := c.Params("id")
	order, err := h.service.GetBill(orderID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "Order tidak ditemukan")
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil mengambil tagihan", fiber.Map{
		"order_id": order.ID,
		"items":    order.OrderItems,
		"total":    order.Total,
	})
}

func (h *PaymentHandler) ProcessPayment(c *fiber.Ctx) error {
	var body struct {
		OrderID       int     `json:"order_id"`
		PaymentMethod string  `json:"payment_method"`
		AmountPaid    float64 `json:"amount_paid"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	fmt.Printf("DEBUG: Bruno mengirim OrderID: %d\n", body.OrderID)

	staffID := middleware.GetStaffID(c)
	payment, change, newStatus, err := h.service.ProcessPayment(body.OrderID, staffID, body.AmountPaid, body.PaymentMethod)
	if err != nil {
		if errors.Is(err, services.ErrOrderAlreadyProcessed) {
			return utils.ErrorResponse(c, fiber.StatusConflict, err.Error())
		}
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	responseData := fiber.Map{
		"payment_method": payment.PaymentMethod,
		"amount_paid":    payment.Total,
		"change":         change,
		"order_status":   newStatus,
	}

	message := "Pembayaran berhasil"
	if newStatus == "completed" {
		message = "Pembayaran selesai! Meja telah dikosongkan."
	}

	return utils.SuccessResponse(c, fiber.StatusOK, message, responseData)
}
func (h *PaymentHandler) ProcessItemPayment(c *fiber.Ctx) error {
	var body struct {
		OrderID       int    `json:"order_id"`
		ItemIDs       []int  `json:"item_ids"` // ID item yang dicentang di UI
		PaymentMethod string `json:"payment_method"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, 400, "Request tidak valid")
	}

	staffID := middleware.GetStaffID(c)
	payment, remaining, err := h.service.ProcessItemSplit(body.OrderID, body.ItemIDs, staffID, body.PaymentMethod)

	if err != nil {
		return utils.ErrorResponse(c, 400, err.Error())
	}

	return utils.SuccessResponse(c, 200, "Pembayaran item berhasil", fiber.Map{
		"amount_paid":       payment.Total,
		"remaining_balance": remaining,
	})
}

func (h *PaymentHandler) DeletePayment(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	staffID := middleware.GetStaffID(c)
	log.Printf("API: DeletePayment id=%d by staff=%d", id, staffID)
	if err := h.service.DeletePayment(id); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Payment berhasil dihapus", nil)
}
