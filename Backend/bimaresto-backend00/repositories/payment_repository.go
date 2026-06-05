package repositories

import (
	"bimaresto-backend/models"

	"gorm.io/gorm"
)

type PaymentRepository interface {
	FindAll() ([]models.Payment, error)
	FindOrderWithItems(orderID string) (models.Order, error)
	FindOrderForPayment(orderID int) (models.Order, error)
	ProcessPaymentTx(payment *models.Payment, order *models.Order, newStatus string) error
	FindItemsByIDs(itemIDs []int) ([]models.OrderItem, error)
	ProcessItemPaymentTx(payment *models.Payment, order *models.Order, itemIDs []int, newOrderStatus string) error
	Delete(id int) error
}

type paymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) PaymentRepository {
	return &paymentRepository{db}
}

func (r *paymentRepository) FindAll() ([]models.Payment, error) {
	var payments []models.Payment
	err := r.db.
		Preload("Order.Table").
		Preload("Order.Staff.Role").
		Order("paid_at DESC NULLS LAST").
		Find(&payments).Error
	return payments, err
}

func (r *paymentRepository) FindOrderWithItems(orderID string) (models.Order, error) {
	var order models.Order
	err := r.db.Preload("OrderItems.Menu").First(&order, orderID).Error
	return order, err
}

func (r *paymentRepository) FindOrderForPayment(orderID int) (models.Order, error) {
	var order models.Order
	err := r.db.First(&order, orderID).Error
	return order, err
}

func (r *paymentRepository) ProcessPaymentTx(payment *models.Payment, order *models.Order, newStatus string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(payment).Error; err != nil {
			return err
		}
		if err := tx.Model(order).Update("status", newStatus).Error; err != nil {
			return err
		}
		// Free table when order is completed
		if newStatus == "completed" {
			if err := tx.Model(&models.Table{}).Where("id = ?", order.TablesID).Update("status", "available").Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *paymentRepository) FindItemsByIDs(itemIDs []int) ([]models.OrderItem, error) {
	var items []models.OrderItem
	err := r.db.Where("id IN ?", itemIDs).Find(&items).Error
	return items, err
}

func (r *paymentRepository) ProcessItemPaymentTx(payment *models.Payment, order *models.Order, itemIDs []int, newOrderStatus string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// 1. Catat Transaksi Pembayaran
		if err := tx.Create(payment).Error; err != nil {
			return err
		}

		// 2. Update Order: Status
		if err := tx.Model(order).Update("status", newOrderStatus).Error; err != nil {
			return err
		}

		// 3. Kosongkan meja jika benar-benar sudah selesai
		if newOrderStatus == "completed" {
			if err := tx.Model(&models.Table{}).Where("id = ?", order.TablesID).Update("status", "available").Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *paymentRepository) Delete(id int) error {
	return r.db.Where("id = ?", id).Delete(&models.Payment{}).Error
}
