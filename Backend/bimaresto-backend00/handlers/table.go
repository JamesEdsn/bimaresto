package handlers

import (
	"bimaresto-backend/services"
	"bimaresto-backend/utils"

	"github.com/gofiber/fiber/v2"
)

type TableHandler struct {
	service services.TableService
}

func NewTableHandler(service services.TableService) *TableHandler {
	return &TableHandler{service}
}

func (h *TableHandler) GetTables(c *fiber.Ctx) error {
	tables, err := h.service.GetAllTables()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data meja")
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil mengambil data meja", tables)
}

func (h *TableHandler) UpdateTableStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		Status string `json:"status"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	newStatus, err := h.service.UpdateTableStatus(id, body.Status)
	if err != nil {
		if err.Error() == "meja tidak ditemukan" {
			return utils.ErrorResponse(c, fiber.StatusNotFound, err.Error())
		}
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Status meja diperbarui", fiber.Map{
		"status": newStatus,
	})
}
