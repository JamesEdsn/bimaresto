package repositories

import (
	"bimaresto-backend/models"

	"gorm.io/gorm"
)

type AuthRepository interface {
	// Staff operations
	CreateStaff(staff *models.Staff) error
	FindStaffByFullName(fullName string) (models.Staff, error)

	// Token operations
	CreateRefreshToken(token *models.RefreshToken) error
	FindRefreshToken(tokenStr string) (models.RefreshToken, error)
	DeleteRefreshToken(token *models.RefreshToken) error
	DeleteRefreshTokensByStaffID(staffID int) error
}

type authRepository struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) AuthRepository {
	return &authRepository{db}
}

func (r *authRepository) CreateStaff(staff *models.Staff) error {
	return r.db.Create(staff).Error
}

func (r *authRepository) FindStaffByFullName(fullName string) (models.Staff, error) {
	var staff models.Staff
	err := r.db.Preload("Role").Where("full_name = ? AND is_active = true", fullName).First(&staff).Error
	return staff, err
}

func (r *authRepository) CreateRefreshToken(token *models.RefreshToken) error {
	return r.db.Create(token).Error
}

func (r *authRepository) FindRefreshToken(tokenStr string) (models.RefreshToken, error) {
	var rt models.RefreshToken
	// Pastikan kita mengambil token yang belum expired
	err := r.db.Where("token = ? AND expires_at > NOW()", tokenStr).First(&rt).Error
	return rt, err
}

func (r *authRepository) DeleteRefreshToken(token *models.RefreshToken) error {
	return r.db.Delete(token).Error
}

func (r *authRepository) DeleteRefreshTokensByStaffID(staffID int) error {
	return r.db.Where("staff_id = ?", staffID).Delete(&models.RefreshToken{}).Error
}
