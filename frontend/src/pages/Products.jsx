// src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  DollarSign, 
  Check, 
  ArrowRightLeft,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';

export default function Products() {
  const [schemes, setSchemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    sku: 'In Progress', // Status
    quantity: '', // Allocated Budget
    costPrice: '', // Utilized Budget
    description: ''
  });

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      setSchemes(response.data);
    } catch (err) {
      console.error('Error fetching schemes:', err);
      toast.error('Failed to fetch welfare schemes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  // Search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await api.get(`/products/search?q=${searchQuery}`);
        setSchemes(response.data);
      } catch (err) {
        console.error('Error searching schemes:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleOpenAddModal = () => {
    setSelectedScheme(null);
    setFormData({
      name: '',
      sku: 'In Progress',
      quantity: '',
      costPrice: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (scheme) => {
    setSelectedScheme(scheme);
    setFormData({
      name: scheme.name,
      sku: scheme.sku, // status
      quantity: String(scheme.quantity), // budget
      costPrice: String(scheme.costPrice), // utilized
      description: scheme.description || ''
    });
    setShowModal(true);
  };

  const handleOpenDeleteModal = (scheme) => {
    setSelectedScheme(scheme);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedScheme(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Scheme name is required');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku, // mapped to status
      quantity: parseFloat(formData.quantity) || 0, // allocated budget
      costPrice: parseFloat(formData.costPrice) || 0, // spent budget
      description: formData.description.trim()
    };

    try {
      if (selectedScheme) {
        // Edit Mode
        const response = await api.put(`/products/${selectedScheme.id}`, payload);
        toast.success('Scheme details updated successfully');
        setSchemes(prev => prev.map(s => s.id === selectedScheme.id ? response.data : s));
      } else {
        // Add Mode
        const response = await api.post('/products', payload);
        toast.success('Welfare scheme created successfully');
        setSchemes(prev => [response.data, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving scheme:', err);
      toast.error(err.response?.data?.error || 'Failed to save scheme');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedScheme) return;
    try {
      await api.delete(`/products/${selectedScheme.id}`);
      toast.success('Welfare scheme deleted');
      setSchemes(prev => prev.filter(s => s.id !== selectedScheme.id));
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting scheme:', err);
      toast.error('Failed to delete scheme');
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full w-full max-w-7xl mx-auto custom-scroll">
      
      {/* Top action header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search bar */}
        <div className="relative w-full max-w-md">
          <div className="flex items-center bg-[#24382C]/50 border border-[#F2F0E6]/10 focus-within:border-[#C98A2E] rounded-xl px-4 py-2.5 transition-all">
            <Search className="w-5 h-5 text-[#C98A2E] mr-3" />
            <input
              type="text"
              placeholder="Search schemes by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[#F2F0E6] outline-none placeholder:text-[#F2F0E6]/40 font-heading"
            />
          </div>
        </div>

        {/* Add Scheme Button */}
        <button
          onClick={handleOpenAddModal}
          className="bg-[#C98A2E] hover:bg-[#b07824] text-[#16241D] font-bold text-sm px-5 py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Welfare Scheme
        </button>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#C98A2E]" size={36} />
        </div>
      ) : (
        <div className="glass border border-[#F2F0E6]/10 rounded-2xl overflow-hidden shadow-xl">
          {schemes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#24382C]/40 text-[#F2F0E6]/40 uppercase font-mono border-b border-[#F2F0E6]/10">
                    <th className="p-4">Welfare Scheme Name</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Allocated Budget</th>
                    <th className="p-4">Utilized Budget</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F0E6]/5 text-[#F2F0E6]/80">
                  {schemes.map(s => (
                    <tr key={s.id} className="hover:bg-[#24382C]/20 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-sm text-white">{s.name}</span>
                          <span className="text-[10px] text-[#F2F0E6]/40 leading-none">{s.description || 'No scheme description notes'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                          s.sku === 'Completed' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                          s.sku === 'In Progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                          'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                          {s.sku}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-white">₹ {(s.quantity / 100000).toFixed(2)} L</td>
                      <td className="p-4 font-mono">₹ {(s.costPrice / 100000).toFixed(2)} L</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(s)}
                            className="w-8 h-8 rounded-lg bg-[#24382C] border border-[#F2F0E6]/10 hover:border-[#C98A2E] text-[#C98A2E] flex items-center justify-center transition-colors"
                            title="Edit Scheme"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(s)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors"
                            title="Delete Scheme"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-[#F2F0E6]/40 gap-3">
              <FileText size={48} className="text-[#C98A2E]/50" />
              <p className="text-sm font-semibold">No active welfare schemes registered.</p>
              <button 
                onClick={handleOpenAddModal}
                className="text-xs font-mono font-bold text-[#C98A2E] hover:underline"
              >
                Click here to add one
              </button>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-[#16241D]/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#16241D] border border-[#C98A2E]/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative animate-fade-in-up">
            
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-[#F2F0E6]/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-extrabold text-xl text-white mb-6 border-b border-[#F2F0E6]/5 pb-3">
              {selectedScheme ? 'Edit Welfare Scheme' : 'Add Welfare Scheme'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold text-[#F2F0E6]/50 uppercase">Scheme Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mission Bhagiratha Pipeline Restructure" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-[#24382C]/50 border border-[#F2F0E6]/10 focus:border-[#C98A2E] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold text-[#F2F0E6]/50 uppercase">Implementation Status</label>
                  <select 
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="bg-[#24382C]/50 border border-[#F2F0E6]/10 focus:border-[#C98A2E] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold text-[#F2F0E6]/50 uppercase">Allocated Budget (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1500000" 
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="bg-[#24382C]/50 border border-[#F2F0E6]/10 focus:border-[#C98A2E] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold text-[#F2F0E6]/50 uppercase">Utilized Budget (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1200000" 
                    value={formData.costPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, costPrice: e.target.value }))}
                    className="bg-[#24382C]/50 border border-[#F2F0E6]/10 focus:border-[#C98A2E] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold text-[#F2F0E6]/50 uppercase">Description / Audit Notes</label>
                <textarea 
                  rows="3" 
                  placeholder="Details regarding targeted beneficiary groups, contractor names, and current audit details..." 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-[#24382C]/50 border border-[#F2F0E6]/10 focus:border-[#C98A2E] rounded-xl px-4 py-2.5 text-xs text-white outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F2F0E6]/5">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="border border-[#F2F0E6]/15 hover:border-[#F2F0E6]/30 px-4 py-2 rounded-xl text-xs text-[#F2F0E6]/80 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-[#C98A2E] hover:bg-[#b07824] text-[#16241D] font-bold text-xs font-mono px-5 py-2.5 rounded-xl shadow-lg transition-all"
                >
                  {selectedScheme ? 'Update Scheme' : 'Add Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#16241D]/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#16241D] border border-red-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-fade-in-up">
            
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-lg text-white">Delete Welfare Scheme?</h4>
                <p className="text-xs text-[#F2F0E6]/60 mt-1 leading-relaxed">
                  Are you sure you want to delete <b className="text-white">"{selectedScheme?.name}"</b>? This action will permanently remove the scheme audit record from the database.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#F2F0E6]/5 text-xs">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="border border-[#F2F0E6]/15 hover:border-[#F2F0E6]/30 px-4 py-2 rounded-xl text-[#F2F0E6]/80 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteSubmit}
                className="bg-red-500 hover:bg-red-600 text-white font-mono font-bold px-5 py-2.5 rounded-xl transition-all"
              >
                Delete Scheme
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
