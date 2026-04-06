import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Category } from '../../types/database';
import { useAppContext } from '../../contexts/AppContext';

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setNewCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setNewCategoryName('');
    }
    setIsModalOpen(true);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    if (editingCategory) {
      // Update existing category
      updateCategory(editingCategory.id, newCategoryName);
    } else {
      // Add new category
      const newCategory: Category = {
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        name: newCategoryName,
        created_at: new Date(),
      };
      addCategory(newCategory);
    }

    setNewCategoryName('');
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-[24px] font-bold">Category Management</h1>
            <p className="text-muted-foreground text-[14px] mt-1">
              Manage menu categories • {categories.length} total categories
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[14px] font-medium">Add Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr 
                    key={category.id} 
                    className={`border-b border-border hover:bg-muted transition-colors ${
                      index % 2 === 0 ? 'bg-card' : 'bg-muted/35'
                    }`}
                  >
                    <td className="px-6 py-4 text-[14px] text-muted-foreground">
                      #{category.id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-foreground text-[14px] font-medium">{category.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(category)}
                          className="p-2 text-info hover:text-info/80 hover:bg-muted rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-muted rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-border">
            <h2 className="text-foreground text-[24px] font-bold mb-6">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            
            <form onSubmit={handleAddCategory} className="space-y-5">
              <div>
                <label className="block text-muted-foreground text-[13px] font-medium mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    setNewCategoryName('');
                  }}
                  className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-secondary/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}