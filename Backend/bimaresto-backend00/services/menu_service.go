package services

import (
	"bimaresto-backend/models"
	"bimaresto-backend/repositories"
	"errors"
)

type MenuService interface {
	GetMenus(page, limit int, search, categoryID string) ([]models.Menu, int, int64, error)
	GetMenuByID(id string) (models.Menu, error)
	CreateMenu(categoryID int, name, description string, price float64, isAvailable bool, image string) (models.Menu, error)
	GetCategories() ([]models.Category, error)
	CreateCategory(name string) (models.Category, error)
	UpdateCategory(id, name string) (models.Category, error)
	DeleteCategory(id string) error
	UpdateMenu(id string, categoryID int, name, description string, price float64, isAvailable bool, image string) (models.Menu, error)
	// DeleteMenu deletes a menu; if force==true it will also remove dependent rows (order_items, promos)
	DeleteMenu(id string, force bool) error
}

type menuService struct {
	repo repositories.MenuRepository
}

func NewMenuService(repo repositories.MenuRepository) MenuService {
	return &menuService{repo}
}

func (s *menuService) GetMenus(page, limit int, search, categoryID string) ([]models.Menu, int, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	menus, total, err := s.repo.FindAll(search, categoryID, limit, offset)
	totalPages := (int(total) + limit - 1) / limit

	return menus, totalPages, total, err
}

func (s *menuService) GetMenuByID(id string) (models.Menu, error) {
	return s.repo.FindByID(id)
}

func (s *menuService) CreateMenu(categoryID int, name, description string, price float64, isAvailable bool, image string) (models.Menu, error) {
	if name == "" || price <= 0 || categoryID == 0 {
		return models.Menu{}, errors.New("name, price, dan category_id wajib diisi")
	}

	menu := models.Menu{
		CategoriesID: categoryID,
		Name:         name,
		Description:  description,
		Price:        price,
		IsAvailable:  isAvailable,
		Image:        image,
	}

	err := s.repo.Create(&menu)
	return menu, err
}

func (s *menuService) GetCategories() ([]models.Category, error) {
	return s.repo.GetCategories()
}

func (s *menuService) CreateCategory(name string) (models.Category, error) {
	if name == "" {
		return models.Category{}, errors.New("name wajib diisi")
	}

	category := models.Category{Name: name}
	err := s.repo.CreateCategory(&category)
	return category, err
}

func (s *menuService) UpdateCategory(id, name string) (models.Category, error) {
	if name == "" {
		return models.Category{}, errors.New("name wajib diisi")
	}

	category, err := s.repo.FindCategoryByID(id)
	if err != nil {
		return models.Category{}, errors.New("kategori tidak ditemukan")
	}

	category.Name = name
	err = s.repo.UpdateCategory(&category)
	return category, err
}

func (s *menuService) DeleteCategory(id string) error {
	category, err := s.repo.FindCategoryByID(id)
	if err != nil {
		return errors.New("kategori tidak ditemukan")
	}
	return s.repo.DeleteCategory(&category)
}

func (s *menuService) UpdateMenu(id string, categoryID int, name, description string, price float64, isAvailable bool, image string) (models.Menu, error) {
	menu, err := s.repo.FindByID(id)
	if err != nil {
		return models.Menu{}, errors.New("menu tidak ditemukan")
	}

	menu.CategoriesID = categoryID
	menu.Name = name
	menu.Description = description
	menu.Price = price
	menu.IsAvailable = isAvailable
	menu.Image = image

	err = s.repo.Update(&menu)
	// Fetch ulang agar relasi Category terbawa
	if err == nil {
		menu, _ = s.repo.FindByID(id)
	}
	return menu, err
}

func (s *menuService) DeleteMenu(id string, force bool) error {
	menu, err := s.repo.FindByID(id)
	if err != nil {
		return errors.New("menu tidak ditemukan")
	}
	if force {
		return s.repo.DeleteWithDependencies(&menu)
	}
	return s.repo.Delete(&menu)
}
