import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const dishes = [
  {
    name: 'Pasta',
    image: 'https://images.unsplash.com/photo-1768966597890-413295c32658?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMHRvbWF0byUyMHNhdWNlJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NzI0MzgyODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 5,
    description: 'Pasta is a type of food typically made from an unseasoned dough.',
    price: 35.00,
  },
  {
    name: 'French Fries',
    image: 'https://images.unsplash.com/photo-1734774797087-b6435057a15e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBmcmllcyUyMGdvbGRlbiUyMGNyaXNweXxlbnwxfHx8fDE3NzI0MzgyODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 5,
    description: 'Pasta is a type of food typically made from an unseasoned dough.',
    price: 55.00,
  },
  {
    name: 'Chicken Shawarma',
    image: 'https://images.unsplash.com/photo-1760888548893-bc2f7e09e972?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwc2hhd2FybWElMjB3cmFwfGVufDF8fHx8MTc3MjM4NDUwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 5,
    description: 'Pasta is a type of food typically made from an unseasoned dough.',
    price: 35.00,
  },
  {
    name: 'Fish Curry',
    image: 'https://images.unsplash.com/photo-1761314037238-e4da5023e844?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXNoJTIwY3VycnklMjByaWNlfGVufDF8fHx8MTc3MjQzODI4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 5,
    description: 'Pasta is a type of food typically made from an unseasoned dough.',
    price: 35.00,
  },
];

export function PopularDishes() {
  return (
    <section className="py-16 px-6 bg-[#faf8f3]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold">Popular Dishes</h2>
          <div className="flex gap-2">
            <button className="p-3 border border-gray-300 rounded-full hover:bg-gray-100">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-3 bg-amber-400 rounded-full hover:bg-amber-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {dishes.map((dish, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4">
                <ImageWithFallback
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{dish.name}</h3>
              
              <div className="flex gap-1 mb-3">
                {[...Array(dish.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <p className="text-gray-600 text-sm mb-4">
                {dish.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">${dish.price.toFixed(2)}</span>
                <button className="px-6 py-2 bg-amber-400 hover:bg-amber-500 rounded-full font-medium">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
