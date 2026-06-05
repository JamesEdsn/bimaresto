package handlers

import (
	"bimaresto-backend/services"
	"bimaresto-backend/utils"

	"github.com/gofiber/fiber/v2"
)

type PromoHandler struct {
	service services.PromoService
}

func NewPromoHandler(service services.PromoService) *PromoHandler {
	return &PromoHandler{service}
}

func (h *PromoHandler) GetPromos(c *fiber.Ctx) error {
	promos, err := h.service.GetPromos()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data promo")
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil mengambil data promo", promos)
}

func (h *PromoHandler) CreatePromo(c *fiber.Ctx) error {
	var body services.PromoInput
	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	promo, err := h.service.CreatePromo(body)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "Promo berhasil dibuat", promo)
}

func (h *PromoHandler) UpdatePromo(c *fiber.Ctx) error {
	var body services.PromoInput
	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	promo, err := h.service.UpdatePromo(c.Params("id"), body)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Promo berhasil diperbarui", promo)
}

func (h *PromoHandler) DeletePromo(c *fiber.Ctx) error {
	if err := h.service.DeletePromo(c.Params("id")); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Promo berhasil dihapus", nil)
}
