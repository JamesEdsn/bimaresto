package repositories

import (
	"bimaresto-backend/models"
	"errors"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type OrderRepository interface {
	FindMenusByIDs(menuIDs []int) ([]models.Menu, error)
	CreateOrderTx(order *models.Order) (*models.Order, error)
}

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{db}
}

func (r *orderRepository) FindMenusByIDs(menuIDs []int) ([]models.Menu, error) {
	var menus []models.Menu
	err := r.db.Where("id IN ?", menuIDs).Find(&menus).Error
	return menus, err
}

func (r *orderRepository) CreateOrderTx(order *models.Order) (*models.Order, error) {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		items := order.Items
		order.Items = nil

		// Pessimistic Locking pada meja
		var table models.Table
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&table, order.TableID).Error; err != nil {
			return errors.New("meja tidak ditemukan")
		}
		if table.Status != "occupied" {
			return errors.New("meja harus berstatus occupied sebelum order dibuat")
		}

		result := tx.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "client_ref_id"}},
			DoNothing: true,
		}).Create(order)

		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return errors.New("order dengan client_ref_id ini sudah ada")
		}
		for i := range items {
			items[i].OrderID = order.ID
		}
		if err := tx.Create(&items).Error; err != nil {
			return err
		}
		order.Items = items
		return nil
	})

	if err != nil {
		return nil, err
	}

	// Fetch full order to return
	r.db.Preload("Items.Menu").Preload("Table").First(order, order.ID)
	return order, nil
}
