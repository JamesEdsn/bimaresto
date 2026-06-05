package services

import (
	"bimaresto-backend/mocks"
	"bimaresto-backend/models"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestCreateMenu_Success(t *testing.T) {
	// 1. Setup Mock Repository
	menuRepo := new(mocks.MenuRepositoryMock)
	menuService := NewMenuService(menuRepo)

	// 2. Beri instruksi pada Mock: "Jika fungsi Create dipanggil dengan parameter apapun, kembalikan nilai nil (tidak ada error)"
	menuRepo.On("Create", mock.AnythingOfType("*models.Menu")).Return(nil)

	// 3. Eksekusi fungsi yang mau di-test
	menu, err := menuService.CreateMenu(1, "Nasi Goreng Spesial", "Nasi goreng ayam", 25000, true)

	// 4. Validasi hasil (Assert)
	assert.Nil(t, err)                                // Harus tidak ada error
	assert.Equal(t, "Nasi Goreng Spesial", menu.Name) // Nama harus sesuai
	assert.Equal(t, float64(25000), menu.Price)       // Harga harus sesuai
	assert.Equal(t, 1, menu.CategoryID)

	// Pastikan repository benar-benar dipanggil tepat 1 kali
	menuRepo.AssertExpectations(t)
}

func TestCreateMenu_Failed_Validation(t *testing.T) {
	menuRepo := new(mocks.MenuRepositoryMock)
	menuService := NewMenuService(menuRepo)

	// Uji kasus: Harga 0 (seharusnya gagal di Service, tidak sampai memanggil Repository)
	menu, err := menuService.CreateMenu(1, "Es Teh", "Manis", 0, true)

	// Validasi hasil
	assert.NotNil(t, err) // Harus menghasilkan error
	assert.Equal(t, "name, price, dan category_id wajib diisi", err.Error())
	assert.Equal(t, models.Menu{}, menu) // Kembalian menu harus kosong

	// Karena gagal validasi, Repository.Create TIDAK BOLEH dipanggil sama sekali
	menuRepo.AssertNotCalled(t, "Create")
}
