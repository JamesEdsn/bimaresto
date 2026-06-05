package repositories

import (
	"bimaresto-backend/models"

	"gorm.io/gorm"
)

type PromoRepository interface {
	FindAll() ([]models.Promo, error)
	FindByID(id string) (models.Promo, error)
	Create(promo *models.Promo) error
	Update(promo *models.Promo) error
	Delete(promo *models.Promo) error
}

type promoRepository struct {
	db *gorm.DB
}

func NewPromoRepository(db *gorm.DB) PromoRepository {
	return &promoRepository{db}
}

func (r *promoRepository) FindAll() ([]models.Promo, error) {
	var promos []models.Promo
	err := r.db.
		Preload("BuyMenu.Category").
		Preload("FreeMenu.Category").
		Order("id DESC").
		Find(&promos).Error
	return promos, err
}

func (r *promoRepository) FindByID(id string) (models.Promo, error) {
	var promo models.Promo
	err := r.db.
		Preload("BuyMenu.Category").
		Preload("FreeMenu.Category").
		First(&promo, id).Error
	return promo, err
}

func (r *promoRepository) Create(promo *models.Promo) error {
	return r.db.Create(promo).Error
}

func (r *promoRepository) Update(promo *models.Promo) error {
	return r.db.Save(promo).Error
}

func (r *promoRepository) Delete(promo *models.Promo) error {
	return r.db.Delete(promo).Error
}
