import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const chefs = [
  {
    name: 'Savannah Nguyen',
    image: 'https://images.unsplash.com/photo-1759521296047-89338c8e083d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjaGVmJTIwcG9ydHJhaXQlMjB1bmlmb3JtfGVufDF8fHx8MTc3MjQzODI4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    name: 'Esther Howard',
    image: 'https://images.unsplash.com/photo-1727975741756-9c8591e5aac6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBjaGVmJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNDM4Mjg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    name: 'Marvin McKinney',
    image: 'https://images.unsplash.com/photo-1741243412269-be61e7d2be0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGNoZWYlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI0MzgyODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    name: 'Albert Flores',
    image: 'https://images.unsplash.com/photo-1512149519538-136d1b8c574a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVmJTIwY29va2luZyUyMHByb2Zlc3Npb25hbCUyMGtpdGNoZW58ZW58MXx8fHwxNzcyNDM4Mjg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

export function Chefs() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold">Meet Our Chefs</h2>
          <div className="flex gap-2">
            <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-100">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 bg-amber-400 rounded-full hover:bg-amber-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {chefs.map((chef, index) => (
            <div key={index} className="text-center group cursor-pointer">
              <div className="mb-4 overflow-hidden rounded-2xl">
                <ImageWithFallback
                  src={chef.image}
                  alt={chef.name}
                  className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-lg">{chef.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
