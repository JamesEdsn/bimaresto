package middleware

import (
	"errors"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	StaffID int `json:"staff_id"`
	RoleID  int `json:"role_id"`
	jwt.RegisteredClaims
}

// GenerateAccessToken membuat access token JWT yang berlaku 15 menit
func GenerateAccessToken(staffID, roleID int) (string, error) {
	expire, _ := strconv.Atoi(os.Getenv("JWT_ACCESS_EXPIRE_MINUTES"))
	if expire == 0 {
		expire = 15
	}

	claims := Claims{
		StaffID: staffID,
		RoleID:  roleID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expire) * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

// GenerateRefreshToken membuat refresh token JWT yang berlaku 7 hari
func GenerateRefreshToken(staffID, roleID int) (string, error) {
	days, _ := strconv.Atoi(os.Getenv("JWT_REFRESH_EXPIRE_DAYS"))
	if days == 0 {
		days = 7
	}

	claims := Claims{
		StaffID: staffID,
		RoleID:  roleID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(days) * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

// ValidateToken mem-parse dan memvalidasi token JWT
func ValidateToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, errors.New("token tidak valid")
	}
	return token.Claims.(*Claims), nil
}

// RequireAuth memastikan request punya token JWT yang valid
func RequireAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		header := c.Get("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			return c.Status(401).JSON(fiber.Map{"error": "token tidak ditemukan"})
		}

		claims, err := ValidateToken(strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "token tidak valid atau sudah expired"})
		}

		// Simpan ke context supaya handler bisa pakai
		c.Locals("staff_id", claims.StaffID)
		c.Locals("role_id", claims.RoleID)
		return c.Next()
	}
}

// RequireRoles memastikan role pengguna sesuai
func RequireRoles(roles ...int) fiber.Handler {
	return func(c *fiber.Ctx) error {
		header := c.Get("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			return c.Status(401).JSON(fiber.Map{"error": "token tidak ditemukan"})
		}

		claims, err := ValidateToken(strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "token tidak valid atau sudah expired"})
		}

		for _, r := range roles {
			if claims.RoleID == r {
				c.Locals("staff_id", claims.StaffID)
				c.Locals("role_id", claims.RoleID)
				return c.Next()
			}
		}

		return c.Status(403).JSON(fiber.Map{"error": "akses ditolak"})
	}
}

// GetStaffID mengambil staff_id dari context
func GetStaffID(c *fiber.Ctx) int {
	id, _ := c.Locals("staff_id").(int)
	return id
}
