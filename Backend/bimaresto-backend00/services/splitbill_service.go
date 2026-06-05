package services

import (
    "bimaresto-backend/models"
    "bimaresto-backend/repositories"
    "errors"
)

type SplitBillService interface {
    GetAll() ([]models.SplitBill, error)
    Delete(id int) error
}

type splitBillService struct {
    repo repositories.SplitBillRepository
}

func NewSplitBillService(repo repositories.SplitBillRepository) SplitBillService {
    return &splitBillService{repo}
}

func (s *splitBillService) GetAll() ([]models.SplitBill, error) {
    return s.repo.FindAll()
}

func (s *splitBillService) Delete(id int) error {
    // ensure exists
    if _, err := s.repo.FindByID(id); err != nil {
        return errors.New("split bill tidak ditemukan")
    }
    return s.repo.Delete(id)
}
