package handlers

import (
	"bimaresto-backend/middleware"
	"bimaresto-backend/services"
	"bimaresto-backend/utils"

	"github.com/gofiber/fiber/v2"
)

type PaymentHandler struct {
	service services.PaymentService
}

func NewPaymentHandler(service services.PaymentService) *PaymentHandler {
	return &PaymentHandler{service}
}

func (h *PaymentHandler) GenerateBill(c *fiber.Ctx) error {
	orderID := c.Params("id")
	order, err := h.service.GetBill(orderID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "Order tidak ditemukan")
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil mengambil tagihan", fiber.Map{
		"order_id":    order.ID,
		"items":       order.Items,
		"subtotal":    order.Subtotal,
		"tax":         order.Tax,
		"service_fee": order.ServiceFee,
		"total":       order.Total,
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

	staffID := middleware.GetStaffID(c)
	payment, remainingBalance, newStatus, err := h.service.ProcessPayment(body.OrderID, staffID, body.AmountPaid, body.PaymentMethod)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	responseData := fiber.Map{
		"payment_method":    payment.PaymentMethod,
		"amount_paid":       payment.AmountPaid,
		"change":            payment.Change,
		"order_status":      newStatus,
		"remaining_balance": remainingBalance, // Sisa yang harus dibayar teman patungannya
	}

	message := "Pembayaran Split Bill berhasil"
	if newStatus == "paid" {
		message = "Pembayaran lunas! Meja telah dikosongkan."
	}

	return utils.SuccessResponse(c, fiber.StatusOK, message, responseData)
}
