import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import API from '../services/api';
import { toast } from 'react-toastify';
import { Grid, Plus, Edit2, Trash2, Check, X, ShieldAlert } from 'lucide-react';

const ManageTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTableId, setEditingTableId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      tableNumber: '',
      capacity: 2,
      isActive: true,
    },
  });

  const fetchTables = async () => {
    try {
      const response = await API.get('/tables');
      if (response.data.success) {
        setTables(response.data.tables);
      }
    } catch (error) {
      toast.error('Failed to load tables list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Create Table
  const onCreateSubmit = async (data) => {
    try {
      const response = await API.post('/tables', {
        tableNumber: parseInt(data.tableNumber, 10),
        capacity: parseInt(data.capacity, 10),
        isActive: data.isActive,
      });

      if (response.data.success) {
        toast.success(`Table ${response.data.table.tableNumber} created successfully!`);
        reset();
        fetchTables();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create table');
    }
  };

  // Toggle Table Active Status
  const handleToggleActive = async (table) => {
    try {
      const response = await API.put(`/tables/${table._id}`, {
        isActive: !table.isActive,
      });
      if (response.data.success) {
        toast.success(`Table ${table.tableNumber} status updated`);
        fetchTables();
      }
    } catch (error) {
      toast.error('Failed to update table status');
    }
  };

  // Update Seating Capacity Inline
  const handleSaveCapacity = async (id, newCapacity) => {
    try {
      const response = await API.put(`/tables/${id}`, {
        capacity: parseInt(newCapacity, 10),
      });
      if (response.data.success) {
        toast.success('Capacity updated successfully');
        setEditingTableId(null);
        fetchTables();
      }
    } catch (error) {
      toast.error('Failed to update capacity');
    }
  };

  // Delete Table
  const handleDeleteTable = async (id) => {
    try {
      const response = await API.delete(`/tables/${id}`);
      if (response.data.success) {
        toast.success('Table deleted successfully');
        setDeleteConfirmId(null);
        fetchTables();
      }
    } catch (error) {
      toast.error('Failed to delete table');
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-zinc-100 font-sans">
          Manage Restaurant <span class="text-brand-400">Tables</span>
        </h1>
        <p class="text-zinc-500 text-sm mt-1">
          Configure available tables, define customer seat capacities, and activate/deactivate listings.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Create Table */}
        <div>
          <h2 class="text-xl font-bold text-zinc-100 mb-5 flex items-center gap-2">
            <Plus class="h-5 w-5 text-brand-500" />
            Add New Table
          </h2>
          <div class="glass-panel rounded-xl p-6 border border-zinc-800/80">
            <form onSubmit={handleSubmit(onCreateSubmit)} class="space-y-5">
              <div>
                <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Table Number
                </label>
                <input
                  type="number"
                  placeholder="e.g. 16"
                  {...register('tableNumber', {
                    required: 'Table number is required',
                    min: { value: 1, message: 'Must be a positive number' },
                  })}
                  class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
                {errors.tableNumber && (
                  <p class="mt-1 text-xs text-red-500">{errors.tableNumber.message}</p>
                )}
              </div>

              <div>
                <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Seating Capacity
                </label>
                <select
                  {...register('capacity', { required: true })}
                  class="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-3.5 text-zinc-105 text-zinc-300 text-sm focus:outline-none focus:border-brand-500 transition-all"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} Seater
                    </option>
                  ))}
                </select>
              </div>

              <div class="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  class="rounded bg-zinc-900 border-zinc-800 text-brand-600 focus:ring-brand-500 h-4.5 w-4.5"
                />
                <label htmlFor="isActive" class="text-sm text-zinc-300 select-none">
                  Activate table immediately
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                class="w-full btn-primary flex items-center justify-center gap-2 mt-4"
              >
                <span>{isSubmitting ? 'Creating...' : 'Create Table'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right 2 Columns: Table List */}
        <div class="lg:col-span-2">
          <h2 class="text-xl font-bold text-zinc-100 mb-5 flex items-center gap-2">
            <Grid class="h-5 w-5 text-brand-500" />
            Table Layout Inventory
          </h2>

          {loading ? (
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} class="glass-panel rounded-xl p-5 h-36 animate-pulse" />
              ))}
            </div>
          ) : tables.length === 0 ? (
            <div class="glass-panel rounded-xl p-12 text-center">
              <Grid class="h-10 w-10 text-zinc-800 mx-auto mb-3" />
              <p class="text-zinc-400 font-medium">No tables found</p>
              <p class="text-zinc-650 text-xs mt-1">Initialize tables using the creation form.</p>
            </div>
          ) : (
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {tables.map((table) => {
                const isEditing = editingTableId === table._id;
                const isConfirmingDelete = deleteConfirmId === table._id;

                return (
                  <div
                    key={table._id}
                    class={`glass-panel rounded-xl p-5 border relative overflow-hidden transition-all flex flex-col justify-between h-38 ${
                      table.isActive ? 'border-zinc-800/40' : 'border-red-950/20 opacity-60'
                    }`}
                  >
                    <div class="flex items-start justify-between">
                      <div>
                        <span class="text-xs font-mono text-zinc-500">TABLE</span>
                        <h4 class="text-2xl font-extrabold text-zinc-100 leading-none mt-1">
                          #{table.tableNumber}
                        </h4>
                      </div>
                      
                      <button
                        onClick={() => handleToggleActive(table)}
                        class={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded transition-all ${
                          table.isActive
                            ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/30 hover:bg-emerald-900/10'
                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 hover:bg-zinc-700/40'
                        }`}
                      >
                        {table.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    {/* Capacity Display/Editor */}
                    <div class="my-3 text-sm">
                      {isEditing ? (
                        <div class="flex items-center gap-1.5 mt-2">
                          <select
                            id={`capacity-select-${table._id}`}
                            defaultValue={table.capacity}
                            class="bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded p-1 focus:outline-none"
                          >
                            {[2, 3, 4, 5, 6, 7, 8, 10].map((num) => (
                              <option key={num} value={num}>
                                {num} Seats
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              const selectEl = document.getElementById(`capacity-select-${table._id}`);
                              handleSaveCapacity(table._id, selectEl.value);
                            }}
                            class="p-1 text-emerald-400 hover:bg-emerald-950/20 rounded border border-transparent"
                          >
                            <Check class="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingTableId(null)}
                            class="p-1 text-zinc-500 hover:bg-zinc-850 rounded"
                          >
                            <X class="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div class="flex items-center gap-2 text-zinc-400 mt-1">
                          <span>Seating:</span>
                          <span class="font-semibold text-zinc-200">{table.capacity} Guests</span>
                          <button
                            onClick={() => setEditingTableId(table._id)}
                            class="p-1 text-zinc-650 hover:text-brand-400 transition-all"
                            title="Edit Capacity"
                          >
                            <Edit2 class="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Delete Actions */}
                    <div class="mt-auto pt-3 border-t border-zinc-850 flex justify-end">
                      {isConfirmingDelete ? (
                        <div class="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-[10px]">
                          <span class="text-red-400">Confirm?</span>
                          <div class="flex gap-1.5">
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              class="px-2 py-0.5 bg-zinc-800 rounded hover:bg-zinc-700 text-zinc-300"
                            >
                              No
                            </button>
                            <button
                              onClick={() => handleDeleteTable(table._id)}
                              class="px-2 py-0.5 bg-red-950/80 border border-red-900/30 rounded hover:bg-red-900/60 text-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(table._id)}
                          class="p-1 text-zinc-650 hover:text-red-400 transition-all"
                          title="Delete Table"
                        >
                          <Trash2 class="h-3.5 w-3.5" />
                        </button>
                      )}
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

export default ManageTables;
