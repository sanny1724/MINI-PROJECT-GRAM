import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import API from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Check, X, ShieldAlert, BookOpen } from 'lucide-react';

const ManageMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItemId, setEditingItemId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: 'starters',
      isVegetarian: false,
      isGlutenFree: false,
      isAvailable: true,
    },
  });

  const fetchMenuItems = async () => {
    try {
      const response = await API.get('/menu/admin');
      if (response.data.success) {
        setMenuItems(response.data.menuItems);
      }
    } catch (error) {
      toast.error('Failed to load menu list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Create Menu Item
  const onCreateSubmit = async (data) => {
    try {
      const response = await API.post('/menu', {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        isVegetarian: data.isVegetarian,
        isGlutenFree: data.isGlutenFree,
        isAvailable: data.isAvailable,
      });

      if (response.data.success) {
        toast.success(`Dish '${response.data.menuItem.name}' added successfully!`);
        reset();
        fetchMenuItems();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add menu item');
    }
  };

  // Toggle availability status
  const handleToggleAvailable = async (item) => {
    try {
      const response = await API.put(`/menu/${item._id}`, {
        isAvailable: !item.isAvailable,
      });
      if (response.data.success) {
        toast.success(`Status updated for '${item.name}'`);
        fetchMenuItems();
      }
    } catch (error) {
      toast.error('Failed to update dish availability');
    }
  };

  // Save price updates inline
  const handleSavePrice = async (id, newPrice) => {
    try {
      const response = await API.put(`/menu/${id}`, {
        price: parseFloat(newPrice),
      });
      if (response.data.success) {
        toast.success('Price updated successfully');
        setEditingItemId(null);
        fetchMenuItems();
      }
    } catch (error) {
      toast.error('Failed to update price');
    }
  };

  // Delete Dish
  const handleDeleteItem = async (id) => {
    try {
      const response = await API.delete(`/menu/${id}`);
      if (response.data.success) {
        toast.success('Menu item deleted successfully');
        setDeleteConfirmId(null);
        fetchMenuItems();
      }
    } catch (error) {
      toast.error('Failed to delete menu item');
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-zinc-100 font-sans">
          Manage Restaurant <span class="text-brand-400">Menu</span>
        </h1>
        <p class="text-zinc-500 text-sm mt-1">
          Add new culinary specialties, adjust prices, and toggle active dishes on the public card.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Create Item (4 cols) */}
        <div class="lg:col-span-4">
          <h2 class="text-xl font-bold text-zinc-100 mb-5 flex items-center gap-2">
            <Plus class="h-5 w-5 text-brand-500" />
            Add New Dish
          </h2>
          <div class="glass-panel rounded-xl p-6 border border-zinc-800/80">
            <form onSubmit={handleSubmit(onCreateSubmit)} class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Dish Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lobster Thermidor"
                  {...register('name', { required: 'Name is required' })}
                  class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-zinc-200 placeholder-zinc-650 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                />
                {errors.name && (
                  <p class="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 29.50"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0, message: 'Price cannot be negative' },
                  })}
                  class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-zinc-200 placeholder-zinc-650 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                />
                {errors.price && (
                  <p class="mt-1 text-xs text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  {...register('category', { required: true })}
                  class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-zinc-300 text-xs focus:outline-none focus:border-brand-500 transition-all font-medium"
                >
                  <option value="starters">Starters</option>
                  <option value="mains">Main Course</option>
                  <option value="desserts">Desserts</option>
                  <option value="beverages">Beverages</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe the flavors, texture, or main ingredients..."
                  {...register('description', { required: 'Description is required' })}
                  class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-zinc-200 placeholder-zinc-650 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                />
                {errors.description && (
                  <p class="mt-1 text-xs text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Toggles */}
              <div class="space-y-2.5 pt-2 border-t border-zinc-850">
                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isVegetarian"
                    {...register('isVegetarian')}
                    class="rounded bg-zinc-950 border-zinc-850 text-brand-600 focus:ring-brand-500 h-4.5 w-4.5"
                  />
                  <label htmlFor="isVegetarian" class="text-xs text-zinc-300 select-none">
                    Vegetarian Dish
                  </label>
                </div>

                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isGlutenFree"
                    {...register('isGlutenFree')}
                    class="rounded bg-zinc-950 border-zinc-850 text-brand-600 focus:ring-brand-500 h-4.5 w-4.5"
                  />
                  <label htmlFor="isGlutenFree" class="text-xs text-zinc-300 select-none">
                    Gluten-Free
                  </label>
                </div>

                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    {...register('isAvailable')}
                    class="rounded bg-zinc-950 border-zinc-850 text-brand-600 focus:ring-brand-500 h-4.5 w-4.5"
                  />
                  <label htmlFor="isAvailable" class="text-xs text-zinc-300 select-none">
                    Available on Menu Card
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                class="w-full btn-primary flex items-center justify-center gap-2 mt-4 text-xs font-semibold py-2.5"
              >
                <span>{isSubmitting ? 'Adding...' : 'Add Dish'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Inventory List (8 cols) */}
        <div class="lg:col-span-8">
          <h2 class="text-xl font-bold text-zinc-100 mb-5 flex items-center gap-2">
            <BookOpen class="h-5 w-5 text-brand-500" />
            Dish Registry Inventory
          </h2>

          {loading ? (
            <div class="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} class="glass-panel rounded-xl p-5 h-24 animate-pulse" />
              ))}
            </div>
          ) : menuItems.length === 0 ? (
            <div class="glass-panel rounded-xl p-16 text-center border border-zinc-850">
              <BookOpen class="h-10 w-10 text-zinc-800 mx-auto mb-3" />
              <p class="text-zinc-400 font-medium">No dishes found in registry</p>
              <p class="text-zinc-650 text-xs mt-1">Create one using the form on the left.</p>
            </div>
          ) : (
            <div class="space-y-4">
              {menuItems.map((item) => {
                const isEditing = editingItemId === item._id;
                const isConfirmingDelete = deleteConfirmId === item._id;

                return (
                  <div
                    key={item._id}
                    class={`glass-panel rounded-xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 ${
                      item.isAvailable ? 'border-zinc-800/40' : 'border-red-950/20 opacity-60'
                    }`}
                  >
                    {/* Details Column */}
                    <div class="space-y-1.5 flex-grow">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">
                          {item.category}
                        </span>
                        <h4 class="text-sm font-bold text-zinc-200 leading-none">
                          {item.name}
                        </h4>
                        <div class="flex gap-1">
                          {item.isVegetarian && (
                            <span class="text-[8px] font-bold text-emerald-400 bg-emerald-950/20 px-1 py-0.2 rounded border border-emerald-900/30">VEG</span>
                          )}
                          {item.isGlutenFree && (
                            <span class="text-[8px] font-bold text-cyan-400 bg-cyan-950/20 px-1 py-0.2 rounded border border-cyan-900/30">GF</span>
                          )}
                        </div>
                      </div>
                      <p class="text-zinc-500 text-xs leading-relaxed max-w-lg">
                        {item.description}
                      </p>
                    </div>

                    {/* Controls & Price Column */}
                    <div class="flex sm:flex-col items-end gap-3 justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-850">
                      {/* Price / Edit Box */}
                      {isEditing ? (
                        <div class="flex items-center gap-1.5">
                          <input
                            id={`price-input-${item._id}`}
                            type="number"
                            step="0.01"
                            defaultValue={item.price}
                            class="w-16 bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded p-1 focus:outline-none font-mono"
                          />
                          <button
                            onClick={() => {
                              const inputEl = document.getElementById(`price-input-${item._id}`);
                              handleSavePrice(item._id, inputEl.value);
                            }}
                            class="p-1 text-emerald-400 hover:bg-emerald-950/20 rounded"
                          >
                            <Check class="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            class="p-1 text-zinc-550 hover:bg-zinc-850 rounded"
                          >
                            <X class="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div class="flex items-center gap-2">
                          <span class="font-extrabold text-brand-400 font-mono">${item.price}</span>
                          <button
                            onClick={() => setEditingItemId(item._id)}
                            class="p-1 text-zinc-650 hover:text-brand-400 transition-all"
                            title="Edit Price"
                          >
                            <Edit2 class="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {/* Status / Delete Toggle */}
                      <div class="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAvailable(item)}
                          class={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border transition-all ${
                            item.isAvailable
                              ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30 hover:bg-emerald-900/10'
                              : 'bg-zinc-800 text-zinc-500 border-zinc-700/50 hover:bg-zinc-700/40'
                          }`}
                        >
                          {item.isAvailable ? 'In Stock' : 'Draft'}
                        </button>

                        {isConfirmingDelete ? (
                          <div class="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg text-[9px]">
                            <span class="text-red-400 mr-1.5 pl-1">Del?</span>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              class="px-1.5 py-0.5 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-350"
                            >
                              No
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              class="px-1.5 py-0.5 bg-red-950/80 rounded hover:bg-red-900 text-red-200"
                            >
                              Yes
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(item._id)}
                            class="p-1 text-zinc-650 hover:text-red-400 transition-all"
                            title="Delete Dish"
                          >
                            <Trash2 class="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageMenu;
