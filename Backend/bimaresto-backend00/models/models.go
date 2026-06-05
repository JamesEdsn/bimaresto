package models

import "time"

// ── Roles ─────────────────────────────────────────────────────────────────────
// 1 = admin, 2 = kasir, 3 = kitchen, 4 = manager

type Role struct {
	ID   int    `gorm:"primaryKey" json:"id"`
	Name string `gorm:"unique;not null" json:"name"`
}

// ── Staff ─────────────────────────────────────────────────────────────────────

type Staff struct {
	ID           int       `gorm:"primaryKey" json:"id"`
	RoleID       int       `json:"role_id"`
	Role         Role      `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	FullName     string    `gorm:"not null" json:"full_name"`
	Username     string    `gorm:"unique" json:"username"`
	Email        string    `gorm:"unique" json:"email"`
	Phone        string    `json:"phone"`
	PasswordHash string    `gorm:"not null" json:"-"`
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// ── Refresh Token ─────────────────────────────────────────────────────────────

type RefreshToken struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	StaffID   int       `gorm:"index" json:"staff_id"`
	Token     string    `gorm:"not null" json:"-"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

// ── Category ──────────────────────────────────────────────────────────────────

type Category struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

// ── Menu ──────────────────────────────────────────────────────────────────────

type Menu struct {
	ID           int      `gorm:"primaryKey" json:"id"`
	CategoriesID int      `json:"category_id"`
	Category     Category `gorm:"foreignKey:CategoriesID" json:"category,omitempty"`
	Name         string   `gorm:"not null" json:"name"`
	Description  string   `json:"description"`
	Price        float64  `gorm:"not null" json:"price"`
	IsAvailable  bool     `gorm:"default:true" json:"is_available"`
	Image        string   `gorm:"type:text" json:"image"`
}

// ── Table ─────────────────────────────────────────────────────────────────────

type Table struct {
	ID          int    `gorm:"primaryKey" json:"id"`
	TableNumber string `gorm:"not null" json:"table_number"`
	Capacity    int    `gorm:"default:4" json:"capacity"`
	Status      string `gorm:"default:'available'" json:"status"` // available, occupied, reserved
}

// ── Order ─────────────────────────────────────────────────────────────────────

type Order struct {
	ID          int         `gorm:"primaryKey" json:"id"`
	TablesID    int         `json:"tables_id"`
	Table       Table       `gorm:"foreignKey:TablesID" json:"table,omitempty"`
	StaffID     int         `json:"staff_id"`
	Staff       Staff       `gorm:"foreignKey:StaffID" json:"staff,omitempty"`
	OrderSource string      `gorm:"default:'dine_in'" json:"source"`
	Status      string      `gorm:"default:'pending'" json:"status"`
	Notes       string      `json:"notes"`
	Subtotal    float64     `gorm:"default:0" json:"subtotal"`
	Tax         float64     `gorm:"default:0" json:"tax"`
	ServiceFee  float64     `gorm:"default:0" json:"service_fee"`
	Total       float64     `gorm:"default:0" json:"total"`
	TotalPaid   float64     `gorm:"default:0" json:"total_paid"`
	ClientRefID string      `gorm:"uniqueIndex" json:"client_ref_id"`
	OrderItems  []OrderItem `gorm:"foreignKey:OrderID" json:"order_items,omitempty"`
	CreatedAt   time.Time   `json:"created_at"`
}

// ── Order Item ────────────────────────────────────────────────────────────────

type OrderItem struct {
	ID        int     `gorm:"primaryKey" json:"id"`
	OrderID   int     `gorm:"index" json:"order_id"`
	MenuID    int     `json:"menu_id"`
	Menu      Menu    `gorm:"foreignKey:MenuID" json:"menu,omitempty"`
	Quantity  int     `json:"quantity"`
	UnitPrice float64 `json:"unit_price"`
	Subtotal  float64 `json:"subtotal"`
	Notes     string  `json:"notes"`
	Status    string  `gorm:"default:'pending'" json:"status"` // pending, processing, ready, served
	IsPaid    bool    `gorm:"default:false" json:"is_paid"`
}

// ── Payment ───────────────────────────────────────────────────────────────────

type Payment struct {
	ID            int        `gorm:"primaryKey" json:"id"`
	OrderID       int        `gorm:"index" json:"order_id"`
	Order         Order      `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	TablesID      int        `json:"tables_id"`
	StaffID       int        `json:"staff_id"`
	Total         float64    `json:"total"`
	AmountPaid    float64    `json:"amount_paid"`
	Change        float64    `json:"change"`
	PaymentMethod string     `json:"payment_method"` // cash, qris, debit, credit
	PaymentStatus string     `json:"payment_status"`
	PaidAt        *time.Time `json:"paid_at"`
}

// ── SplitBill & Promo (used in migrations/tests) ─────────────────────────────

type SplitBill struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	OrderID   int       `json:"order_id"`
	Amount    float64   `json:"amount"`
	CreatedAt time.Time `json:"created_at"`
}

type Promo struct {
	ID           int       `gorm:"primaryKey" json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	PromoType    string    `gorm:"default:'bundle'" json:"promo_type"`
	BuyMenuID    int       `json:"buy_menu_id"`
	BuyMenu      Menu      `gorm:"foreignKey:BuyMenuID" json:"buy_menu,omitempty"`
	FreeMenuID   int       `json:"free_menu_id"`
	FreeMenu     Menu      `gorm:"foreignKey:FreeMenuID" json:"free_menu,omitempty"`
	BuyQuantity  int       `gorm:"default:1" json:"buy_quantity"`
	FreeQuantity int       `gorm:"default:1" json:"free_quantity"`
	StartDate    time.Time `json:"start_date"`
	EndDate      time.Time `json:"end_date"`
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	Code         string    `json:"code,omitempty"`
	Discount     float64   `json:"discount,omitempty"`
	Active       bool      `json:"active,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}
