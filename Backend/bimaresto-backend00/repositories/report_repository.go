package repositories

import (
	"gorm.io/gorm"
)

// Kita gunakan struct lokal untuk menampung hasil query raw
type DailyReportResult struct {
	Date         string  `json:"date"`
	TotalOrders  int     `json:"total_orders"`
	TotalRevenue float64 `json:"total_revenue"`
	TotalTax     float64 `json:"total_tax"`
	TotalService float64 `json:"total_service"`
}

type ReportRepository interface {
	GetDailyRevenue(limit int) ([]DailyReportResult, error)
}

type reportRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) ReportRepository {
	return &reportRepository{db}
}

func (r *reportRepository) GetDailyRevenue(limit int) ([]DailyReportResult, error) {
	var reports []DailyReportResult

	err := r.db.Raw(`
		SELECT
			TO_CHAR(created_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') AS date,
			COUNT(id) AS total_orders,
			SUM(subtotal) AS total_revenue,
			SUM(tax) AS total_tax,
			SUM(service_fee) AS total_service
		FROM orders
		WHERE status = 'paid'
		GROUP BY date
		ORDER BY date DESC
		LIMIT ?
	`, limit).Scan(&reports).Error

	return reports, err
}
