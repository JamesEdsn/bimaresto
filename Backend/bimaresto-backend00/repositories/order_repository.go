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
	AddItemsToOrderTx(order *models.Order, newItems []models.OrderItem) error
	FindByID(orderID int) (models.Order, error)
	DeleteOrderTx(orderID int, tableID int) error
	RemoveItemTx(order *models.Order, itemID int) error
	MoveTableTx(order *models.Order, newTableID int) error
	SplitTableTx(oldOrder *models.Order, newOrder *models.Order, itemsToMove []models.OrderItem, itemsToUpdate []models.OrderItem, itemsToDelete []int) error
	MergeOrdersTx(targetOrder *models.Order, sourceOrder *models.Order) error
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

func (r *orderRepository) AddItemsToOrderTx(order *models.Order, newItems []models.OrderItem) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Simpan item-item baru ke database
		if err := tx.Create(&newItems).Error; err != nil {
			return err
		}

		// Update field Subtotal, Tax, ServiceFee, dan Total di tabel orders
		if err := tx.Model(order).Updates(map[string]interface{}{
			"subtotal":    order.Subtotal,
			"tax":         order.Tax,
			"service_fee": order.ServiceFee,
			"total":       order.Total,
		}).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *orderRepository) FindByID(orderID int) (models.Order, error) {
	var order models.Order
	// Di sinilah GORM (db, Preload, First, Error) boleh digunakan
	err := r.db.Preload("Items").First(&order, orderID).Error
	return order, err
}

func (r *orderRepository) DeleteOrderTx(orderID int, tableID int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Hapus semua item di pesanan ini
		if err := tx.Where("order_id = ?", orderID).Delete(&models.OrderItem{}).Error; err != nil {
			return err
		}
		// Hapus data pesanannya
		if err := tx.Where("id = ?", orderID).Delete(&models.Order{}).Error; err != nil {
			return err
		}
		// Ubah status meja menjadi kosong (available)
		if err := tx.Model(&models.Table{}).Where("id = ?", tableID).Update("status", "available").Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *orderRepository) RemoveItemTx(order *models.Order, itemID int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Hapus 1 item saja
		if err := tx.Where("id = ?", itemID).Delete(&models.OrderItem{}).Error; err != nil {
			return err
		}
		// Update uang (Subtotal, Tax, Total) di tabel orders
		if err := tx.Model(order).Updates(map[string]interface{}{
			"subtotal":    order.Subtotal,
			"tax":         order.Tax,
			"service_fee": order.ServiceFee,
			"total":       order.Total,
		}).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *orderRepository) MoveTableTx(order *models.Order, newTableID int) error {
	oldTableID := order.TableID

	return r.db.Transaction(func(tx *gorm.DB) error {
		// Kunci & ubah meja tujuan menjadi "occupied".
		// Syaratnya: Meja tujuan HARUS berstatus "available".
		res := tx.Model(&models.Table{}).
			Where("id = ? AND status = ?", newTableID, "available").
			Update("status", "occupied")

		if res.Error != nil {
			return res.Error
		}
		// Jika RowsAffected == 0, berarti meja tidak ada atau sedang dipakai orang lain!
		if res.RowsAffected == 0 {
			return errors.New("meja tujuan tidak tersedia atau sudah ditempati")
		}

		// Pindahkan ID meja pada pesanan
		if err := tx.Model(order).Update("table_id", newTableID).Error; err != nil {
			return err
		}

		// Ubah meja lama menjadi "available" (kosong)
		if err := tx.Model(&models.Table{}).Where("id = ?", oldTableID).Update("status", "available").Error; err != nil {
			return err
		}

		return nil
	})
}
func (r *orderRepository) SplitTableTx(oldOrder *models.Order, newOrder *models.Order, itemsToMove []models.OrderItem, itemsToUpdate []models.OrderItem, itemsToDelete []int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Kunci & ubah meja tujuan menjadi "occupied"
		res := tx.Model(&models.Table{}).Where("id = ? AND status = ?", newOrder.TableID, "available").Update("status", "occupied")
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return errors.New("meja tujuan tidak tersedia")
		}

		// Buat data Order baru untuk Meja 2
		if err := tx.Create(newOrder).Error; err != nil {
			return err
		}

		// Masukkan item-item yang dipindah ke Order baru
		for i := range itemsToMove {
			itemsToMove[i].OrderID = newOrder.ID // Set ID order yang baru saja terbuat
		}
		if len(itemsToMove) > 0 {
			if err := tx.Create(&itemsToMove).Error; err != nil {
				return err
			}
		}

		// Update Quantity untuk item yang hanya dipindah sebagian (misal dari 2 sate, pindah 1)
		for _, item := range itemsToUpdate {
			if err := tx.Model(&models.OrderItem{}).Where("id = ?", item.ID).Update("qty", item.Quantity).Error; err != nil {
				return err
			}
		}

		// Hapus item lama yang dipindah sepenuhnya (100% Qty dipindah)
		if len(itemsToDelete) > 0 {
			if err := tx.Where("id IN ?", itemsToDelete).Delete(&models.OrderItem{}).Error; err != nil {
				return err
			}
		}

		// Update total uang di Order lama
		if err := tx.Model(oldOrder).Updates(map[string]interface{}{
			"subtotal": oldOrder.Subtotal, "tax": oldOrder.Tax, "service_fee": oldOrder.ServiceFee, "total": oldOrder.Total,
		}).Error; err != nil {
			return err
		}

		return nil
	})
}
func (r *orderRepository) MergeOrdersTx(targetOrder *models.Order, sourceOrder *models.Order) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Pindahkan semua item dari Source ke Target
		if err := tx.Model(&models.OrderItem{}).Where("order_id = ?", sourceOrder.ID).Update("order_id", targetOrder.ID).Error; err != nil {
			return err
		}

		// Hapus data pesanan Source (karena sudah kosong)
		if err := tx.Where("id = ?", sourceOrder.ID).Delete(&models.Order{}).Error; err != nil {
			return err
		}

		// Ubah status meja Source menjadi "available"
		if err := tx.Model(&models.Table{}).Where("id = ?", sourceOrder.TableID).Update("status", "available").Error; err != nil {
			return err
		}

		// Update total uang di Target Order
		if err := tx.Model(targetOrder).Updates(map[string]interface{}{
			"subtotal":    targetOrder.Subtotal,
			"tax":         targetOrder.Tax,
			"service_fee": targetOrder.ServiceFee,
			"total":       targetOrder.Total,
		}).Error; err != nil {
			return err
		}

		return nil
	})
}
