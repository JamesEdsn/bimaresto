package utils

import "github.com/gofiber/fiber/v2"

// SuccessResponse format standar untuk API sukses
func SuccessResponse(c *fiber.Ctx, statusCode int, message string, data interface{}) error {
	return c.Status(statusCode).JSON(fiber.Map{
		"success": true,
		"message": message,
		"data":    data,
	})
}

// ErrorResponse format standar untuk API error
func ErrorResponse(c *fiber.Ctx, statusCode int, message string) error {
	return c.Status(statusCode).JSON(fiber.Map{
		"success": false,
		"message": message,
		"data":    nil,
	})
}

// PaginationResponse format standar untuk list dengan paginasi
func PaginationResponse(c *fiber.Ctx, message string, data interface{}, page, limit int, total int64, totalPages int) error {
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": message,
		"data":    data,
		"meta": fiber.Map{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}
