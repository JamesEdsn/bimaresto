import { UtensilsCrossed, Coffee, Wine, Pizza, Sandwich } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const categories = [
  { icon: UtensilsCrossed, label: 'Dishes', color: 'bg-amber-400' },
  { icon: Coffee, label: 'Dessert', color: 'bg-amber-300' },
  { icon: Wine, label: 'Drinks', color: 'bg-gray-700' },
  { icon: Pizza, label: 'Platter', color: 'bg-gray-700' },
  { icon: Sandwich, label: 'Snacks', color: 'bg-amber-400' },
];

export function Hero() {
  return (
    <section className="pt-32 pb-16 px-6 bg-[#faf8f3] relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side */}
        <div className="space-y-6">
          <div className="text-gray-400 text-sm tracking-widest">
            ━━━━ 🍴 ━━━━
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
            We Serve The Test<br />You Love 🙂
          </h1>
          
          <p className="text-gray-600 max-w-md">
            This is a type of restaurant which typically serves food and drinks, in addition to light refreshments such as baked goods or snacks. The term comes from the much word meaning food.
          </p>
          
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-amber-400 hover:bg-amber-500 rounded-full font-medium">
              Explore Food
            </button>
            <button className="px-8 py-3 border border-gray-300 hover:bg-gray-100 rounded-full font-medium flex items-center gap-2">
              🔍 Search
            </button>
          </div>
        </div>
        
        {/* Right Side - Main Dish Image with Categories */}
        <div className="relative">
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1716034353309-c6066ae24c67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwc2FsbW9uJTIwc2FsYWQlMjBwbGF0ZXxlbnwxfHx8fDE3NzI0MzgyODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Delicious main dish"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          
          {/* Category Icons */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 space-y-3">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className={`${category.color} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <span className="bg-white px-4 py-2 rounded-full shadow-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {category.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-10 right-10 opacity-10 text-8xl">
        🍕🍔🌮
      </div>
    </section>
  );
}
