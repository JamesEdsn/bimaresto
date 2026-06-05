package services

import (
	"bimaresto-backend/middleware"
	"bimaresto-backend/models"
	"bimaresto-backend/repositories"
	"errors"
	"log"
	"os"
	"strconv"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	GetRoles() ([]models.Role, error)
	GetStaff() ([]models.Staff, error)
	Register(fullName, password string, roleID int) (models.Staff, error)
	CreateStaff(fullName, username, email, phone, password string, roleID int, isActive bool) (models.Staff, error)
	UpdateStaff(id, fullName, username, email, phone, password string, roleID int, isActive bool) (models.Staff, error)
	DeleteStaff(id string) error
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

func (s *authService) GetRoles() ([]models.Role, error) {
	return s.repo.FindRoles()
}

func (s *authService) GetStaff() ([]models.Staff, error) {
	return s.repo.FindAllStaff()
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

func (s *authService) CreateStaff(fullName, username, email, phone, password string, roleID int, isActive bool) (models.Staff, error) {
	if fullName == "" || password == "" || roleID == 0 {
		return models.Staff{}, errors.New("full_name, password, dan role_id wajib diisi")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return models.Staff{}, errors.New("gagal hash password")
	}

	staff := models.Staff{
		FullName:     fullName,
		Username:     username,
		Email:        email,
		Phone:        phone,
		PasswordHash: string(hash),
		RoleID:       roleID,
		IsActive:     isActive,
	}

	err = s.repo.CreateStaff(&staff)
	if err != nil {
		return models.Staff{}, err
	}

	return s.repo.FindStaffByID(strconv.Itoa(staff.ID))
}

func (s *authService) UpdateStaff(id, fullName, username, email, phone, password string, roleID int, isActive bool) (models.Staff, error) {
	staff, err := s.repo.FindStaffByID(id)
	if err != nil {
		return models.Staff{}, errors.New("staff tidak ditemukan")
	}

	staff.FullName = fullName
	staff.Username = username
	staff.Email = email
	staff.Phone = phone
	staff.RoleID = roleID
	staff.IsActive = isActive

	if password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return models.Staff{}, errors.New("gagal hash password")
		}
		staff.PasswordHash = string(hash)
	}

	if err := s.repo.UpdateStaff(&staff); err != nil {
		return models.Staff{}, err
	}

	return s.repo.FindStaffByID(id)
}

func (s *authService) DeleteStaff(id string) error {
	staff, err := s.repo.FindStaffByID(id)
	if err != nil {
		return errors.New("staff tidak ditemukan")
	}
	return s.repo.DeleteStaff(&staff)
}

func (s *authService) Login(fullName, password string) (string, string, models.Staff, error) {
	staff, err := s.repo.FindStaffByFullName(fullName)
	if err != nil {
		log.Printf("auth: login failed find staff full_name=%s err=%v\n", fullName, err)
		return "", "", models.Staff{}, errors.New("nama atau password salah")
	}

	// Debug info: log staff id and hash length (do not log raw password)
	log.Printf("auth: found staff id=%d full_name=%s hash_len=%d\n", staff.ID, staff.FullName, len(staff.PasswordHash))

	if err := bcrypt.CompareHashAndPassword([]byte(staff.PasswordHash), []byte(password)); err != nil {
		log.Printf("auth: password mismatch for staff id=%d full_name=%s err=%v\n", staff.ID, staff.FullName, err)
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
