package handlers

import (
	"bimaresto-backend/services"
	"bimaresto-backend/utils"

	"github.com/gofiber/fiber/v2"
)

type ReportHandler struct {
	service services.ReportService
}

func NewReportHandler(service services.ReportService) *ReportHandler {
	return &ReportHandler{service}
}

func (h *ReportHandler) GetDailyReport(c *fiber.Ctx) error {
	// Bisa ambil query param '?days=15' di sini jika mau
	reports, err := h.service.GetDailyReport(30)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal membuat laporan harian")
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil membuat laporan harian", reports)
}
