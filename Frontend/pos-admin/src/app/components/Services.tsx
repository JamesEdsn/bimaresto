import { ShoppingBag, Calendar, Utensils, ChefHat } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const services = [
  { icon: ShoppingBag, label: 'Online Order', color: 'text-amber-400' },
  { icon: Calendar, label: 'Pre-Reservation', color: 'text-gray-700' },
  { icon: Utensils, label: '24/7 Service', color: 'text-amber-400' },
  { icon: ChefHat, label: 'Organized Foodie Place', color: 'text-gray-700' },
  { icon: Utensils, label: 'Clean Kitchen', color: 'text-amber-400' },
  { icon: ChefHat, label: 'Super Chefs', color: 'text-gray-700' },
];

export function Services() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Chef Image */}
        <div className="relative">
          <div className="relative w-full max-w-md mx-auto">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1512149519538-136d1b8c574a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVmJTIwY29va2luZyUyMHByb2Zlc3Npb25hbCUyMGtpdGNoZW58ZW58MXx8fHwxNzcyNDM4Mjg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Professional chef"
              className="w-full h-auto rounded-full"
            />
          </div>
          
          {/* Decorative chef hat */}
          <div className="absolute -top-10 -left-10 text-9xl opacity-10">
            👨‍🍳
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-6">
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
            We Are More Than<br />Multiple Service
          </h2>
          
          <p className="text-gray-600">
            This is a type of restaurant which typically serves food and drinks, in addition to light refreshments such as baked goods or snacks. The term comes from the much word meaning food.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            {services.map((service, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`${service.color}`}>
                  <service.icon className="w-6 h-6" />
                </div>
                <span className="font-medium">{service.label}</span>
              </div>
            ))}
          </div>
          
          <button className="px-8 py-3 bg-amber-400 hover:bg-amber-500 rounded-full font-medium">
            About Us
          </button>
        </div>
      </div>
    </section>
  );
}
