package services

import (
	"bimaresto-backend/models"
	"bimaresto-backend/repositories"
	"errors"
	"fmt"
)

type OrderItemDTO struct {
	MenuID   int    `json:"menu_id"`
	Quantity int    `json:"quantity"`
	Notes    string `json:"notes"`
}

type OfflineOrderDTO struct {
	TableID     int            `json:"table_id"`
	Source      string         `json:"source"`
	ClientRefID string         `json:"client_ref_id"`
	Items       []OrderItemDTO `json:"items"`
}

type SplitItemDTO struct {
	ItemID int `json:"item_id"`
	Qty    int `json:"qty"`
}

type OrderService interface {
	GetOrders() ([]models.Order, error)
	CreateOrder(tableID, staffID int, source, clientRefID string, itemsInput []OrderItemDTO) (*models.Order, error)
	SyncOfflineData(staffID int, ordersInput []OfflineOrderDTO) (int, int, []string)
	AddItems(orderID int, itemsInput []OrderItemDTO) (*models.Order, error)
	CancelOrder(orderID int) error
	CancelOrderItem(orderID, itemID int) (*models.Order, error)
	MoveTable(orderID, newTableID int) (*models.Order, error)
	SplitTable(oldOrderID, newTableID, staffID int, splitItems []SplitItemDTO, source string) (*models.Order, *models.Order, error)
	MergeOrders(targetOrderID, sourceOrderID int) (*models.Order, error)
	// UpdateOrderStatus updates the order status (pending, cooking, served, completed, cancelled)
	UpdateOrderStatus(orderID int, status string) (*models.Order, error)
}

type orderService struct {
	repo repositories.OrderRepository
}

func NewOrderService(repo repositories.OrderRepository) OrderService {
	return &orderService{repo}
}

func (s *orderService) GetOrders() ([]models.Order, error) {
	return s.repo.FindAll()
}

func (s *orderService) CreateOrder(tableID, staffID int, source, clientRefID string, itemsInput []OrderItemDTO) (*models.Order, error) {
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
		TablesID:    tableID,
		ClientRefID: clientRefID,
		StaffID:     staffID,
		OrderSource: source,
		Status:      "pending",
		Total:       subtotal + tax + serviceFee,
		OrderItems:  items,
	}

	// 3. Simpan via Repository
	return s.repo.CreateOrderTx(order)
}

