package services

import (
	"bimaresto-backend/repositories"
)

type ReportService interface {
	GetDailyReport(days int) ([]repositories.DailyReportResult, error)
}

type reportService struct {
	repo repositories.ReportRepository
}

func NewReportService(repo repositories.ReportRepository) ReportService {
	return &reportService{repo}
}

func (s *reportService) GetDailyReport(days int) ([]repositories.DailyReportResult, error) {
	if days <= 0 {
		days = 30 // Default 30 hari
	}
	// Di masa depan, logika export Excel/PDF bisa ditaruh di sini
	return s.repo.GetDailyRevenue(days)
}
