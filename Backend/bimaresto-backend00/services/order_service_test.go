package services

import (
	"bimaresto-backend/mocks"
	"bimaresto-backend/models"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// SKENARIO 1: PEMBUATAN ORDER SUKSES & PERHITUNGAN AKURAT
func TestCreateOrder_Success_KalkulasiBenar(t *testing.T) {
	orderRepo := new(mocks.OrderRepositoryMock)
	orderService := NewOrderService(orderRepo)

	// 1. Setup Data Tiruan di Database
	mockMenus := []models.Menu{
		{ID: 1, Name: "Nasi Goreng", Price: 20000, IsAvailable: true},
		{ID: 2, Name: "Es Teh", Price: 5000, IsAvailable: true},
	}

	// 2. Input dari Kasir
	// 2 Nasi Goreng (40.000) + 2 Es Teh (10.000) = Subtotal 50.000
	// Pajak 10% = 5.000
	// Service Fee 5% = 2.500
	// TOTAL = 57.500
	itemsInput := []OrderItemDTO{
		{MenuID: 1, Quantity: 2},
		{MenuID: 2, Quantity: 2},
	}

	// 3. Atur skenario mock
	orderRepo.On("FindMenusByIDs", []int{1, 2}).Return(mockMenus, nil)

	orderRepo.On("CreateOrderTx", mock.AnythingOfType("*models.Order")).Return(nil)

	// 4. Eksekusi Fungsi
	order, err := orderService.CreateOrder(5, 2, "dine_in", "", "client-uuid-123", itemsInput)

	// 5. Validasi Hasil (Sangat Krusial!)
	assert.Nil(t, err)
	assert.NotNil(t, order)
	assert.Equal(t, float64(50000), order.Subtotal, "Subtotal salah hitung!")
	assert.Equal(t, float64(5000), order.Tax, "Pajak salah hitung!")
	assert.Equal(t, float64(2500), order.ServiceFee, "Service fee salah hitung!")
	assert.Equal(t, float64(57500), order.Total, "Grand Total salah hitung!")
	assert.Len(t, order.Items, 2) // Harus ada 2 item di dalam order
}

// SKENARIO 2: GAGAL KARENA MENU SEDANG HABIS (TIDAK TERSEDIA)
func TestCreateOrder_Failed_MenuHabis(t *testing.T) {
	orderRepo := new(mocks.OrderRepositoryMock)
	orderService := NewOrderService(orderRepo)

	// Setup data: Nasi Goreng is_available = false
	mockMenus := []models.Menu{
		{ID: 1, Name: "Nasi Goreng", Price: 20000, IsAvailable: false},
	}

	itemsInput := []OrderItemDTO{
		{MenuID: 1, Quantity: 1},
	}

	// Atur skenario
	orderRepo.On("FindMenusByIDs", []int{1}).Return(mockMenus, nil)

	// Eksekusi
	order, err := orderService.CreateOrder(5, 2, "dine_in", "", "client-uuid-123", itemsInput)

	// Validasi
	assert.NotNil(t, err)
	assert.Equal(t, "menu Nasi Goreng sedang tidak tersedia", err.Error())
	assert.Nil(t, order)

	// PASTIKAN database tidak pernah menyimpan data (CreateOrderTx tidak dipanggil)
	orderRepo.AssertNotCalled(t, "CreateOrderTx")
}
