package services

import (
	"bimaresto-backend/models"
	"bimaresto-backend/repositories"
	"errors"
)

type MenuService interface {
	GetMenus(page, limit int, search, categoryID string) ([]models.Menu, int, int64, error)
	GetMenuByID(id string) (models.Menu, error)
	CreateMenu(categoryID int, name, description string, price float64, isAvailable bool) (models.Menu, error)
	GetCategories() ([]models.Category, error)
	UpdateMenu(id string, categoryID int, name, description string, price float64, isAvailable bool) (models.Menu, error)
	DeleteMenu(id string) error
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

func (s *menuService) CreateMenu(categoryID int, name, description string, price float64, isAvailable bool) (models.Menu, error) {
	if name == "" || price <= 0 || categoryID == 0 {
		return models.Menu{}, errors.New("name, price, dan category_id wajib diisi")
	}

	menu := models.Menu{
		CategoryID:  categoryID,
		Name:        name,
		Description: description,
		Price:       price,
		IsAvailable: isAvailable,
	}

	err := s.repo.Create(&menu)
	return menu, err
}

func (s *menuService) GetCategories() ([]models.Category, error) {
	return s.repo.GetCategories()
}

func (s *menuService) UpdateMenu(id string, categoryID int, name, description string, price float64, isAvailable bool) (models.Menu, error) {
	menu, err := s.repo.FindByID(id)
	if err != nil {
		return models.Menu{}, errors.New("menu tidak ditemukan")
	}

	menu.CategoryID = categoryID
	menu.Name = name
	menu.Description = description
	menu.Price = price
	menu.IsAvailable = isAvailable

	err = s.repo.Update(&menu)
	// Fetch ulang agar relasi Category terbawa
	if err == nil {
		menu, _ = s.repo.FindByID(id)
	}
	return menu, err
}

func (s *menuService) DeleteMenu(id string) error {
	menu, err := s.repo.FindByID(id)
	if err != nil {
		return errors.New("menu tidak ditemukan")
	}
	return s.repo.Delete(&menu)
}
