package mocks

import (
	"bimaresto-backend/models"

	"github.com/stretchr/testify/mock"
)

// PaymentRepositoryMock adalah database tiruan untuk keperluan testing
type PaymentRepositoryMock struct {
	mock.Mock
}

func (m *PaymentRepositoryMock) FindOrderWithItems(orderID string) (models.Order, error) {
	args := m.Called(orderID)
	return args.Get(0).(models.Order), args.Error(1)
}

func (m *PaymentRepositoryMock) FindOrderForPayment(orderID int) (models.Order, error) {
	args := m.Called(orderID)
	return args.Get(0).(models.Order), args.Error(1)
}

func (m *PaymentRepositoryMock) ProcessPaymentTx(payment *models.Payment, order *models.Order, newStatus string, freeTable bool) error {
	args := m.Called(payment, order, newStatus, freeTable)
	return args.Error(0)
}
