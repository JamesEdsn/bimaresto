package repositories

import (
    "bimaresto-backend/models"
    "errors"
    "gorm.io/gorm"
)

type TableRepository interface {
    FindAll() ([]models.Table, error)
    // Ubah interface agar sesuai dengan fungsi yang kita pakai
    FindByID(table *models.Table, id string) error 
    Create(table *models.Table) error
    Update(table *models.Table) error
    UpdateStatus(table *models.Table, newStatus string) error
    Delete(table *models.Table) error
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

// HANYA ADA SATU FindByID yang benar
func (r *tableRepository) FindByID(table *models.Table, id string) error {
    if err := r.db.First(table, id).Error; err != nil {
        return errors.New("meja tidak ditemukan")
    }
    return nil
}

func (r *tableRepository) Create(table *models.Table) error {
    return r.db.Create(table).Error
}

func (r *tableRepository) Update(table *models.Table) error {
    return r.db.Save(table).Error
}

func (r *tableRepository) UpdateStatus(table *models.Table, newStatus string) error {
    return r.db.Model(table).Update("status", newStatus).Error
}

func (r *tableRepository) Delete(table *models.Table) error {
    // Cek apakah ada orders aktif yang masih mereferensikan meja ini
    var count int64
    if err := r.db.Model(&models.Order{}).Where("tables_id = ?", table.ID).Count(&count).Error; err != nil {
        return err
    }
    if count > 0 {
        return errors.New("meja tidak bisa dihapus: masih ada pesanan terkait")
    }
    return r.db.Delete(table).Error
}