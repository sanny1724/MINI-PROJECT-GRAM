import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Search, Leaf, ShieldAlert, Coffee, ArrowUpRight } from 'lucide-react';
import { toast } from 'react-toastify';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVeg, setFilterVeg] = useState(false);
  const [filterGf, setFilterGf] = useState(false);

  const categories = [
    { id: 'all', label: 'All Dishes' },
    { id: 'starters', label: 'Starters' },
    { id: 'mains', label: 'Main Courses' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'beverages', label: 'Beverages' },
  ];

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (filterVeg) params.vegetarian = 'true';
      if (filterGf) params.glutenFree = 'true';

      const response = await API.get('/menu', { params });
      if (response.data.success) {
        setMenuItems(response.data.menuItems);
      }
    } catch (error) {
      toast.error('Failed to load menu card');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [activeCategory, filterVeg, filterGf]);

  // Client side query matching to make search feel instant and premium
  const filteredMenuItems = menuItems.filter((item) => {
    const textMatch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return textMatch;
  });

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Banner */}
      <div class="mb-10 text-center relative py-12 bg-zinc-900/10 rounded-2xl border border-zinc-800/30 overflow-hidden">
        <div class="absolute top-0 left-1/2 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <h1 class="text-4xl font-extrabold tracking-tight text-zinc-100 font-sans relative z-10">
          Our Culinary <span class="text-brand-400">Creation</span>
        </h1>
        <p class="text-zinc-550 text-sm mt-2 max-w-md mx-auto relative z-10 text-zinc-500">
          Browse our signature menu crafted from farm-to-table ingredients by culinary experts.
        </p>
      </div>

      {/* Control Panel: Categories, Search, Filters */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 items-center">
        {/* Category Tabs (left 7 cols) */}
        <div class="lg:col-span-7 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              class={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
                activeCategory === cat.id
                  ? 'bg-brand-650 text-white border-brand-600 shadow-md shadow-brand-950/20'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Allergen Toggle Filters (right 5 cols) */}
        <div class="lg:col-span-5 flex flex-col sm:flex-row gap-4 items-center w-full">
          {/* Search bar */}
          <div class="relative w-full">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-zinc-650" />
            </span>
            <input
              type="text"
              placeholder="Search dish name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              class="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>

          {/* Checkbox filters */}
          <div class="flex gap-4 shrink-0 select-none">
            <label class="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer hover:text-zinc-300">
              <input
                type="checkbox"
                checked={filterVeg}
                onChange={() => setFilterVeg(!filterVeg)}
                class="rounded bg-zinc-950 border-zinc-800 text-brand-600 focus:ring-brand-500 h-4 w-4"
              />
              <span class="flex items-center gap-1">
                <Leaf class="h-3.5 w-3.5 text-emerald-500" />
                Vegetarian
              </span>
            </label>

            <label class="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer hover:text-zinc-300">
              <input
                type="checkbox"
                checked={filterGf}
                onChange={() => setFilterGf(!filterGf)}
                class="rounded bg-zinc-950 border-zinc-800 text-brand-600 focus:ring-brand-500 h-4 w-4"
              />
              <span class="flex items-center gap-1">
                <Coffee class="h-3.5 w-3.5 text-cyan-400" />
                Gluten-Free
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Grid of Dishes */}
      {loading ? (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} class="glass-panel rounded-xl p-5 h-44 animate-pulse space-y-3" />
          ))}
        </div>
      ) : filteredMenuItems.length === 0 ? (
        <div class="glass-panel rounded-xl p-16 text-center border border-zinc-850 flex flex-col items-center justify-center">
          <ShieldAlert class="h-10 w-10 text-zinc-800 mb-3" />
          <p class="text-zinc-400 font-medium">No dishes match your selection</p>
          <p class="text-zinc-650 text-xs mt-1">Try resetting the search terms or toggle categories.</p>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map((item) => (
            <div
              key={item._id}
              class="glass-panel rounded-xl p-5 border border-zinc-800/40 relative overflow-hidden transition-all duration-300 hover:border-brand-500/30 group hover:translate-y-[-2px] flex flex-col justify-between"
            >
              {/* Category indicator Tag */}
              <div class="flex items-center justify-between mb-4">
                <span class="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">
                  {item.category}
                </span>

                <div class="flex gap-1.5">
                  {item.isVegetarian && (
                    <span class="text-[8px] font-bold uppercase text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/20 flex items-center gap-0.5">
                      <Leaf class="h-2 w-2" />
                      Veg
                    </span>
                  )}
                  {item.isGlutenFree && (
                    <span class="text-[8px] font-bold uppercase text-cyan-400 bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-900/20 flex items-center gap-0.5">
                      <Coffee class="h-2 w-2" />
                      GF
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Price */}
              <div class="mb-3">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="text-sm font-bold text-zinc-200 group-hover:text-brand-350 transition-all">
                    {item.name}
                  </h3>
                  <span class="text-sm font-extrabold text-brand-400 font-mono shrink-0">
                    ${item.price}
                  </span>
                </div>
                <p class="text-zinc-500 text-xs mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Action element (decoration) */}
              <div class="mt-4 pt-3 border-t border-zinc-850/50 flex justify-end">
                <span class="text-[9px] font-bold uppercase text-zinc-500 group-hover:text-brand-500 transition-all flex items-center gap-1">
                  Signature Dish
                  <ArrowUpRight class="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;
