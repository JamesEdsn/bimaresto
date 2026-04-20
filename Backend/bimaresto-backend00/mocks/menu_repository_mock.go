package mocks

import (
	"bimaresto-backend/models"

	"github.com/stretchr/testify/mock"
)

type MenuRepositoryMock struct {
	mock.Mock
}

func (m *MenuRepositoryMock) FindAll(search, categoryID string, limit, offset int) ([]models.Menu, int64, error) {
	args := m.Called(search, categoryID, limit, offset)
	return args.Get(0).([]models.Menu), int64(args.Int(1)), args.Error(2)
}

func (m *MenuRepositoryMock) FindByID(id string) (models.Menu, error) {
	args := m.Called(id)
	return args.Get(0).(models.Menu), args.Error(1)
}

func (m *MenuRepositoryMock) Create(menu *models.Menu) error {
	args := m.Called(menu)
	return args.Error(0)
}

func (m *MenuRepositoryMock) GetCategories() ([]models.Category, error) {
	args := m.Called()
	return args.Get(0).([]models.Category), args.Error(1)
}

func (m *MenuRepositoryMock) Update(menu *models.Menu) error {
	args := m.Called(menu)
	return args.Error(0)
}

func (m *MenuRepositoryMock) Delete(menu *models.Menu) error {
	args := m.Called(menu)
	return args.Error(0)
}
