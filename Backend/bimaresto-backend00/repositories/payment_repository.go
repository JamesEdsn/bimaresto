package repositories

import (
	"bimaresto-backend/models"

	"gorm.io/gorm"
)

type PaymentRepository interface {
	FindOrderWithItems(orderID string) (models.Order, error)
	FindOrderForPayment(orderID int) (models.Order, error)
	ProcessPaymentTx(payment *models.Payment, order *models.Order, newStatus string, freeTable bool) error
	FindItemsByIDs(itemIDs []int) ([]models.OrderItem, error)
	ProcessItemPaymentTx(payment *models.Payment, order *models.Order, itemIDs []int, newOrderStatus string, freeTable bool) error
}

type paymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) PaymentRepository {
	return &paymentRepository{db}
}

func (r *paymentRepository) FindOrderWithItems(orderID string) (models.Order, error) {
	var order models.Order
	err := r.db.Preload("Items.Menu").First(&order, orderID).Error
	return order, err
}

func (r *paymentRepository) FindOrderForPayment(orderID int) (models.Order, error) {
	var order models.Order
	err := r.db.First(&order, orderID).Error
	return order, err
}

func (r *paymentRepository) ProcessPaymentTx(payment *models.Payment, order *models.Order, newStatus string, freeTable bool) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(payment).Error; err != nil {
			return err
		}
		if err := tx.Model(order).Updates(map[string]interface{}{
			"status":     newStatus,
			"total_paid": order.TotalPaid,
		}).Error; err != nil {
			return err
		}
		if freeTable {
			if err := tx.Model(&models.Table{}).Where("id = ?", order.TableID).Update("status", "available").Error; err != nil {
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

func (r *paymentRepository) ProcessItemPaymentTx(payment *models.Payment, order *models.Order, itemIDs []int, newOrderStatus string, freeTable bool) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// 1. Catat Transaksi Pembayaran
		if err := tx.Create(payment).Error; err != nil {
			return err
		}

		// 2. Tandai Item yang dibayar menjadi lunas (IsPaid = true)
		if err := tx.Model(&models.OrderItem{}).Where("id IN ?", itemIDs).Update("is_paid", true).Error; err != nil {
			return err
		}

		// 3. Update Order: TotalPaid dan Status (partially_paid atau paid)
		if err := tx.Model(order).Updates(map[string]interface{}{
			"total_paid": order.TotalPaid,
			"status":     newOrderStatus,
		}).Error; err != nil {
			return err
		}

		// 4. Kosongkan meja jika benar-benar sudah lunas
		if freeTable {
			if err := tx.Model(&models.Table{}).Where("id = ?", order.TableID).Update("status", "available").Error; err != nil {
				return err
			}
		}
		return nil
	})
}
