import { useState, useEffect } from "react";
import { Warehouse as WarehouseIcon, Ruler, Box, Gauge } from "lucide-react";
import { Warehouse } from "../types";
import { cn } from "../lib/utils";

interface WarehouseSectionProps {
  onExpansionPlan?: () => void;
}

export default function WarehouseSection({ onExpansionPlan }: WarehouseSectionProps) {
  const [data, setData] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/warehouses")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Warehouses...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map(w => (
          <div key={w.id} className="card p-6 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F1F5F9] rounded-2xl flex items-center justify-center text-[#4F46E5] border border-[#E2E8F0]">
                  <WarehouseIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] leading-tight">{w.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">{w.type}</span>
                </div>
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase py-1 px-2 rounded-full border",
                w.status === 'active' && "bg-[#ECFDF5] text-[#10B981] border-[#10B981]/20",
                w.status === 'full' && "bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/20",
                w.status === 'maintenance' && "bg-[#FFFBEB] text-[#F59E0B] border-[#F59E0B]/20",
              )}>
                {w.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] mb-2">
                  <span className="font-bold text-[#64748B] uppercase tracking-wider">Utilization Capacity</span>
                  <span className="font-bold text-[#0F172A]">{Math.round((w.currentload / w.capacity) * 100)}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden border border-[#E2E8F0]">
                  <div 
                    className={cn(
                        "h-full transition-all duration-1000",
                        (w.currentload / w.capacity) > 0.9 ? "bg-[#EF4444]" : "bg-[#4F46E5]"
                    )}
                    style={{ width: `${(w.currentload / w.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <div className="text-[9px] uppercase font-bold text-[#94A3B8] mb-1">Load</div>
                  <div className="font-mono font-bold text-sm text-[#0F172A]">{w.currentload} Units</div>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <div className="text-[9px] uppercase font-bold text-[#94A3B8] mb-1">Max Capacity</div>
                  <div className="font-mono font-bold text-sm text-[#0F172A]">{w.capacity} Units</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-8 bg-[#EEF2FF] border-[#E0E7FF] flex items-center justify-between">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-[#4F46E5] shadow-lg">
                <Gauge className="w-8 h-8" />
            </div>
            <div>
                <h4 className="text-xl font-bold text-[#0F172A]">Overall Network Health</h4>
                <p className="text-sm text-[#475569] mt-1">Efficiency across 5 regions is currently at 84.5% peak performance.</p>
            </div>
        </div>
        <button 
          onClick={onExpansionPlan}
          className="bg-[#4F46E5] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
        >
          View Expansion Plan
        </button>
      </div>
    </div>
  );
}
