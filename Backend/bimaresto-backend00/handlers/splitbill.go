package handlers

import (
    "bimaresto-backend/services"
    "bimaresto-backend/utils"
    "strconv"

    "github.com/gofiber/fiber/v2"
    "log"
)

type SplitBillHandler struct {
    service services.SplitBillService
}

func NewSplitBillHandler(service services.SplitBillService) *SplitBillHandler {
    return &SplitBillHandler{service}
}

func (h *SplitBillHandler) GetSplitBills(c *fiber.Ctx) error {
    items, err := h.service.GetAll()
    if err != nil {
        return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data split bill")
    }

    return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil mengambil data split bill", items)
}

func (h *SplitBillHandler) DeleteSplitBill(c *fiber.Ctx) error {
    id, _ := strconv.Atoi(c.Params("id"))
    log.Printf("API: DeleteSplitBill id=%d", id)
    if err := h.service.Delete(id); err != nil {
        return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
    }
    return utils.SuccessResponse(c, fiber.StatusOK, "Split bill berhasil dihapus", nil)
}
