package handlers

import (
	"bimaresto-backend/middleware"
	"bimaresto-backend/services"
	"bimaresto-backend/utils"

	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	service services.AuthService
}

func NewAuthHandler(service services.AuthService) *AuthHandler {
	return &AuthHandler{service}
}

func (h *AuthHandler) GetRoles(c *fiber.Ctx) error {
	roles, err := h.service.GetRoles()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data role")
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil mengambil data role", roles)
}

func (h *AuthHandler) GetStaff(c *fiber.Ctx) error {
	staff, err := h.service.GetStaff()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal mengambil data staff")
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil mengambil data staff", staff)
}

func (h *AuthHandler) RegisterStaff(c *fiber.Ctx) error {
	var body struct {
		FullName string `json:"full_name"`
		Password string `json:"password"`
		RoleID   int    `json:"role_id"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "request tidak valid"})
	}

	staff, err := h.service.Register(body.FullName, body.Password, body.RoleID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "Staff berhasil didaftarkan", fiber.Map{
		"id": staff.ID,
	})
}

func (h *AuthHandler) CreateStaff(c *fiber.Ctx) error {
	var body struct {
		FullName string `json:"full_name"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Password string `json:"password"`
		RoleID   int    `json:"role_id"`
		IsActive bool   `json:"is_active"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	staff, err := h.service.CreateStaff(body.FullName, body.Username, body.Email, body.Phone, body.Password, body.RoleID, body.IsActive)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "Staff berhasil dibuat", staff)
}

func (h *AuthHandler) UpdateStaff(c *fiber.Ctx) error {
	var body struct {
		FullName string `json:"full_name"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Password string `json:"password"`
		RoleID   int    `json:"role_id"`
		IsActive bool   `json:"is_active"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	staff, err := h.service.UpdateStaff(c.Params("id"), body.FullName, body.Username, body.Email, body.Phone, body.Password, body.RoleID, body.IsActive)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Staff berhasil diperbarui", staff)
}

func (h *AuthHandler) DeleteStaff(c *fiber.Ctx) error {
	if err := h.service.DeleteStaff(c.Params("id")); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Staff berhasil dihapus", nil)
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var body struct {
		FullName string `json:"full_name"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&body); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	accessToken, refreshToken, staff, err := h.service.Login(body.FullName, body.Password)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusUnauthorized, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Login berhasil", fiber.Map{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"expires_in":    15 * 60, // 15 menit
		"staff": fiber.Map{
			"id":        staff.ID,
			"full_name": staff.FullName,
			"role_id":   staff.RoleID,
			"role":      staff.Role.Name,
		},
	})
}

func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	var body struct {
		RefreshToken string `json:"refresh_token"`
	}

	if err := c.BodyParser(&body); err != nil || body.RefreshToken == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Refresh token wajib diisi")
	}

	newAccess, newRefresh, err := h.service.Refresh(body.RefreshToken)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusUnauthorized, err.Error())
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Token berhasil diperbarui", fiber.Map{
		"access_token":  newAccess,
		"refresh_token": newRefresh,
		"expires_in":    15 * 60,
	})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	staffID := middleware.GetStaffID(c)

	if err := h.service.Logout(staffID); err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Gagal logout")
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Berhasil logout", nil)
}
