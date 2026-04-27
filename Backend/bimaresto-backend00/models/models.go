package models

import "time"

// ── Roles ─────────────────────────────────────────────────────────────────────
// 1 = admin, 2 = kasir, 3 = kitchen, 4 = manager

type Role struct {
	ID   int    `gorm:"primaryKey" json:"id"`
	Name string `gorm:"not null" json:"name"`
}

// ── Staff ─────────────────────────────────────────────────────────────────────

type Staff struct {
	ID           int       `gorm:"primaryKey" json:"id"`
	RoleID       int       `json:"role_id"`
	Role         Role      `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	FullName     string    `gorm:"not null" json:"full_name"`
	PasswordHash string    `gorm:"not null" json:"-"`
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
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
	ID   int    `gorm:"primaryKey" json:"id"`
	Name string `gorm:"not null" json:"name"`
}

// ── Menu ──────────────────────────────────────────────────────────────────────

type Menu struct {
	ID          int      `gorm:"primaryKey" json:"id"`
	CategoryID  int      `json:"category_id"`
	Category    Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Name        string   `gorm:"not null" json:"name"`
	Description string   `json:"description"`
	Price       float64  `gorm:"not null" json:"price"`
	IsAvailable bool     `gorm:"default:true" json:"is_available"`
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
	TableID     int         `json:"table_id"`
	Table       Table       `gorm:"foreignKey:TableID" json:"table,omitempty"`
	StaffID     int         `json:"staff_id"`
	Staff       Staff       `gorm:"foreignKey:StaffID" json:"staff,omitempty"`
	Source      string      `gorm:"default:'dine_in'" json:"source"` // dine_in, takeaway, online
	Status      string      `gorm:"default:'pending'" json:"status"` // pending, paid, cancelled
	Notes       string      `json:"notes"`
	Subtotal    float64     `gorm:"default:0" json:"subtotal"`
	Tax         float64     `gorm:"default:0" json:"tax"`
	ServiceFee  float64     `gorm:"default:0" json:"service_fee"`
	Total       float64     `gorm:"default:0" json:"total"`
	TotalPaid   float64     `gorm:"default:0" json:"total_paid"`
	ClientRefID string      `gorm:"uniqueIndex" json:"client_ref_id"` // untuk dedup offline sync
	Items       []OrderItem `gorm:"foreignKey:OrderID" json:"items,omitempty"`
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
	StaffID       int        `json:"staff_id"`
	Total         float64    `json:"total"`
	AmountPaid    float64    `json:"amount_paid"`
	Change        float64    `json:"change"`
	PaymentMethod string     `json:"payment_method"` // cash, qris, debit, credit
	PaidAt        *time.Time `json:"paid_at"`
}
