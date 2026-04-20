package services

import (
	"bimaresto-backend/mocks"
	"bimaresto-backend/models"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// SKENARIO 1: PEMBAYARAN LUNAS (FULL PAYMENT)
func TestProcessPayment_Lunas_Success(t *testing.T) {
	// Setup Database Tiruan
	paymentRepo := new(mocks.PaymentRepositoryMock)
	paymentService := NewPaymentService(paymentRepo)

	// Data Order bohongan: Total tagihan Rp 100.000, belum dibayar sama sekali
	mockOrder := models.Order{
		ID:        1,
		TableID:   5,
		Status:    "unpaid",
		Total:     100000,
		TotalPaid: 0,
	}

	// Atur skenario di database tiruan
	paymentRepo.On("FindOrderForPayment", 1).Return(mockOrder, nil)
	paymentRepo.On("ProcessPaymentTx", mock.AnythingOfType("*models.Payment"), mock.AnythingOfType("*models.Order"), "paid", true).Return(nil)

	// Eksekusi fungsi: Pelanggan bayar pas Rp 100.000 pakai QRIS
	payment, remaining, status, err := paymentService.ProcessPayment(1, 2, 100000, "qris")

	// Pengecekan Hasil
	assert.Nil(t, err)                     // Pastikan tidak ada error
	assert.Equal(t, float64(0), remaining) // Sisa tagihan harus 0
	assert.Equal(t, "paid", status)        // Status order harus lunas
	assert.Equal(t, float64(100000), payment.AmountPaid)
	assert.Equal(t, float64(0), payment.Change) // Kembalian harus 0
}

// SKENARIO 2: PEMBAYARAN SEBAGIAN (SPLIT BILL)
func TestProcessPayment_SplitBill_Success(t *testing.T) {
	paymentRepo := new(mocks.PaymentRepositoryMock)
	paymentService := NewPaymentService(paymentRepo)

	// Data Order bohongan: Total tagihan Rp 100.000
	mockOrder := models.Order{
		ID:        1,
		Total:     100000,
		TotalPaid: 0,
	}

	// Atur skenario
	paymentRepo.On("FindOrderForPayment", 1).Return(mockOrder, nil)
	// Perhatikan bahwa parameter 'freeTable' bernilai false karena belum lunas
	paymentRepo.On("ProcessPaymentTx", mock.Anything, mock.Anything, "partially_paid", false).Return(nil)

	// Eksekusi: Teman pertama patungan Rp 40.000 pakai Cash
	payment, remaining, status, err := paymentService.ProcessPayment(1, 2, 40000, "cash")

	// Pengecekan Hasil
	assert.Nil(t, err)
	assert.Equal(t, float64(60000), remaining) // Sisa tagihan harus Rp 60.000
	assert.Equal(t, "partially_paid", status)  // Status harus partially_paid
	assert.Equal(t, float64(40000), payment.AmountPaid)
}

// SKENARIO 3: ERROR KARENA METODE PEMBAYARAN TIDAK VALID
func TestProcessPayment_Failed_InvalidMethod(t *testing.T) {
	paymentRepo := new(mocks.PaymentRepositoryMock)
	paymentService := NewPaymentService(paymentRepo)

	// Eksekusi: Pelanggan mau ngutang pakai "paylater"
	_, _, _, err := paymentService.ProcessPayment(1, 2, 50000, "paylater")

	// Pengecekan Hasil
	assert.NotNil(t, err) // Harus terjadi error
	assert.Equal(t, "payment_method harus: cash, qris, debit, credit", err.Error())

	// Karena error di awal, database tidak boleh dipanggil sama sekali
	paymentRepo.AssertNotCalled(t, "FindOrderForPayment")
	paymentRepo.AssertNotCalled(t, "ProcessPaymentTx")
}
