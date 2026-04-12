package services

import (
	"bimaresto-backend/models"
	"bimaresto-backend/repositories"
	"errors"
)

type TableService interface {
	GetAllTables() ([]models.Table, error)
	UpdateTableStatus(id string, status string) (string, error)
}

type tableService struct {
	repo repositories.TableRepository
}

func NewTableService(repo repositories.TableRepository) TableService {
	return &tableService{repo}
}

func (s *tableService) GetAllTables() ([]models.Table, error) {
	return s.repo.FindAll()
}

func (s *tableService) UpdateTableStatus(id string, status string) (string, error) {
	allowed := map[string]bool{"available": true, "occupied": true, "reserved": true}
	if !allowed[status] {
		return "", errors.New("status harus salah satu dari: available, occupied, reserved")
	}

	table, err := s.repo.FindByID(id)
	if err != nil {
		return "", errors.New("meja tidak ditemukan")
	}

	err = s.repo.UpdateStatus(&table, status)
	return status, err
}
