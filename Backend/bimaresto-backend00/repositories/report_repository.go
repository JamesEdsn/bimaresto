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
	GetDailyRevenue(startDate string, endDate string, limit int) ([]DailyReportResult, error)
}

type reportRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) ReportRepository {
	return &reportRepository{db}
}

func (r *reportRepository) GetDailyRevenue(startDate string, endDate string, limit int) ([]DailyReportResult, error) {
	var reports []DailyReportResult

	if startDate != "" && endDate != "" {
		err := r.db.Raw(`
			SELECT
				TO_CHAR(paid_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') AS date,
				COUNT(id) AS total_orders,
				SUM(total) AS total_revenue,
				0 AS total_tax,
				0 AS total_service
			FROM payments
			WHERE payment_status = 'paid'
			  AND TO_CHAR(paid_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') >= ?
			  AND TO_CHAR(paid_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') <= ?
			GROUP BY date
			ORDER BY date DESC
		`, startDate, endDate).Scan(&reports).Error
		return reports, err
	}

	err := r.db.Raw(`
		SELECT
			TO_CHAR(paid_at AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') AS date,
			COUNT(id) AS total_orders,
			SUM(total) AS total_revenue,
			0 AS total_tax,
			0 AS total_service
		FROM payments
		WHERE payment_status = 'paid'
		GROUP BY date
		ORDER BY date DESC
		LIMIT ?
	`, limit).Scan(&reports).Error

	return reports, err
}
