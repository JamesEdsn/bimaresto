package repositories

import (
	"bimaresto-backend/models"

	"gorm.io/gorm"
)

type KitchenRepository interface {
	FindActiveItems() ([]models.OrderItem, error)
	FindItemByID(id string) (models.OrderItem, error)
	UpdateItemStatus(item *models.OrderItem, status string) error
}

type kitchenRepository struct {
	db *gorm.DB
}

func NewKitchenRepository(db *gorm.DB) KitchenRepository {
	return &kitchenRepository{db}
}

func (r *kitchenRepository) FindActiveItems() ([]models.OrderItem, error) {
	var items []models.OrderItem
	err := r.db.Preload("Menu").
		Where("status IN ?", []string{"pending", "processing"}).
		Order("id asc").
		Find(&items).Error
	return items, err
}

func (r *kitchenRepository) FindItemByID(id string) (models.OrderItem, error) {
	var item models.OrderItem
	err := r.db.First(&item, id).Error
	return item, err
}

func (r *kitchenRepository) UpdateItemStatus(item *models.OrderItem, status string) error {
	return r.db.Model(item).Update("status", status).Error
}
