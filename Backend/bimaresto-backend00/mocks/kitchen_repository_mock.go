package mocks

import (
	"bimaresto-backend/models"

	"github.com/stretchr/testify/mock"
)

type KitchenRepositoryMock struct {
	mock.Mock
}

func (m *KitchenRepositoryMock) FindActiveItems() ([]models.OrderItem, error) {
	args := m.Called()
	return args.Get(0).([]models.OrderItem), args.Error(1)
}

func (m *KitchenRepositoryMock) FindItemByID(id string) (models.OrderItem, error) {
	args := m.Called(id)
	return args.Get(0).(models.OrderItem), args.Error(1)
}

func (m *KitchenRepositoryMock) UpdateItemStatus(item *models.OrderItem, status string) error {
	args := m.Called(item, status)
	return args.Error(0)
}
