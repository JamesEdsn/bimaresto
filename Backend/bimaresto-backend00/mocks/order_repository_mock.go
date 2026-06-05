package mocks

import (
	"bimaresto-backend/models"

	"github.com/stretchr/testify/mock"
)

type OrderRepositoryMock struct {
	mock.Mock
}

func (m *OrderRepositoryMock) FindMenusByIDs(menuIDs []int) ([]models.Menu, error) {
	args := m.Called(menuIDs)
	return args.Get(0).([]models.Menu), args.Error(1)
}

func (m *OrderRepositoryMock) CreateOrderTx(order *models.Order) (*models.Order, error) {
	args := m.Called(order)
	err := args.Error(0)
	// Jika tidak ada error (skenario sukses), kembalikan order asli dengan simulasi ID
	if err == nil {
		order.ID = 99
		return order, nil
	}
	return nil, err
}
