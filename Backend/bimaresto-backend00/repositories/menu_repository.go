package repositories

import (
	"bimaresto-backend/models"

	"gorm.io/gorm"
)

type MenuRepository interface {
	FindAll(search, categoryID string, limit, offset int) ([]models.Menu, int64, error)
	FindByID(id string) (models.Menu, error)
	Create(menu *models.Menu) error
	GetCategories() ([]models.Category, error)
	Update(menu *models.Menu) error
	Delete(menu *models.Menu) error
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

func (r *menuRepository) Update(menu *models.Menu) error {
	return r.db.Save(menu).Error
}

func (r *menuRepository) Delete(menu *models.Menu) error {
	return r.db.Delete(menu).Error
}
