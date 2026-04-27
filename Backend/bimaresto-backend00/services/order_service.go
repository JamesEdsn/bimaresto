package services

import (
	"bimaresto-backend/models"
	"bimaresto-backend/repositories"
	"errors"
	"fmt"

	"github.com/google/uuid"
)

type OrderItemDTO struct {
	MenuID   int    `json:"menu_id"`
	Quantity int    `json:"quantity"`
	Notes    string `json:"notes"`
}

type SplitItemDTO struct {
	ItemID int `json:"item_id"`
	Qty    int `json:"qty"`
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
	AddItems(orderID int, itemsInput []OrderItemDTO) (*models.Order, error)
	CancelOrder(orderID int) error
	CancelOrderItem(orderID, itemID int) (*models.Order, error)
	MoveTable(orderID, newTableID int) (*models.Order, error)
	SplitTable(oldOrderID, newTableID, staffID int, splitItems []SplitItemDTO, source string) (*models.Order, *models.Order, error)
	MergeOrders(targetOrderID, sourceOrderID int) (*models.Order, error)
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

func (s *orderService) AddItems(orderID int, itemsInput []OrderItemDTO) (*models.Order, error) {
	// Cari pesanan lama (Gunakan ID dari params)
	order, err := s.repo.FindByID(orderID)
	if err != nil {
		return nil, errors.New("pesanan tidak ditemukan")
	}

	// Cek jika pesanan sudah lunas, tidak boleh tambah item
	if order.Status == "paid" {
		return nil, errors.New("tidak bisa menambah item pada pesanan yang sudah lunas")
	}

	// Ambil data Menu untuk validasi harga & ketersediaan
	var menuIDs []int
	for _, item := range itemsInput {
		menuIDs = append(menuIDs, item.MenuID)
	}
	menus, _ := s.repo.FindMenusByIDs(menuIDs)
	menuMap := make(map[int]models.Menu)
	for _, m := range menus {
		menuMap[m.ID] = m
	}

	// Siapkan item baru dan hitung tambahan subtotal
	var newOrderItems []models.OrderItem
	var additionalSubtotal float64

	for _, input := range itemsInput {
		m, exists := menuMap[input.MenuID]
		if !exists || !m.IsAvailable {
			return nil, fmt.Errorf("menu %s tidak tersedia", m.Name)
		}

		itemPrice := m.Price
		newOrderItems = append(newOrderItems, models.OrderItem{
			OrderID:   order.ID,
			MenuID:    m.ID,
			Quantity:  input.Quantity,
			UnitPrice: itemPrice,
			Status:    "pending", // Item baru masuk antrean dapur
		})
		additionalSubtotal += itemPrice * float64(input.Quantity)
	}

	// Update kalkulasi Total di objek Order
	order.Subtotal += additionalSubtotal
	order.Tax = order.Subtotal * 0.10
	order.ServiceFee = order.Subtotal * 0.05
	order.Total = order.Subtotal + order.Tax + order.ServiceFee

	// Simpan ke database via Repository
	err = s.repo.AddItemsToOrderTx(&order, newOrderItems)
	if err != nil {
		return nil, err
	}

	return &order, nil
}

func (s *orderService) CancelOrder(orderID int) error {
	order, err := s.repo.FindByID(orderID)
	if err != nil {
		return errors.New("pesanan tidak ditemukan")
	}
	if order.Status == "paid" {
		return errors.New("tidak bisa membatalkan pesanan yang sudah lunas")
	}

	// Eksekusi hapus dan kosongkan meja
	return s.repo.DeleteOrderTx(order.ID, order.TableID)
}

func (s *orderService) CancelOrderItem(orderID, itemID int) (*models.Order, error) {
	order, err := s.repo.FindByID(orderID)
	if err != nil {
		return nil, errors.New("pesanan tidak ditemukan")
	}
	if order.Status == "paid" {
		return nil, errors.New("tidak bisa mengubah pesanan yang sudah lunas")
	}

	var itemToRemove *models.OrderItem
	var remainingItems []models.OrderItem

	// Pisahkan mana item yang mau dihapus, mana yang dipertahankan
	for _, item := range order.Items {
		if item.ID == itemID {
			itemToRemove = &item
		} else {
			remainingItems = append(remainingItems, item)
		}
	}

	if itemToRemove == nil {
		return nil, errors.New("item tidak ditemukan dalam pesanan ini")
	}

	// Validasi Bisnis: Jika dapur sudah masak, tidak boleh batal!
	if itemToRemove.Status == "processing" || itemToRemove.Status == "ready" || itemToRemove.Status == "served" {
		return nil, errors.New("tidak bisa membatalkan masakan yang sudah diproses dapur")
	}

	// Hitung ulang uang (tanpa harga itemToRemove)
	var newSubtotal float64
	for _, item := range remainingItems {
		newSubtotal += item.UnitPrice * float64(item.Quantity)
	}

	order.Subtotal = newSubtotal
	order.Tax = newSubtotal * 0.10
	order.ServiceFee = newSubtotal * 0.05
	order.Total = newSubtotal + order.Tax + order.ServiceFee

	// Eksekusi ke database
	err = s.repo.RemoveItemTx(&order, itemID)
	if err != nil {
		return nil, err
	}

	order.Items = remainingItems // Update data memori agar respons JSON-nya benar
	return &order, nil
}

func (s *orderService) MoveTable(orderID, newTableID int) (*models.Order, error) {
	// Cari pesanan berdasarkan ID
	order, err := s.repo.FindByID(orderID)
	if err != nil {
		return nil, errors.New("pesanan tidak ditemukan")
	}

	// Validasi Bisnis
	if order.Status == "paid" {
		return nil, errors.New("pesanan sudah lunas, tidak bisa pindah meja")
	}
	if order.TableID == newTableID {
		return nil, errors.New("meja tujuan sama dengan meja saat ini")
	}
	if newTableID <= 0 {
		return nil, errors.New("ID meja tujuan tidak valid")
	}

	// Eksekusi pemindahan melalui Repository
	err = s.repo.MoveTableTx(&order, newTableID)
	if err != nil {
		return nil, err
	}

	// Update data meja di memori agar respons JSON mengirimkan ID meja yang baru
	order.TableID = newTableID

	return &order, nil
}

func (s *orderService) SplitTable(oldOrderID, newTableID, staffID int, splitItems []SplitItemDTO, source string) (*models.Order, *models.Order, error) {
	// Ambil pesanan lama
	oldOrder, err := s.repo.FindByID(oldOrderID)
	if err != nil {
		return nil, nil, errors.New("pesanan asal tidak ditemukan")
	}
	if oldOrder.Status == "paid" {
		return nil, nil, errors.New("pesanan sudah lunas")
	}

	// Siapkan penampung data
	var itemsToMove []models.OrderItem
	var itemsToUpdate []models.OrderItem
	var itemsToDelete []int
	var newSubtotal float64 = 0

	// Map pesanan lama agar mudah dicari
	oldItemsMap := make(map[int]models.OrderItem)
	for _, item := range oldOrder.Items {
		oldItemsMap[item.ID] = item
	}

	// Proses setiap item yang mau dipindah
	for _, input := range splitItems {
		existingItem, exists := oldItemsMap[input.ItemID]
		if !exists {
			return nil, nil, errors.New("item tidak ditemukan di pesanan ini")
		}
		if existingItem.IsPaid {
			return nil, nil, errors.New("tidak bisa memindah item yang sudah dibayar")
		}
		if input.Qty <= 0 || input.Qty > existingItem.Quantity {
			return nil, nil, errors.New("jumlah item (qty) tidak valid")
		}

		// Buat copy item untuk pesanan baru
		newItem := existingItem
		newItem.ID = 0 // Reset ID agar jadi record baru di DB
		newItem.Quantity = input.Qty
		itemsToMove = append(itemsToMove, newItem)
		newSubtotal += newItem.UnitPrice * float64(newItem.Quantity)

		// Cek apakah dipindah semua atau sebagian
		if input.Qty == existingItem.Quantity {
			itemsToDelete = append(itemsToDelete, existingItem.ID) // Pindah semua, hapus yang lama
		} else {
			existingItem.Quantity -= input.Qty // Kurangi porsi yang lama
			itemsToUpdate = append(itemsToUpdate, existingItem)
		}
	}

	// Kalkulasi Uang untuk Order BARU (Meja 2)
	newOrder := models.Order{
		TableID:     newTableID,
		StaffID:     staffID,
		Status:      "unpaid",
		Source:      source,
		ClientRefID: uuid.New().String(), // Generate UUID unik
		Subtotal:    newSubtotal,
		Tax:         newSubtotal * 0.10,
		ServiceFee:  newSubtotal * 0.05,
	}
	newOrder.Total = newOrder.Subtotal + newOrder.Tax + newOrder.ServiceFee

	// Kalkulasi Uang untuk Order LAMA (Meja 1)
	oldOrder.Subtotal -= newSubtotal // Kurangi langsung dari subtotal lama
	oldOrder.Tax = oldOrder.Subtotal * 0.10
	oldOrder.ServiceFee = oldOrder.Subtotal * 0.05
	oldOrder.Total = oldOrder.Subtotal + oldOrder.Tax + oldOrder.ServiceFee

	// Eksekusi ke database
	err = s.repo.SplitTableTx(&oldOrder, &newOrder, itemsToMove, itemsToUpdate, itemsToDelete)
	if err != nil {
		return nil, nil, err
	}

	return &oldOrder, &newOrder, nil
}

func (s *orderService) MergeOrders(targetOrderID, sourceOrderID int) (*models.Order, error) {
	if targetOrderID == sourceOrderID {
		return nil, errors.New("tidak bisa menggabungkan pesanan ke meja yang sama")
	}

	// Ambil pesanan Target dan Source
	targetOrder, err := s.repo.FindByID(targetOrderID)
	if err != nil {
		return nil, errors.New("pesanan target tidak ditemukan")
	}

	sourceOrder, err := s.repo.FindByID(sourceOrderID)
	if err != nil {
		return nil, errors.New("pesanan asal tidak ditemukan")
	}

	// Validasi Bisnis
	if targetOrder.Status == "paid" || sourceOrder.Status == "paid" {
		return nil, errors.New("tidak bisa menggabungkan pesanan yang sudah lunas")
	}

	// Gabungkan kalkulasi uang
	targetOrder.Subtotal += sourceOrder.Subtotal
	targetOrder.Tax = targetOrder.Subtotal * 0.10
	targetOrder.ServiceFee = targetOrder.Subtotal * 0.05
	targetOrder.Total = targetOrder.Subtotal + targetOrder.Tax + targetOrder.ServiceFee

	// Gabungkan array items di memory agar response JSON langsung menampilkan hasil gabungan
	targetOrder.Items = append(targetOrder.Items, sourceOrder.Items...)

	// Eksekusi ke database
	err = s.repo.MergeOrdersTx(&targetOrder, &sourceOrder)
	if err != nil {
		return nil, err
	}

	return &targetOrder, nil
}
