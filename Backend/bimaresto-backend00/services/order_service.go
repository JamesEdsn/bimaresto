package services

import (
	"bimaresto-backend/models"
	"bimaresto-backend/repositories"
	"errors"
	"fmt"
)

type OrderItemDTO struct {
	MenuID   int
	Quantity int
	Notes    string
}

type OrderService interface {
	CreateOrder(tableID, staffID int, source, notes, clientRefID string, itemsInput []OrderItemDTO) (*models.Order, error)
	SyncOfflineData(staffID int, ordersInput []struct {
		TableID     int            `json:"table_id"`
		Source      string         `json:"source"`
		Notes       string         `json:"notes"`
		ClientRefID string         `json:"client_ref_id"`
		Items       []OrderItemDTO `json:"items"`
	}) (int, int, []string)
}

type orderService struct {
	repo repositories.OrderRepository
}

func NewOrderService(repo repositories.OrderRepository) OrderService {
	return &orderService{repo}
}

func (s *orderService) CreateOrder(tableID, staffID int, source, notes, clientRefID string, itemsInput []OrderItemDTO) (*models.Order, error) {
	if tableID == 0 || clientRefID == "" || len(itemsInput) == 0 {
		return nil, errors.New("table_id, client_ref_id, dan items wajib diisi")
	}

	// 1. Ambil semua menu sekaligus (O(1) lookup)
	var menuIDs []int
	for _, item := range itemsInput {
		menuIDs = append(menuIDs, item.MenuID)
	}

	menus, err := s.repo.FindMenusByIDs(menuIDs)
	if err != nil {
		return nil, errors.New("gagal mengambil data menu")
	}

	menuMap := make(map[int]models.Menu)
	for _, m := range menus {
		menuMap[m.ID] = m
	}

	// 2. Kalkulasi harga
	var subtotal float64
	var items []models.OrderItem

	for _, i := range itemsInput {
		menu, exists := menuMap[i.MenuID]
		if !exists {
			return nil, fmt.Errorf("menu id %d tidak ditemukan", i.MenuID)
		}
		if !menu.IsAvailable {
			return nil, fmt.Errorf("menu %s sedang tidak tersedia", menu.Name)
		}

		itemSubtotal := menu.Price * float64(i.Quantity)
		subtotal += itemSubtotal

		items = append(items, models.OrderItem{
			MenuID:    i.MenuID,
			Quantity:  i.Quantity,
			UnitPrice: menu.Price,
			Subtotal:  itemSubtotal,
			Notes:     i.Notes,
			Status:    "pending",
		})
	}

	tax := subtotal * 0.10
	serviceFee := subtotal * 0.05

	order := &models.Order{
		TableID:     tableID,
		StaffID:     staffID,
		Source:      source,
		Notes:       notes,
		ClientRefID: clientRefID,
		Status:      "pending",
		Subtotal:    subtotal,
		Tax:         tax,
		ServiceFee:  serviceFee,
		Total:       subtotal + tax + serviceFee,
		Items:       items,
	}

	// 3. Simpan via Repository
	return s.repo.CreateOrderTx(order)
}

func (s *orderService) SyncOfflineData(staffID int, ordersInput []struct {
	TableID     int            `json:"table_id"`
	Source      string         `json:"source"`
	Notes       string         `json:"notes"`
	ClientRefID string         `json:"client_ref_id"`
	Items       []OrderItemDTO `json:"items"`
}) (int, int, []string) {

	synced := 0
	skipped := 0
	var errorsList []string

	for _, input := range ordersInput {
		_, err := s.CreateOrder(input.TableID, staffID, input.Source, input.Notes, input.ClientRefID, input.Items)
		if err != nil {
			if err.Error() == "order dengan client_ref_id ini sudah ada" {
				skipped++
			} else {
				errorsList = append(errorsList, input.ClientRefID+": "+err.Error())
			}
		} else {
			synced++
		}
	}

	return synced, skipped, errorsList
}
