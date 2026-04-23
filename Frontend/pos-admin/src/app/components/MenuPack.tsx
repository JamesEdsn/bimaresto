import { Star } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const menuItems = [
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
    price: 65.00,
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

const tabs = ['Special Menu', 'Dessert', 'Drinks', 'Japanese', 'Drinks', 'Lunch', 'Main Menu'];

export function MenuPack() {
  const [activeTab, setActiveTab] = useState('Drinks');
  
  return (
    <section className="py-16 px-6 bg-[#faf8f3]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8">Our Regular Menu Pack</h2>
        
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-amber-400 text-gray-900'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <div key={index} className="bg-white rounded-xl p-4 text-center">
              <ImageWithFallback
                src={item.image}
                alt={item.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              
              <h3 className="font-bold mb-2">{item.name}</h3>
              
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <p className="text-gray-600 text-xs mb-3">{item.description}</p>
              
              <div className="flex items-center justify-center gap-3">
                <span className="font-bold">${item.price.toFixed(2)}</span>
                <button className="text-xs px-4 py-1 border border-gray-300 rounded-full hover:bg-gray-100">
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
