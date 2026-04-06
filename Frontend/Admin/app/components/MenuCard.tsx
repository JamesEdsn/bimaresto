import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatCurrency } from '../../utils/currency';
import { Menu } from '../../types/database';

interface MenuCardProps extends Menu {
  onAddToOrder?: () => void;
}

export function MenuCard({ name, price, category, image, description, is_available, onAddToOrder }: MenuCardProps) {
  // Format the price to Rupiah
  const priceInRupiah = formatCurrency(price);
  
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg" style={{ opacity: is_available ? 1 : 0.5 }}>
      <div className="relative h-48">
        <ImageWithFallback
          src={image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
          alt={name}
          className="w-full h-full object-cover"
        />
        {!is_available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 text-gray-900">{name}</h3>
        {description && (
          <p className="text-sm text-gray-500 mb-3">{description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {priceInRupiah}
          </span>
          {is_available && onAddToOrder && (
            <button
              onClick={onAddToOrder}
              className="px-4 py-2 bg-brand hover:bg-brand/90 text-brand-foreground rounded-lg text-sm font-medium transition-colors"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
