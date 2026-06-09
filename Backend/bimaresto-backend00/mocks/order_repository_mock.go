package mocks

import (
	"bimaresto-backend/models"

	"github.com/stretchr/testify/mock"
)

type OrderRepositoryMock struct {
	mock.Mock
}

func (m *OrderRepositoryMock) FindAll() ([]models.Order, error) {
	args := m.Called()
	return args.Get(0).([]models.Order), args.Error(1)
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

func (m *OrderRepositoryMock) AddItemsToOrderTx(order *models.Order, newItems []models.OrderItem) error {
	args := m.Called(order, newItems)
	return args.Error(0)
}

func (m *OrderRepositoryMock) FindByID(orderID int) (models.Order, error) {
	args := m.Called(orderID)
	return args.Get(0).(models.Order), args.Error(1)
}

func (m *OrderRepositoryMock) DeleteOrderTx(orderID int, tableID int) error {
	args := m.Called(orderID, tableID)
	return args.Error(0)
}

func (m *OrderRepositoryMock) RemoveItemTx(order *models.Order, itemID int) error {
	args := m.Called(order, itemID)
	return args.Error(0)
}

func (m *OrderRepositoryMock) MoveTableTx(order *models.Order, newTableID int) error {
	args := m.Called(order, newTableID)
	return args.Error(0)
}

func (m *OrderRepositoryMock) SplitTableTx(oldOrder *models.Order, newOrder *models.Order, itemsToMove []models.OrderItem, itemsToUpdate []models.OrderItem, itemsToDelete []int) error {
	args := m.Called(oldOrder, newOrder, itemsToMove, itemsToUpdate, itemsToDelete)
	return args.Error(0)
}

func (m *OrderRepositoryMock) MergeOrdersTx(targetOrder *models.Order, sourceOrder *models.Order) error {
	args := m.Called(targetOrder, sourceOrder)
	return args.Error(0)
}

func (m *OrderRepositoryMock) UpdateOrderStatus(order *models.Order, status string) error {
	args := m.Called(order, status)
	return args.Error(0)
}
