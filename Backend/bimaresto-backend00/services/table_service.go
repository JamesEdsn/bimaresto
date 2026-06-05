package services

import (
	"bimaresto-backend/models"
	"bimaresto-backend/repositories"
	"errors"
)

type TableService interface {
	GetAllTables() ([]models.Table, error)
    CreateTable(tableNumber string, capacity int, status string) (models.Table, error)
    UpdateTable(id string, tableNumber string, capacity int, status string) (models.Table, error)
    UpdateTableStatus(id string, newStatus string) (string, error)
    DeleteTable(id string) error
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

func (s *tableService) CreateTable(tableNumber string, capacity int, status string) (models.Table, error) {
    table := models.Table{
        TableNumber: tableNumber,
        Capacity:    capacity,
        Status:      status,
    }

    if table.Status == "" {
        table.Status = "available"
    }
    if table.Capacity <= 0 {
        table.Capacity = 4
    }

    if err := s.repo.Create(&table); err != nil {
        return models.Table{}, err
    }

    return table, nil
}

func (s *tableService) UpdateTable(id string, tableNumber string, capacity int, status string) (models.Table, error) {
    var table models.Table

    if err := s.repo.FindByID(&table, id); err != nil {
        return models.Table{}, err
    }

    if tableNumber != "" {
        table.TableNumber = tableNumber
    }
    if capacity > 0 {
        table.Capacity = capacity
    }
    if status != "" {
        table.Status = status
    }

    if err := s.repo.Update(&table); err != nil {
        return models.Table{}, err
    }

    return table, nil
}

func (s *tableService) UpdateTableStatus(id string, newStatus string) (string, error) {
    var table models.Table
    
    // 1. Cari meja
    if err := s.repo.FindByID(&table, id); err != nil {
        return "", errors.New("meja tidak ditemukan")
    }

    // 2. Update status
    if err := s.repo.UpdateStatus(&table, newStatus); err != nil {
        return "", err
    }

    return newStatus, nil
}

// DeleteTable deletes a table if there are no active orders referencing it
func (s *tableService) DeleteTable(id string) error {
    var table models.Table
    if err := s.repo.FindByID(&table, id); err != nil {
        return err
    }
    return s.repo.Delete(&table)
}