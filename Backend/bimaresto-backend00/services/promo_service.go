package services

import (
	"bimaresto-backend/models"
	"bimaresto-backend/repositories"
	"errors"
	"strconv"
	"time"
)

type PromoService interface {
	GetPromos() ([]models.Promo, error)
	CreatePromo(input PromoInput) (models.Promo, error)
	UpdatePromo(id string, input PromoInput) (models.Promo, error)
	DeletePromo(id string) error
}

type PromoInput struct {
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	PromoType    string    `json:"promo_type"`
	BuyMenuID    int       `json:"buy_menu_id"`
	FreeMenuID   int       `json:"free_menu_id"`
	BuyQuantity  int       `json:"buy_quantity"`
	FreeQuantity int       `json:"free_quantity"`
	StartDate    time.Time `json:"start_date"`
	EndDate      time.Time `json:"end_date"`
	IsActive     bool      `json:"is_active"`
}

type promoService struct {
	repo repositories.PromoRepository
}

func NewPromoService(repo repositories.PromoRepository) PromoService {
	return &promoService{repo}
}

func (s *promoService) GetPromos() ([]models.Promo, error) {
	return s.repo.FindAll()
}

func (s *promoService) CreatePromo(input PromoInput) (models.Promo, error) {
	promo, err := buildPromo(input)
	if err != nil {
		return models.Promo{}, err
	}

	if err := s.repo.Create(&promo); err != nil {
		return models.Promo{}, err
	}

	return s.repo.FindByID(stringID(promo.ID))
}

func (s *promoService) UpdatePromo(id string, input PromoInput) (models.Promo, error) {
	promo, err := s.repo.FindByID(id)
	if err != nil {
		return models.Promo{}, errors.New("promo tidak ditemukan")
	}

	updated, err := buildPromo(input)
	if err != nil {
		return models.Promo{}, err
	}

	updated.ID = promo.ID
	updated.CreatedAt = promo.CreatedAt

	if err := s.repo.Update(&updated); err != nil {
		return models.Promo{}, err
	}

	return s.repo.FindByID(id)
}

func (s *promoService) DeletePromo(id string) error {
	promo, err := s.repo.FindByID(id)
	if err != nil {
		return errors.New("promo tidak ditemukan")
	}
	return s.repo.Delete(&promo)
}

func buildPromo(input PromoInput) (models.Promo, error) {
	if input.Name == "" || input.BuyMenuID == 0 || input.FreeMenuID == 0 {
		return models.Promo{}, errors.New("name, buy_menu_id, dan free_menu_id wajib diisi")
	}
	if input.BuyQuantity <= 0 {
		input.BuyQuantity = 1
	}
	if input.FreeQuantity <= 0 {
		input.FreeQuantity = 1
	}
	if input.PromoType == "" {
		input.PromoType = "bundle"
	}

	return models.Promo{
		Name:         input.Name,
		Description:  input.Description,
		PromoType:    input.PromoType,
		BuyMenuID:    input.BuyMenuID,
		FreeMenuID:   input.FreeMenuID,
		BuyQuantity:  input.BuyQuantity,
		FreeQuantity: input.FreeQuantity,
		StartDate:    input.StartDate,
		EndDate:      input.EndDate,
		IsActive:     input.IsActive,
	}, nil
}

func stringID(id int) string {
	return strconv.Itoa(id)
}
