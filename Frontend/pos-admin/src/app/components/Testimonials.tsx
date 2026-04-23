import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    text: "This place is great! Atmosphere is chill and cool but the staff is also really friendly. They know their stuff and what they're doing. They also have great recommendations.",
    name: 'Savannah Nguyen',
    avatar: '👤',
  },
  {
    text: "This place is great! Atmosphere is chill and cool but the staff is also really friendly. They know their stuff and what they're doing. They also have great recommendations.",
    name: 'Savannah Nguyen',
    avatar: '👤',
  },
  {
    text: "This place is great! Atmosphere is chill and cool but the staff is also really friendly. They know their stuff and what they're doing. They also have great recommendations.",
    name: 'Savannah Nguyen',
    avatar: '👤',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 px-6 bg-[#faf8f3]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold">What Our Customer Says?</h2>
          <div className="flex gap-2">
            <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-100">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 bg-amber-400 rounded-full hover:bg-amber-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
              <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