func (s *orderService) SyncOfflineData(staffID int, ordersInput []OfflineOrderDTO) (int, int, []string) {

	synced := 0
	skipped := 0
	var errorsList []string

	for _, input := range ordersInput {
		_, err := s.CreateOrder(input.TableID, staffID, input.Source, input.ClientRefID, input.Items)
		if err != nil {
			skipped++
			errorsList = append(errorsList, fmt.Sprintf("table %d: %s", input.TableID, err.Error()))
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

	// Cek jika pesanan sudah selesai, tidak boleh tambah item
	if order.Status == "completed" {
		return nil, errors.New("tidak bisa menambah item pada pesanan yang sudah selesai")
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

	// Siapkan item baru dan hitung tambahan total
	var newOrderItems []models.OrderItem
	var additionalTotal float64

	for _, input := range itemsInput {
		m, exists := menuMap[input.MenuID]
		if !exists || !m.IsAvailable {
			return nil, fmt.Errorf("menu %s tidak tersedia", m.Name)
		}

		itemPrice := m.Price
		itemSubtotal := itemPrice * float64(input.Quantity)
		newOrderItems = append(newOrderItems, models.OrderItem{
			OrderID:   order.ID,
			MenuID:    m.ID,
			Quantity:  input.Quantity,
			UnitPrice: itemPrice,
			Subtotal:  itemSubtotal,
			Notes:     input.Notes,
			Status:    "pending",
		})
		additionalTotal += itemSubtotal
	}

	// Update total di objek Order
	order.Total += additionalTotal

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
	if order.Status == "completed" {
		return errors.New("tidak bisa membatalkan pesanan yang sudah selesai")
	}

	// Eksekusi hapus dan kosongkan meja
	return s.repo.DeleteOrderTx(order.ID, order.TablesID)
}

func (s *orderService) CancelOrderItem(orderID, itemID int) (*models.Order, error) {
	order, err := s.repo.FindByID(orderID)
	if err != nil {
		return nil, errors.New("pesanan tidak ditemukan")
	}
	if order.Status == "completed" {
		return nil, errors.New("tidak bisa mengubah pesanan yang sudah selesai")
	}

	var itemToRemove *models.OrderItem
	var remainingItems []models.OrderItem

	// Pisahkan mana item yang mau dihapus, mana yang dipertahankan
	for i := range order.OrderItems {
		if order.OrderItems[i].ID == itemID {
			itemToRemove = &order.OrderItems[i]
		} else {
			remainingItems = append(remainingItems, order.OrderItems[i])
		}
	}

	if itemToRemove == nil {
		return nil, errors.New("item tidak ditemukan dalam pesanan ini")
	}

	// Validasi Bisnis: Jika dapur sudah masak, tidak boleh batal!
	if itemToRemove.Status == "cooking" || itemToRemove.Status == "served" {
		return nil, errors.New("tidak bisa membatalkan masakan yang sudah diproses dapur")
	}

	// Hitung ulang total (tanpa harga itemToRemove)
	var newTotal float64
	for _, item := range remainingItems {
		newTotal += item.Subtotal
	}

	order.Total = newTotal

	// Eksekusi ke database
	err = s.repo.RemoveItemTx(&order, itemID)
	if err != nil {
		return nil, err
	}

	order.OrderItems = remainingItems // Update data memori agar respons JSON-nya benar
	return &order, nil
}

func (s *orderService) MoveTable(orderID, newTableID int) (*models.Order, error) {
	// Cari pesanan berdasarkan ID
	order, err := s.repo.FindByID(orderID)
	if err != nil {
		return nil, errors.New("pesanan tidak ditemukan")
	}

	// Validasi Bisnis
	if order.Status == "completed" {
		return nil, errors.New("pesanan sudah selesai, tidak bisa pindah meja")
	}
	if order.TablesID == newTableID {
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
	order.TablesID = newTableID

	return &order, nil
}

func (s *orderService) SplitTable(oldOrderID, newTableID, staffID int, splitItems []SplitItemDTO, source string) (*models.Order, *models.Order, error) {
	// Ambil pesanan lama
	oldOrder, err := s.repo.FindByID(oldOrderID)
	if err != nil {
		return nil, nil, errors.New("pesanan asal tidak ditemukan")
	}
	if oldOrder.Status == "completed" {
		return nil, nil, errors.New("pesanan sudah selesai")
	}

	// Siapkan penampung data
	var itemsToMove []models.OrderItem
	var itemsToUpdate []models.OrderItem
	var itemsToDelete []int
	var newTotal float64 = 0

	// Map pesanan lama agar mudah dicari
	oldItemsMap := make(map[int]models.OrderItem)
	for _, item := range oldOrder.OrderItems {
		oldItemsMap[item.ID] = item
	}

	// Proses setiap item yang mau dipindah
	for _, input := range splitItems {
		existingItem, exists := oldItemsMap[input.ItemID]
		if !exists {
			return nil, nil, errors.New("item tidak ditemukan di pesanan ini")
		}
		if input.Qty <= 0 || input.Qty > existingItem.Quantity {
			return nil, nil, errors.New("jumlah item (qty) tidak valid")
		}

		// Buat copy item untuk pesanan baru
		newItem := existingItem
		newItem.ID = 0 // Reset ID agar jadi record baru di DB
		newItem.Quantity = input.Qty
		newItem.Subtotal = newItem.UnitPrice * float64(input.Qty)
		itemsToMove = append(itemsToMove, newItem)
		newTotal += newItem.Subtotal

		// Cek apakah dipindah semua atau sebagian
		if input.Qty == existingItem.Quantity {
			itemsToDelete = append(itemsToDelete, existingItem.ID) // Pindah semua, hapus yang lama
		} else {
			existingItem.Quantity -= input.Qty // Kurangi porsi yang lama
			existingItem.Subtotal = existingItem.UnitPrice * float64(existingItem.Quantity)
			itemsToUpdate = append(itemsToUpdate, existingItem)
		}
	}

	// Kalkulasi Total untuk Order BARU (Meja 2)
	newOrder := models.Order{
		TablesID:    newTableID,
		StaffID:     staffID,
		Status:      "pending",
		OrderSource: source,
		Total:       newTotal,
		OrderItems:  itemsToMove,
	}

	// Kalkulasi Total untuk Order LAMA (Meja 1)
	oldOrder.Total -= newTotal // Kurangi langsung dari total lama
	// oldOrder.OrderItems is updated via repository

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
	if targetOrder.Status == "completed" || sourceOrder.Status == "completed" {
		return nil, errors.New("tidak bisa menggabungkan pesanan yang sudah selesai")
	}

	// Gabungkan total
	targetOrder.Total += sourceOrder.Total

	// Gabungkan array items di memory agar response JSON langsung menampilkan hasil gabungan
	targetOrder.OrderItems = append(targetOrder.OrderItems, sourceOrder.OrderItems...)

	// Eksekusi ke database
	err = s.repo.MergeOrdersTx(&targetOrder, &sourceOrder)
	if err != nil {
		return nil, err
	}

	return &targetOrder, nil
}

func (s *orderService) UpdateOrderStatus(orderID int, status string) (*models.Order, error) {
	order, err := s.repo.FindByID(orderID)
	if err != nil {
		return nil, errors.New("pesanan tidak ditemukan")
	}

	// Do not allow changing status on completed orders except to kept value
	if order.Status == "completed" && status != "completed" {
		return nil, errors.New("tidak bisa mengubah status pesanan yang sudah selesai")
	}

	// Basic validation of allowed statuses
	allowed := map[string]bool{"pending": true, "cooking": true, "served": true, "completed": true, "cancelled": true}
	if !allowed[status] {
		return nil, errors.New("status tidak valid")
	}

	if err := s.repo.UpdateOrderStatus(&order, status); err != nil {
		return nil, err
	}

	// Refresh order from DB
	updated, err := s.repo.FindByID(orderID)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}
