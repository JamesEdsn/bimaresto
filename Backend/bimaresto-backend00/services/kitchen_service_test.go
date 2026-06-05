package services

import (
	"bimaresto-backend/mocks"
	"bimaresto-backend/models"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

// SKENARIO 1: UPDATE STATUS BERHASIL
func TestUpdateItemStatus_Success(t *testing.T) {
	kitchenRepo := new(mocks.KitchenRepositoryMock)
	kitchenService := NewKitchenService(kitchenRepo)

	// Data bohongan
	mockItem := models.OrderItem{
		ID:     1,
		Status: "pending",
	}

	// Atur skenario mock
	kitchenRepo.On("FindItemByID", "1").Return(mockItem, nil)
	kitchenRepo.On("UpdateItemStatus", &mockItem, "cooking").Return(nil)

	// Eksekusi fungsi: Koki memproses masakan
	status, err := kitchenService.UpdateItemStatus("1", "cooking")

	// Validasi hasil
	assert.Nil(t, err)
	assert.Equal(t, "cooking", status)
}

// SKENARIO 2: GAGAL KARENA STATUS NGAWUR (TIDAK TERDAFTAR)
func TestUpdateItemStatus_Failed_InvalidStatus(t *testing.T) {
	kitchenRepo := new(mocks.KitchenRepositoryMock)
	kitchenService := NewKitchenService(kitchenRepo)

	// Eksekusi fungsi: Koki memasukkan status "gosong"
	status, err := kitchenService.UpdateItemStatus("1", "gosong")

	// Validasi hasil
	assert.NotNil(t, err)
	assert.Equal(t, "status harus salah satu dari: pending, cooking, served", err.Error())
	assert.Equal(t, "", status)

	// PASTIKAN database tidak diakses sama sekali untuk menghemat memori (karena gagal validasi di awal)
	kitchenRepo.AssertNotCalled(t, "FindItemByID")
	kitchenRepo.AssertNotCalled(t, "UpdateItemStatus")
}

// SKENARIO 3: GAGAL KARENA ID PESANAN TIDAK DITEMUKAN
func TestUpdateItemStatus_Failed_ItemNotFound(t *testing.T) {
	kitchenRepo := new(mocks.KitchenRepositoryMock)
	kitchenService := NewKitchenService(kitchenRepo)

	// Atur skenario: Database mencari ID 99 tapi me-return error
	kitchenRepo.On("FindItemByID", "99").Return(models.OrderItem{}, errors.New("record not found"))

	// Eksekusi fungsi
	status, err := kitchenService.UpdateItemStatus("99", "cooking")

	// Validasi hasil
	assert.NotNil(t, err)
	assert.Equal(t, "item tidak ditemukan", err.Error())
	assert.Equal(t, "", status)

	// Karena item tidak ketemu, pastikan fungsi Update tidak pernah dipanggil
	kitchenRepo.AssertNotCalled(t, "UpdateItemStatus")
}
