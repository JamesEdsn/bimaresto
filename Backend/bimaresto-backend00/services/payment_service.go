package services

import (
	"bimaresto-backend/models"
	"bimaresto-backend/repositories"
	"errors"
	"time"
)

type PaymentService interface {
	GetBill(orderID string) (models.Order, error)
	ProcessPayment(orderID, staffID int, amountPaid float64, method string) (models.Payment, float64, string, error)
	ProcessItemSplit(orderID int, itemIDs []int, staffID int, method string) (models.Payment, float64, error)
}

type paymentService struct {
	repo repositories.PaymentRepository
}

func NewPaymentService(repo repositories.PaymentRepository) PaymentService {
	return &paymentService{repo}
}

func (s *paymentService) GetBill(orderID string) (models.Order, error) {
	return s.repo.FindOrderWithItems(orderID)
}

func (s *paymentService) ProcessPayment(orderID, staffID int, amountPaid float64, method string) (models.Payment, float64, string, error) {
	if amountPaid <= 0 || method == "" {
		return models.Payment{}, 0, "", errors.New("amount_paid dan payment_method wajib diisi")
	}

	allowed := map[string]bool{"cash": true, "qris": true, "debit": true, "credit": true}
	if !allowed[method] {
		return models.Payment{}, 0, "", errors.New("payment_method harus: cash, qris, debit, credit")
	}

	order, err := s.repo.FindOrderForPayment(orderID)
	if err != nil {
		return models.Payment{}, 0, "", errors.New("order tidak ditemukan")
	}

	if order.Status == "paid" {
		return models.Payment{}, 0, "", errors.New("order sudah lunas sepenuhnya")
	}

	remainingBalance := order.Total - order.TotalPaid
	var change float64 = 0
	var appliedAmount float64 = amountPaid

	if amountPaid >= remainingBalance {
		change = amountPaid - remainingBalance
		appliedAmount = remainingBalance
	}

	order.TotalPaid += appliedAmount
	newStatus := "partially_paid"
	freeTable := false

	if order.TotalPaid >= order.Total {
		newStatus = "paid"
		freeTable = true
	}

	now := time.Now()
	payment := models.Payment{
		OrderID:       order.ID,
		StaffID:       staffID,
		Total:         order.Total,
		AmountPaid:    amountPaid,
		Change:        change,
		PaymentMethod: method,
		PaidAt:        &now,
	}

	err = s.repo.ProcessPaymentTx(&payment, &order, newStatus, freeTable)

	newRemainingBalance := order.Total - order.TotalPaid

	return payment, newRemainingBalance, newStatus, err
}

func (s *paymentService) ProcessItemSplit(orderID int, itemIDs []int, staffID int, method string) (models.Payment, float64, error) {
	// 1. Ambil data Order
	order, _ := s.repo.FindOrderForPayment(orderID)

	// 2. Ambil item-item yang mau dibayar
	items, _ := s.repo.FindItemsByIDs(itemIDs)

	// 3. Hitung Subtotal dari item terpilih saja
	var subtotalItem float64
	for _, item := range items {
		if item.IsPaid {
			return models.Payment{}, 0, errors.New("beberapa item sudah pernah dibayar")
		}
		subtotalItem += (item.UnitPrice * float64(item.Quantity))
	}

	// 4. Hitung Tax & Service proporsional (mengikuti UI-mu: Pajak 10%)
	taxItem := subtotalItem * 0.10
	serviceItem := subtotalItem * 0.05
	totalItem := subtotalItem + taxItem + serviceItem

	// 5. Update status di memori
	order.TotalPaid += totalItem

	newStatus := "partially_paid"
	freeTable := false
	if order.TotalPaid >= (order.Total - 1) { // Toleransi pembulatan Rp 1
		newStatus = "paid"
		freeTable = true
	}

	now := time.Now()
	payment := models.Payment{
		OrderID:       order.ID,
		StaffID:       staffID,
		AmountPaid:    totalItem,
		PaymentMethod: method,
		PaidAt:        &now,
	}

	err := s.repo.ProcessItemPaymentTx(&payment, &order, itemIDs, newStatus, freeTable)
	remaining := order.Total - order.TotalPaid

	return payment, remaining, err
}
