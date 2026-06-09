package services

import (
	"bimaresto-backend/models"
	"bimaresto-backend/repositories"
	"errors"
	"time"
)

// helper: normalizePaymentMethod converts common variants to canonical values
func normalizePaymentMethod(m string) string {
	switch m {
	case "ewallet", "e_wallet", "e-wallet":
		return "e-wallet"
	default:
		return m
	}
}

func isAllowedPaymentMethod(m string) bool {
	allowed := map[string]bool{
		"cash":     true,
		"qris":     true,
		"debit":    true,
		"credit":   true,
		"card":     true,
		"e-wallet": true,
		"transfer": true,
	}
	return allowed[m]
}

var ErrOrderAlreadyProcessed = errors.New("order sudah selesai dan pembayaran sudah diproses")

type PaymentService interface {
	GetPayments() ([]models.Payment, error)
	GetBill(orderID string) (models.Order, error)
	ProcessPayment(orderID, staffID int, amountPaid float64, method string) (models.Payment, float64, string, error)
	ProcessItemSplit(orderID int, itemIDs []int, staffID int, method string) (models.Payment, float64, error)
	DeletePayment(id int) error
}

type paymentService struct {
	repo repositories.PaymentRepository
}

func NewPaymentService(repo repositories.PaymentRepository) PaymentService {
	return &paymentService{repo}
}

func (s *paymentService) GetPayments() ([]models.Payment, error) {
	return s.repo.FindAll()
}

func (s *paymentService) GetBill(orderID string) (models.Order, error) {
	return s.repo.FindOrderWithItems(orderID)
}

func (s *paymentService) ProcessPayment(orderID, staffID int, amountPaid float64, method string) (models.Payment, float64, string, error) {
	// 1. Validasi awal
	if amountPaid <= 0 || method == "" {
		return models.Payment{}, 0, "", errors.New("amountPaid dan paymentMethod wajib diisi")
	}

	// Normalisasi method agar toleran terhadap variasi (ewallet, e_wallet, e-wallet)
	method = normalizePaymentMethod(method)
	if !isAllowedPaymentMethod(method) {
		return models.Payment{}, 0, "", errors.New("payment_method tidak dikenali")
	}

	// 2. Cari order
	order, err := s.repo.FindOrderForPayment(orderID)
	if err != nil {
		return models.Payment{}, 0, "", errors.New("order tidak ditemukan")
	}

	if order.Status == "paid" || order.Status == "completed" {
		return models.Payment{}, 0, "", ErrOrderAlreadyProcessed
	}

	// 3. DEKLARASI DI SINI agar dikenal oleh seluruh fungsi
	var change float64 = 0
	var remaining float64 = 0
	var appliedAmount float64 = amountPaid
	var newOrderStatus string

	if order.TotalPaid+amountPaid >= order.Total {
		change = (order.TotalPaid + amountPaid) - order.Total
		appliedAmount = order.Total - order.TotalPaid
		remaining = 0
		newOrderStatus = "completed"
	} else {
		change = 0
		appliedAmount = amountPaid
		remaining = order.Total - (order.TotalPaid + amountPaid)
		newOrderStatus = order.Status
	}

	// 4. Proses Payment
	now := time.Now()
	payment := models.Payment{
		OrderID:       order.ID, // Gunakan ID dari database (PENTING!)
		TablesID:      order.TablesID,
		StaffID:       staffID,
		Total:         appliedAmount,
		AmountPaid:    amountPaid,
		Change:        change,
		PaymentMethod: method,
		PaymentStatus: "paid",
		PaidAt:        &now,
	}

	err = s.repo.ProcessPaymentTx(&payment, &order, newOrderStatus)

	// 5. Kembalikan data sesuai ekspektasi test
	return payment, remaining, newOrderStatus, err
}

func (s *paymentService) ProcessItemSplit(orderID int, itemIDs []int, staffID int, method string) (models.Payment, float64, error) {
	// 1. Ambil data Order
	order, _ := s.repo.FindOrderForPayment(orderID)

	// 2. Ambil item-item yang mau dibayar
	items, _ := s.repo.FindItemsByIDs(itemIDs)

	// 3. Hitung Total dari item terpilih beserta pajak dan service fee
	var itemTotal float64
	for _, item := range items {
		if item.IsPaid {
			return models.Payment{}, 0, errors.New("beberapa item sudah pernah dibayar")
		}
		itemBasePrice := item.UnitPrice * float64(item.Quantity)
		itemTax := itemBasePrice * 0.10
		itemService := itemBasePrice * 0.05
		itemTotal += itemBasePrice + itemTax + itemService
	}

	// Normalisasi and validate method
	method = normalizePaymentMethod(method)
	if !isAllowedPaymentMethod(method) {
		return models.Payment{}, 0, errors.New("payment_method tidak dikenali")
	}

	// 4. Create payment record for split payment
	now := time.Now()
	payment := models.Payment{
		TablesID:      order.TablesID,
		StaffID:       staffID,
		Total:         itemTotal,
		AmountPaid:    itemTotal,
		Change:        0,
		PaymentMethod: method,
		PaymentStatus: "paid",
		PaidAt:        &now,
	}

	// Calculate new order status
	newOrderStatus := order.Status
	if order.TotalPaid + itemTotal >= order.Total {
		newOrderStatus = "completed"
	}

	// 5. Process payment
	err := s.repo.ProcessItemPaymentTx(&payment, &order, itemIDs, newOrderStatus)

	// Return remaining
	remaining := order.Total - (order.TotalPaid + itemTotal)

	return payment, remaining, err
}

func (s *paymentService) DeletePayment(id int) error {
	// Simple delete; only admin/manager should call this via handler middleware
	return s.repo.Delete(id)
}
