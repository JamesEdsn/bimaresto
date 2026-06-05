import { Search, CheckCircle2 } from "lucide-react";
import { BuffetPackage, categories } from "../../data/posMenuData";

interface MenuGridProps {
  filteredMenu: BuffetPackage[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBuffetPackage: BuffetPackage | null;
  setSelectedBuffetPackage: (item: BuffetPackage | null) => void;
  tableSeats: number;
  tableName: string;
  ordersLength: number;
  formatPrice: (price: number) => string;
  onSelectPackage: (item: BuffetPackage) => void;
}

export function MenuGrid({
  filteredMenu,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  selectedBuffetPackage,
  setSelectedBuffetPackage,
  tableSeats,
  ordersLength,
  formatPrice,
  onSelectPackage,
}: MenuGridProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      
      <div className="p-4 lg:px-6 pb-0 space-y-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-orange-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

     
      <div className="flex-1 overflow-y-auto p-4 lg:px-6">
        <div className="grid grid-cols-2 gap-4">
          {filteredMenu.map((item: BuffetPackage) => {
            const isSelected = selectedBuffetPackage?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedBuffetPackage(item)}
                className={`border-2 rounded-3xl overflow-hidden cursor-pointer transition shadow-sm hover:shadow-md ${
                  isSelected ? "border-orange-300 bg-orange-50" : "border-orange-100 bg-white"
                }`}
              >
                <div className="relative w-full aspect-video">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h4 className="text-gray-900 text-lg font-bold mb-1">{item.name}</h4>
                  <p className="text-orange-600 text-xl font-extrabold mb-3">{formatPrice(item.price)}</p>

                  <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5" />
                      <span><strong>Appetizer:</strong> {item.courses.Appetizer.join(", ")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5" />
                      <span><strong>Soup:</strong> {item.courses.Soup.join(", ")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5" />
                      <span><strong>Main Course:</strong> {item.courses["Main Course"].join(", ")}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5" />
                      <span><strong>Dessert:</strong> {item.courses.Dessert.join(", ")}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        
        {selectedBuffetPackage && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <h4 className="text-gray-800 font-semibold mb-2">Paket Terpilih: {selectedBuffetPackage.name}</h4>
            <p className="text-sm text-gray-600 mb-2">
              Untuk {tableSeats} orang - Total: {formatPrice(selectedBuffetPackage.price * tableSeats)}
            </p>
            <button
              onClick={() => onSelectPackage(selectedBuffetPackage)}
              className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
            >
              {ordersLength > 0 ? "Ganti Paket Buffet" : "Pilih Paket Buffet"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
