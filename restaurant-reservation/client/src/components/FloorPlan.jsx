import React from 'react';
import { Armchair } from 'lucide-react';

const FloorPlan = ({ tables, selectedTableId, loading }) => {
  if (loading) {
    return (
      <div class="grid grid-cols-3 gap-3 p-4 bg-zinc-900/40 rounded-xl border border-zinc-800 animate-pulse h-80">
        {[...Array(15)].map((_, i) => (
          <div key={i} class="bg-zinc-800/50 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div class="glass-panel rounded-xl p-5 border border-zinc-800/80">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-zinc-850">
        <h3 class="text-sm font-bold text-zinc-200 uppercase tracking-wider">Restaurant Floor Layout</h3>
        <div class="flex items-center gap-4 text-[10px] text-zinc-400">
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Active</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            <span>Assigned</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span>Inactive</span>
          </div>
        </div>
      </div>

      {/* Main floor grid representation */}
      <div class="grid grid-cols-3 sm:grid-cols-5 gap-3 p-4 bg-zinc-950/80 border border-zinc-900 rounded-lg min-h-72 items-center justify-center">
        {tables.map((table) => {
          const isSelected = selectedTableId && selectedTableId.toString() === table._id.toString();
          const isActive = table.isActive;

          // Seats visualizer array
          const seats = [...Array(Math.min(table.capacity, 8))];

          return (
            <div
              key={table._id}
              class={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all duration-300 ${
                !isActive
                  ? 'border-zinc-800 bg-zinc-900/10 text-zinc-600 opacity-40'
                  : isSelected
                  ? 'border-brand-500 bg-brand-950/20 text-brand-350 shadow-md shadow-brand-500/10 scale-105 z-10 animate-pulse'
                  : 'border-emerald-900/50 bg-emerald-950/5 text-emerald-400 hover:border-emerald-500/35 hover:scale-[1.02]'
              }`}
            >
              {/* Seats layout representing dining dots around the table */}
              <div class="absolute inset-1 flex items-center justify-center pointer-events-none">
                <div class="relative w-full h-full">
                  {seats.map((_, idx) => {
                    const angle = (idx * 360) / seats.length;
                    return (
                      <div
                        key={idx}
                        class={`absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                          isSelected ? 'bg-brand-500' : isActive ? 'bg-emerald-500/60' : 'bg-zinc-700'
                        }`}
                        style={{
                          top: `${50 + 40 * Math.sin((angle * Math.PI) / 180)}%`,
                          left: `${50 + 40 * Math.cos((angle * Math.PI) / 180)}%`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Table details center labels */}
              <div class="text-center z-10 select-none">
                <p class="text-xs font-mono font-bold">T{table.tableNumber}</p>
                <div class="flex items-center justify-center gap-0.5 mt-0.5 text-[9px] font-semibold opacity-80">
                  <Armchair class="h-2.5 w-2.5" />
                  <span>{table.capacity}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Front Entrance Indicator */}
      <div class="w-full text-center mt-3 bg-zinc-900/50 border border-zinc-850 py-1.5 rounded-lg text-[9px] uppercase tracking-widest text-zinc-500 font-bold select-none">
        ← Main Restaurant Entrance
      </div>
    </div>
  );
};

export default FloorPlan;
