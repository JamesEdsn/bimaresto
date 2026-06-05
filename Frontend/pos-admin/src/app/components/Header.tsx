import { ShoppingCart } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#faf8f3] z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
            🍔
          </div>
          <span className="font-bold text-xl">Bites</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-gray-700 hover:text-gray-900">About Us</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Menu</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Reviews</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Blog</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Contacts</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-100">
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button className="px-6 py-2 bg-amber-400 hover:bg-amber-500 rounded-full font-medium">
            Reserve Table
          </button>
        </div>
      </div>
    </header>
  );
}
