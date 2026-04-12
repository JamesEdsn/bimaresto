package services

import (
	"bimaresto-backend/models"
	"bimaresto-backend/repositories"
	"errors"
)

type KitchenService interface {
	GetActiveOrders() ([]models.OrderItem, error)
	UpdateItemStatus(id string, status string) (string, error)
}

type kitchenService struct {
	repo repositories.KitchenRepository
}

func NewKitchenService(repo repositories.KitchenRepository) KitchenService {
	return &kitchenService{repo}
}

func (s *kitchenService) GetActiveOrders() ([]models.OrderItem, error) {
	return s.repo.FindActiveItems()
}

func (s *kitchenService) UpdateItemStatus(id string, status string) (string, error) {
	allowed := map[string]bool{
		"pending":    true,
		"processing": true,
		"ready":      true,
		"served":     true,
	}
	if !allowed[status] {
		return "", errors.New("status harus salah satu dari: pending, processing, ready, served")
	}

	item, err := s.repo.FindItemByID(id)
	if err != nil {
		return "", errors.New("item tidak ditemukan")
	}

	err = s.repo.UpdateItemStatus(&item, status)
	return status, err
}
