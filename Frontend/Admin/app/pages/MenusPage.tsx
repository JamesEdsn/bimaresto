import { useState } from 'react';
import { Edit2, Trash2, Search, Image as ImageIcon, Upload, Plus } from 'lucide-react';
import { Menu, Category } from '../../types/database';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { formatCurrency } from '../../utils/currency';
import { useAppContext } from '../../contexts/AppContext';

export default function MenusPage() {
  const { menus, categories, addMenu, updateMenu, deleteMenu, toggleMenuAvailability } = useAppContext();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categories_id: '',
    image: '',
    is_available: true,
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', categories_id: '', image: '', is_available: true });
    setEditingMenu(null);
    setImagePreview(null);
  };

  const handleOpenModal = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu);
      setFormData({
        name: menu.name,
        description: menu.description || '',
        price: menu.price.toString(),
        categories_id: menu.categories_id.toString(),
        image: menu.image || '',
        is_available: menu.is_available,
      });
      setImagePreview(menu.image);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMenu = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMenu) {
      // Update existing menu
      updateMenu({
        ...editingMenu,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categories_id: parseInt(formData.categories_id),
        image: formData.image || null,
        category: categories.find(c => c.id === parseInt(formData.categories_id)),
        is_available: formData.is_available,
      });
    } else {
      // Add new menu
      const newMenu: Menu = {
        id: menus.length + 1,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        is_available: formData.is_available,
        image: formData.image || null,
        categories_id: parseInt(formData.categories_id),
        category: categories.find(c => c.id === parseInt(formData.categories_id)),
      };
      addMenu(newMenu);
    }

    resetForm();
    setIsModalOpen(false);
  };

  const handleDeleteMenu = (id: number) => {
    if (confirm('Are you sure you want to delete this menu?')) {
      deleteMenu(id);
    }
  };

  const toggleAvailability = (id: number) => {
    toggleMenuAvailability(id);
  };

  const filteredMenus = menus.filter((menu) => {
    const matchesCategory = selectedCategoryId === null ? true : menu.categories_id === selectedCategoryId;
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-[24px] font-bold">Menu Management</h1>
            <p className="text-muted-foreground text-[14px] mt-1">
              Manage menu items and prices • {categories.length} categories available
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search menus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-muted-foreground w-64"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[14px] font-medium">Add Menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Category Filter */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-6 py-2 rounded-lg transition-all whitespace-nowrap ${
              !selectedCategoryId
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-card text-muted-foreground border border-border hover:text-foreground hover:bg-muted'
              }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              className={`px-6 py-2 rounded-lg transition-all whitespace-nowrap ${
                selectedCategoryId === category.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-card text-muted-foreground border border-border hover:text-foreground hover:bg-muted'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Image */}
              <div className="relative h-48 bg-muted flex items-center justify-center">
                {menu.image ? (
                  <ImageWithFallback
                    src={menu.image}
                    alt={menu.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-16 h-16 text-gray-600" />
                )}
                {!menu.is_available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="px-4 py-2 bg-red-500 text-foreground text-[14px] font-medium rounded-lg">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-foreground text-[16px] font-bold mb-1">{menu.name}</h3>
                  <p className="text-muted-foreground text-[12px]">{menu.category?.name}</p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-foreground text-[20px] font-bold">{formatCurrency(menu.price)}</span>
                  <button
                    onClick={() => toggleAvailability(menu.id)}
                    className={`px-3 py-1 text-[12px] rounded-full ${
                      menu.is_available
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {menu.is_available ? 'Available' : 'Unavailable'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(menu)}
                    className="flex-1 p-2 text-info hover:text-info/80 hover:bg-muted rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-[12px]">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteMenu(menu.id)}
                    className="flex-1 p-2 text-red-400 hover:text-red-300 hover:bg-muted rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-[12px]">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Menu Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-border max-h-[90vh] overflow-y-auto">
            <h2 className="text-foreground text-[24px] font-bold mb-6">
              {editingMenu ? 'Edit Menu' : 'Add New Menu'}
            </h2>
            
            <form onSubmit={handleAddMenu} className="space-y-5">
              <div>
                <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                  Menu Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="Enter menu name"
                  required
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="Enter menu description"
                  required
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                  Category
                </label>
                <select
                  value={formData.categories_id}
                  onChange={(e) => setFormData({ ...formData, categories_id: e.target.value })}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                  Price (Rp)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="180000"
                  required
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                  Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span className="text-[12px]">Upload Image</span>
                  </div>
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <ImageWithFallback
                      src={imagePreview}
                      alt="Menu Preview"
                      className="w-full h-20 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Availability Status */}
              <div className="bg-muted p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-muted-foreground text-[13px] font-medium mb-1">
                      Availability Status
                    </label>
                    <p className="text-muted-foreground text-[11px]">
                      Set menu as unavailable if ingredients are out of stock
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`px-3 py-1 text-[11px] rounded-full font-medium ${
                    formData.is_available
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {formData.is_available ? '✓ Available' : '✗ Unavailable'}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {formData.is_available ? 'Menu can be ordered' : 'Menu cannot be ordered'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-secondary/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  {editingMenu ? 'Update Menu' : 'Add Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}