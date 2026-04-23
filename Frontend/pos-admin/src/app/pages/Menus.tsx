import { Plus, Search, User } from 'lucide-react';
import { MenuCard } from '../components/MenuCard';
import { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';

export default function Menus() {
  const { menus, categories, addMenu } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    available: true,
  });

  // Build category list with "All" option
  const categoryList = [
    { id: 0, name: 'All', icon: '🍽️' },
    ...categories.map(cat => ({ id: cat.id, name: cat.name, icon: '🍔' }))
  ];

  const filteredMenus = menus.filter(menu => {
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || menu.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new menu item
    const newMenu = {
      id: Math.max(...menus.map(m => m.id), 0) + 1,
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      categories_id: parseInt(formData.category),
      image: null,
      is_available: formData.available,
      created_at: new Date(),
    };
    
    addMenu(newMenu);
    setIsModalOpen(false);
    setFormData({ name: '', price: '', category: '', description: '', available: true });
  };

  return (
    <div className="min-h-screen bg-[#2D2D2D] flex">
      {/* Sidebar - Same as main */}
      <div className="w-64 bg-[#2D2D2D] p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#F2612C] rounded-lg flex items-center justify-center">
            <span className="text-2xl">🍔</span>
          </div>
          <h1 className="font-bold text-xl text-white">Halalbaik</h1>
        </div>

        <div className="space-y-1 flex-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#3D3D3D]">
            <span className="text-white">📊</span>
            <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#3D3D3D]">
            <span className="text-white">📋</span>
            <span>Orders</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#F2612C] text-white">
            <span>🍽️</span>
            <span>Items</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#3D3D3D]">
            <span className="text-white">💳</span>
            <span>Payment</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#3D3D3D]">
            <span className="text-white">📅</span>
            <span>Reservation</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#3D3D3D]">
            <span className="text-white">⚙️</span>
            <span>Setting</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#FEFAE0]">
        {/* Header */}
        <div className="bg-white px-8 py-4 flex items-center justify-between border-b">
          <h2 className="text-2xl font-bold">Menu Items</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Item"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#F5F5F5] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2612C] w-64"
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-[#FFD88D] rounded-lg font-medium hover:bg-[#FFC966] transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
            <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-[#F2612C] to-[#36774F] flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-8 py-6">
          <p className="text-sm text-gray-600 mb-4">Total Item: {filteredMenus.length}</p>
          <div className="flex gap-3 mb-8">
            {categoryList.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'bg-white/50 text-gray-700 hover:bg-white'
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMenus.map((menu) => (
              <MenuCard key={menu.id} {...menu} />
            ))}
          </div>
        </div>
      </div>

      {/* Add Menu Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Add New Menu</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menu Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2612C]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2612C]"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (Rp)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2612C]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2612C]"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-4 h-4 text-[#36774F] rounded focus:ring-[#F2612C]"
                />
                <label htmlFor="available" className="text-sm font-medium text-gray-700">
                  Available
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-[#F2612C] hover:bg-[#d9541f] text-white rounded-lg font-medium transition-colors"
                >
                  Add Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}