package repositories

import (
    "bimaresto-backend/models"

    "gorm.io/gorm"
)

type SplitBillRepository interface {
    FindAll() ([]models.SplitBill, error)
    FindByID(id int) (models.SplitBill, error)
    Delete(id int) error
}

type splitBillRepository struct {
    db *gorm.DB
}

func NewSplitBillRepository(db *gorm.DB) SplitBillRepository {
    return &splitBillRepository{db}
}

func (r *splitBillRepository) FindAll() ([]models.SplitBill, error) {
    var items []models.SplitBill
    err := r.db.Order("created_at desc").Find(&items).Error
    return items, err
}

func (r *splitBillRepository) FindByID(id int) (models.SplitBill, error) {
    var item models.SplitBill
    err := r.db.First(&item, id).Error
    return item, err
}

func (r *splitBillRepository) Delete(id int) error {
    return r.db.Where("id = ?", id).Delete(&models.SplitBill{}).Error
}
