package repositories

import (
	"bimaresto-backend/models"

	"gorm.io/gorm"
)

type TableRepository interface {
	FindAll() ([]models.Table, error)
	FindByID(id string) (models.Table, error)
	UpdateStatus(table *models.Table, status string) error
}

type tableRepository struct {
	db *gorm.DB
}

func NewTableRepository(db *gorm.DB) TableRepository {
	return &tableRepository{db}
}

func (r *tableRepository) FindAll() ([]models.Table, error) {
	var tables []models.Table
	err := r.db.Order("table_number asc").Find(&tables).Error
	return tables, err
}

func (r *tableRepository) FindByID(id string) (models.Table, error) {
	var table models.Table
	err := r.db.First(&table, id).Error
	return table, err
}

func (r *tableRepository) UpdateStatus(table *models.Table, status string) error {
	return r.db.Model(table).Update("status", status).Error
}
