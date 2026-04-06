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
    <div className="min-h-screen bg-background flex">
      <div className="w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-2xl">🍔</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-brand leading-tight">Halalbaik</h1>
            <p className="text-[11px] text-muted-foreground">POS</p>
          </div>
        </div>

        <div className="space-y-1 flex-1">
          <button type="button" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors">
            <span>📊</span>
            <span>Dashboard</span>
          </button>
          <button type="button" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors">
            <span>📋</span>
            <span>Orders</span>
          </button>
          <button type="button" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <span>🍽️</span>
            <span>Items</span>
          </button>
          <button type="button" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors">
            <span>💳</span>
            <span>Payment</span>
          </button>
          <button type="button" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors">
            <span>📅</span>
            <span>Reservation</span>
          </button>
          <button type="button" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors">
            <span>⚙️</span>
            <span>Setting</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-background">
        <div className="bg-card px-8 py-4 flex items-center justify-between border-b border-border shadow-sm">
          <h2 className="text-2xl font-bold text-foreground">Menu Items</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Item"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-muted border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-64 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-primary/15 text-foreground border border-primary/25 rounded-lg font-medium hover:bg-primary/25 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5 text-primary" />
              Add
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-muted">
              <div className="w-full h-full bg-primary flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          <p className="text-sm text-muted-foreground mb-4">Total Item: {filteredMenus.length}</p>
          <div className="flex gap-3 mb-8 flex-wrap">
            {categoryList.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors border ${
                  selectedCategory === category.name
                    ? 'bg-card text-foreground border-primary shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-card hover:text-foreground'
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-border shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Add New Menu</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Menu Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price (Rp)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground"
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
                  className="w-4 h-4 accent-brand rounded border-border focus:ring-primary"
                />
                <label htmlFor="available" className="text-sm font-medium text-foreground">
                  Available
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors shadow-sm"
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