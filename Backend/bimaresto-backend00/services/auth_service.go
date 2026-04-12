package services

import (
	"bimaresto-backend/middleware"
	"bimaresto-backend/models"
	"bimaresto-backend/repositories"
	"errors"
	"os"
	"strconv"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(fullName, password string, roleID int) (models.Staff, error)
	Login(fullName, password string) (string, string, models.Staff, error)
	Refresh(refreshTokenStr string) (string, string, error)
	Logout(staffID int) error
}

type authService struct {
	repo repositories.AuthRepository
}

func NewAuthService(repo repositories.AuthRepository) AuthService {
	return &authService{repo}
}

func (s *authService) Register(fullName, password string, roleID int) (models.Staff, error) {
	if fullName == "" || password == "" || roleID == 0 {
		return models.Staff{}, errors.New("full_name, password, dan role_id wajib diisi")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return models.Staff{}, errors.New("gagal hash password")
	}

	staff := models.Staff{
		FullName:     fullName,
		PasswordHash: string(hash),
		RoleID:       roleID,
	}

	err = s.repo.CreateStaff(&staff)
	return staff, err
}

func (s *authService) Login(fullName, password string) (string, string, models.Staff, error) {
	staff, err := s.repo.FindStaffByFullName(fullName)
	if err != nil {
		return "", "", models.Staff{}, errors.New("nama atau password salah")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(staff.PasswordHash), []byte(password)); err != nil {
		return "", "", models.Staff{}, errors.New("nama atau password salah")
	}

	accessToken, refreshToken, err := s.generateTokens(staff.ID, staff.RoleID)
	if err != nil {
		return "", "", models.Staff{}, err
	}

	return accessToken, refreshToken, staff, nil
}

func (s *authService) Refresh(refreshTokenStr string) (string, string, error) {
	// 1. Cari token di database
	rt, err := s.repo.FindRefreshToken(refreshTokenStr)
	if err != nil {
		return "", "", errors.New("refresh token tidak valid atau sudah expired")
	}

	// 2. Validasi signature JWT-nya
	claims, err := middleware.ValidateToken(refreshTokenStr)
	if err != nil || claims == nil {
		return "", "", errors.New("refresh token tidak valid")
	}

	// 3. Hapus token lama (Rotate)
	_ = s.repo.DeleteRefreshToken(&rt)

	// 4. Buat token baru
	return s.generateTokens(claims.StaffID, claims.RoleID)
}

func (s *authService) Logout(staffID int) error {
	return s.repo.DeleteRefreshTokensByStaffID(staffID)
}

// Helper untuk generate access & refresh token
func (s *authService) generateTokens(staffID, roleID int) (string, string, error) {
	accessToken, err := middleware.GenerateAccessToken(staffID, roleID)
	if err != nil {
		return "", "", errors.New("gagal buat access token")
	}

	refreshToken, err := middleware.GenerateRefreshToken(staffID, roleID)
	if err != nil {
		return "", "", errors.New("gagal buat refresh token")
	}

	days, _ := strconv.Atoi(os.Getenv("JWT_REFRESH_EXPIRE_DAYS"))
	if days == 0 {
		days = 7
	}

	rt := models.RefreshToken{
		StaffID:   staffID,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(time.Duration(days) * 24 * time.Hour),
	}

	if err := s.repo.CreateRefreshToken(&rt); err != nil {
		return "", "", errors.New("gagal menyimpan refresh token")
	}

	return accessToken, refreshToken, nil
}
