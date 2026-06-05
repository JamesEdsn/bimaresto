package repositories

import (
	"errors"
	"bimaresto-backend/models"

	"gorm.io/gorm"
)

type MenuRepository interface {
	FindAll(search, categoryID string, limit, offset int) ([]models.Menu, int64, error)
	FindByID(id string) (models.Menu, error)
	Create(menu *models.Menu) error
	GetCategories() ([]models.Category, error)
	CreateCategory(category *models.Category) error
	FindCategoryByID(id string) (models.Category, error)
	UpdateCategory(category *models.Category) error
	DeleteCategory(category *models.Category) error
	Update(menu *models.Menu) error
	Delete(menu *models.Menu) error
	// DeleteWithDependencies removes dependent rows (order_items, promos) and the menu within a transaction
	DeleteWithDependencies(menu *models.Menu) error
}

type menuRepository struct {
	db *gorm.DB
}

func NewMenuRepository(db *gorm.DB) MenuRepository {
	return &menuRepository{db}
}

func (r *menuRepository) FindAll(search, categoryID string, limit, offset int) ([]models.Menu, int64, error) {
	var menus []models.Menu
	var total int64
	query := r.db.Model(&models.Menu{}).Preload("Category")

	if search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	query.Count(&total)
	err := query.Offset(offset).Limit(limit).Find(&menus).Error
	return menus, total, err
}

func (r *menuRepository) FindByID(id string) (models.Menu, error) {
	var menu models.Menu
	err := r.db.Preload("Category").First(&menu, id).Error
	return menu, err
}

func (r *menuRepository) Create(menu *models.Menu) error {
	return r.db.Create(menu).Error
}

func (r *menuRepository) GetCategories() ([]models.Category, error) {
	var categories []models.Category
	err := r.db.Find(&categories).Error
	return categories, err
}

func (r *menuRepository) CreateCategory(category *models.Category) error {
	return r.db.Create(category).Error
}

func (r *menuRepository) FindCategoryByID(id string) (models.Category, error) {
	var category models.Category
	err := r.db.First(&category, id).Error
	return category, err
}

func (r *menuRepository) UpdateCategory(category *models.Category) error {
	return r.db.Save(category).Error
}

func (r *menuRepository) DeleteCategory(category *models.Category) error {
	return r.db.Delete(category).Error
}

func (r *menuRepository) Update(menu *models.Menu) error {
	return r.db.Save(menu).Error
}

func (r *menuRepository) Delete(menu *models.Menu) error {
	var count int64
	// Cek apakah ada order_items yang masih mereferensikan menu ini
	if err := r.db.Model(&models.OrderItem{}).Where("menu_id = ?", menu.ID).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return errors.New("menu tidak bisa dihapus: masih digunakan di order/order_items")
	}
	return r.db.Delete(menu).Error
}

func (r *menuRepository) DeleteWithDependencies(menu *models.Menu) error {
	tx := r.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// Hapus dependent order_items
	if err := tx.Where("menu_id = ?", menu.ID).Delete(&models.OrderItem{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Hapus promo yang mereferensikan menu ini (buy or free)
	if err := tx.Where("buy_menu_id = ? OR free_menu_id = ?", menu.ID, menu.ID).Delete(&models.Promo{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Hapus menu itu sendiri
	if err := tx.Delete(menu).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}
