package handlers

import (
	"bimaresto-backend/services"
	"strconv"
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
	startDate := c.Query("start_date", "")
	endDate := c.Query("end_date", "")
	daysQuery := c.Query("days", "30")
	days, err := strconv.Atoi(daysQuery)
	if err != nil || days <= 0 {
		days = 30
	}

	reports, err := h.service.GetDailyReport(startDate, endDate, days)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal membuat laporan harian")
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil membuat laporan harian", reports)
}
