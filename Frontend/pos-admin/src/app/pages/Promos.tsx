import { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Calendar, Gift, Clock, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { Promo } from '../../types/database';
import { mockPromos } from '../../data/mockData';
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/currency';

type PromoStatus = 'all' | 'active' | 'scheduled' | 'expired';

export default function Promos() {
  const { menus } = useAppContext();
  const [promos, setPromos] = useState<Promo[]>(mockPromos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<PromoStatus>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    buy_menu_id: '',
    free_menu_id: '',
    buy_quantity: '1',
    free_quantity: '1',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      buy_menu_id: '',
      free_menu_id: '',
      buy_quantity: '1',
      free_quantity: '1',
      start_date: '',
      end_date: '',
      is_active: true,
    });
    setEditingPromo(null);
  };

  const handleOpenModal = (promo?: Promo) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        name: promo.name,
        description: promo.description || '',
        buy_menu_id: promo.buy_menu_id.toString(),
        free_menu_id: promo.free_menu_id.toString(),
        buy_quantity: promo.buy_quantity.toString(),
        free_quantity: promo.free_quantity.toString(),
        start_date: promo.start_date.toISOString().split('T')[0],
        end_date: promo.end_date.toISOString().split('T')[0],
        is_active: promo.is_active,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const buyMenu = menus.find(m => m.id === parseInt(formData.buy_menu_id));
    const freeMenu = menus.find(m => m.id === parseInt(formData.free_menu_id));

    if (editingPromo) {
      // Update existing promo
      setPromos(promos.map(p =>
        p.id === editingPromo.id
          ? {
              ...p,
              name: formData.name,
              description: formData.description || null,
              buy_menu_id: parseInt(formData.buy_menu_id),
              free_menu_id: parseInt(formData.free_menu_id),
              buy_quantity: parseInt(formData.buy_quantity),
              free_quantity: parseInt(formData.free_quantity),
              start_date: new Date(formData.start_date),
              end_date: new Date(formData.end_date),
              is_active: formData.is_active,
              buy_menu: buyMenu,
              free_menu: freeMenu,
            }
          : p
      ));
    } else {
      // Add new promo
      const newPromo: Promo = {
        id: Math.max(...promos.map(p => p.id), 0) + 1,
        name: formData.name,
        description: formData.description || null,
        promo_type: 'bundle',
        buy_menu_id: parseInt(formData.buy_menu_id),
        free_menu_id: parseInt(formData.free_menu_id),
        buy_quantity: parseInt(formData.buy_quantity),
        free_quantity: parseInt(formData.free_quantity),
        start_date: new Date(formData.start_date),
        end_date: new Date(formData.end_date),
        is_active: formData.is_active,
        created_at: new Date(),
        buy_menu: buyMenu,
        free_menu: freeMenu,
      };
      setPromos([...promos, newPromo]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeletePromo = (id: number) => {
    if (confirm('Are you sure you want to delete this promo?')) {
      setPromos(promos.filter(p => p.id !== id));
    }
  };

  const togglePromoStatus = (id: number) => {
    setPromos(promos.map(p =>
      p.id === id ? { ...p, is_active: !p.is_active } : p
    ));
    
    // Auto-switch to "All" tab after toggle so user can see the status change
    setSelectedStatus('all');
  };

  const getPromoStatus = (promo: Promo): 'active' | 'scheduled' | 'expired' => {
    const now = new Date();
    
    // Promo sudah expired jika tanggal berakhir sudah lewat
    if (now > promo.end_date) return 'expired';
    
    // Promo scheduled jika tanggal mulai belum tiba ATAU promo belum diaktifkan
    if (now < promo.start_date || !promo.is_active) return 'scheduled';
    
    // Promo active jika sudah dimulai dan sedang aktif
    return 'active';
  };

  const activePromos = promos.filter(p => getPromoStatus(p) === 'active');
  const scheduledPromos = promos.filter(p => getPromoStatus(p) === 'scheduled');
  const expiredPromos = promos.filter(p => getPromoStatus(p) === 'expired');

  // Filter and sort promos based on status
  const filteredPromos = (() => {
    if (selectedStatus === 'all') {
      const statusOrder = {
        active: 1,
        scheduled: 2,
        expired: 3,
      };
      return [...promos].sort((a, b) => {
        const statusA = getPromoStatus(a);
        const statusB = getPromoStatus(b);
        return statusOrder[statusA] - statusOrder[statusB];
      });
    }
    // For other tabs, just filter
    return promos.filter(p => getPromoStatus(p) === selectedStatus);
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-950 text-[24px] font-bold">Bundle Promo Management</h1>
            <p className="text-slate-500 text-[14px] mt-1">Buat promo bundling: Beli produk X → Gratis produk Y</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[14px] font-medium">Add Promo</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Total Promos</p>
                <p className="text-slate-950 text-2xl font-bold">{promos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Active</p>
                <p className="text-slate-950 text-2xl font-bold">{activePromos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Scheduled</p>
                <p className="text-slate-950 text-2xl font-bold">{scheduledPromos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center shadow-lg shadow-gray-500/30">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Expired</p>
                <p className="text-slate-950 text-2xl font-bold">{expiredPromos.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap text-[13px] font-medium ${
              selectedStatus === 'all'
                ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg'
                : 'bg-white text-slate-700 border border-slate-200 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            All Promos ({promos.length})
          </button>
          <button
            onClick={() => setSelectedStatus('active')}
            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap text-[13px] font-medium ${
              selectedStatus === 'active'
                ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg'
                : 'bg-white text-slate-700 border border-slate-200 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Active ({activePromos.length})
          </button>
          <button
            onClick={() => setSelectedStatus('scheduled')}
            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap text-[13px] font-medium ${
              selectedStatus === 'scheduled'
                ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg'
                : 'bg-white text-slate-700 border border-slate-200 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Scheduled ({scheduledPromos.length})
          </button>
          <button
            onClick={() => setSelectedStatus('expired')}
            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap text-[13px] font-medium ${
              selectedStatus === 'expired'
                ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg'
                : 'bg-white text-slate-700 border border-slate-200 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Expired ({expiredPromos.length})
          </button>
        </div>

        {/* Promos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPromos.map((promo) => {
            const status = getPromoStatus(promo);

            return (
              <div
                key={promo.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md hover:shadow-xl transition-all"
              >
                {/* Header with Status Badge */}
                <div className={`p-6 border-b ${
                  status === 'active' 
                    ? 'bg-green-100 border-green-300' 
                    : status === 'scheduled'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {status === 'active' && (
                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center gap-1.5 shadow-lg shadow-green-500/30">
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                            <span className="text-white text-[11px] font-bold uppercase">Active</span>
                          </div>
                        )}
                        {status === 'scheduled' && (
                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center gap-1.5 shadow-lg shadow-blue-500/30">
                            <Clock className="w-3.5 h-3.5 text-white" />
                            <span className="text-white text-[11px] font-bold uppercase">Scheduled</span>
                          </div>
                        )}
                        {status === 'expired' && (
                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center gap-1.5 shadow-lg shadow-gray-500/30">
                            <XCircle className="w-3.5 h-3.5 text-white" />
                            <span className="text-white text-[11px] font-bold uppercase">Expired</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-slate-950 text-[18px] font-bold mb-1">{promo.name}</h3>
                      <p className="text-slate-500 text-[13px]">{promo.description || 'No description'}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Bundle Details */}
                  <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                    {/* Buy Product */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/20">
                        <ShoppingBag className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-500 text-[11px] uppercase font-medium">Beli</p>
                        <p className="text-slate-950 text-[15px] font-bold truncate">
                          {promo.buy_quantity}x {promo.buy_menu?.name || 'Unknown'}
                        </p>
                        <p className="text-slate-500 text-[12px]">
                          {formatCurrency(promo.buy_menu?.price || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="relative flex items-center justify-center my-2">
                      <div className="w-full h-px bg-orange-200" />
                      <div className="absolute bg-orange-50 px-2">
                        <Gift className="w-5 h-5 text-orange-500" />
                      </div>
                    </div>

                    {/* Free Product */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-pink-500/20">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-500 text-[11px] uppercase font-medium">Gratis</p>
                        <p className="text-slate-950 text-[15px] font-bold truncate">
                          {promo.free_quantity}x {promo.free_menu?.name || 'Unknown'}
                        </p>
                        <p className="text-green-600 text-[12px] font-bold">
                          FREE ({formatCurrency(promo.free_menu?.price || 0)})
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-green-400" />
                        <p className="text-slate-500 text-[12px]">Start Date</p>
                      </div>
                      <p className="text-slate-950 text-[13px] font-medium">
                        {promo.start_date.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-red-400" />
                        <p className="text-slate-500 text-[12px]">End Date</p>
                      </div>
                      <p className="text-slate-950 text-[13px] font-medium">
                        {promo.end_date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenModal(promo)}
                      className="flex-1 p-2 text-sky-600 hover:text-sky-700 hover:bg-slate-100 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="text-[12px]">Edit</span>
                    </button>
                    <button
                      onClick={() => togglePromoStatus(promo.id)}
                      className={`flex-1 p-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                        promo.is_active 
                          ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                          : 'text-green-500 hover:text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <Tag className="w-4 h-4" />
                      <span className="text-[12px]">{promo.is_active ? 'Deactivate' : 'Activate'}</span>
                    </button>
                    <button
                      onClick={() => handleDeletePromo(promo.id)}
                      className="flex-1 p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-[12px]">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPromos.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-slate-900 text-[18px] font-bold mb-2">No Promos Found</h3>
            <p className="text-slate-500 text-[14px]">
              {selectedStatus === 'all' 
                ? 'No promos available. Create your first bundle promo!'
                : `No ${selectedStatus} promos at the moment.`}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Promo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full border border-slate-200 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-slate-950 text-[24px] font-bold mb-6">
              {editingPromo ? 'Edit Bundle Promo' : 'Add New Bundle Promo'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Promo Name */}
                <div className="md:col-span-2">
                  <label className="block text-slate-700 text-[13px] font-medium mb-2">
                    Promo Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                    placeholder="e.g., Burger + Free Drink"
                    required
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-slate-700 text-[13px] font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-slate-900"
                    placeholder="Describe your bundle promo"
                    rows={2}
                  />
                </div>

                {/* Buy Product Section */}
                <div className="md:col-span-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="text-orange-600 text-[14px] font-bold mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Product yang Dibeli
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Buy Menu */}
                    <div>
                      <label className="block text-slate-700 text-[13px] font-medium mb-2">
                        Menu *
                      </label>
                      <select
                        value={formData.buy_menu_id}
                        onChange={(e) => setFormData({ ...formData, buy_menu_id: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                        required
                      >
                        <option value="">Select menu</option>
                        {menus.filter(m => m.is_available).map(menu => (
                          <option key={menu.id} value={menu.id}>
                            {menu.name} - {formatCurrency(menu.price)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Buy Quantity */}
                    <div>
                      <label className="block text-slate-700 text-[13px] font-medium mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.buy_quantity}
                        onChange={(e) => setFormData({ ...formData, buy_quantity: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                        placeholder="1"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Free Product Section */}
                <div className="md:col-span-2 p-4 bg-pink-50 border border-pink-200 rounded-lg">
                  <h3 className="text-pink-600 text-[14px] font-bold mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Product Gratis
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Free Menu */}
                    <div>
                      <label className="block text-slate-700 text-[13px] font-medium mb-2">
                        Menu *
                      </label>
                      <select
                        value={formData.free_menu_id}
                        onChange={(e) => setFormData({ ...formData, free_menu_id: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900"
                        required
                      >
                        <option value="">Select menu</option>
                        {menus.filter(m => m.is_available).map(menu => (
                          <option key={menu.id} value={menu.id}>
                            {menu.name} - {formatCurrency(menu.price)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Free Quantity */}
                    <div>
                      <label className="block text-slate-700 text-[13px] font-medium mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.free_quantity}
                        onChange={(e) => setFormData({ ...formData, free_quantity: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900"
                        placeholder="1"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-slate-700 text-[13px] font-medium mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-slate-700 text-[13px] font-medium mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                    required
                  />
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="block text-slate-700 text-[13px] font-medium mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 accent-orange-500"
                    />
                    <span className="text-slate-900 text-[14px]">Active</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-white text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  {editingPromo ? 'Update Promo' : 'Add Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}