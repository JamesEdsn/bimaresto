package handlers

import (
	"bimaresto-backend/services"
	"bimaresto-backend/utils"

	"github.com/gofiber/fiber/v2"
)

type KitchenHandler struct {
	service services.KitchenService
}

func NewKitchenHandler(service services.KitchenService) *KitchenHandler {
	return &KitchenHandler{service}
}

func (h *KitchenHandler) GetKitchenOrders(c *fiber.Ctx) error {
	items, err := h.service.GetActiveOrders()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data order dapur")
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil mengambil data order dapur", items)
}

func (h *KitchenHandler) UpdateItemStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		Status string `json:"status"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	newStatus, err := h.service.UpdateItemStatus(id, body.Status)
	if err != nil {
		if err.Error() == "item tidak ditemukan" {
			return utils.ErrorResponse(c, fiber.StatusNotFound, err.Error())
		}
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Status item diperbarui", fiber.Map{
		"status": newStatus,
	})
}
