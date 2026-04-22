import { useState, useEffect } from "react";
import { Users, ShieldCheck, MapPin, TrendingUp, DollarSign } from "lucide-react";
import { Vendor } from "../types";
import { cn } from "../lib/utils";

interface VendorSectionProps {
  isLocalOnly?: boolean;
  onAddVendor?: () => void;
}

export default function VendorSection({ isLocalOnly = false, onAddVendor }: VendorSectionProps) {
  const [data, setData] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = isLocalOnly ? "/api/local-vendors" : "/api/vendors";
    fetch(endpoint)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, [isLocalOnly]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Vendors...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-2">
          <div>
              <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Vendor Network</h2>
              <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest mt-1">Direct Indian Sourcing Nodes</p>
          </div>
          {onAddVendor && (
            <button 
              onClick={onAddVendor}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0F172A] text-indigo-400 rounded-xl shadow-lg shadow-indigo-100 hover:scale-105 transition-all text-[10px] font-black uppercase tracking-widest"
            >
                Add Partner
            </button>
          )}
      </div>

      {isLocalOnly && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-200" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-100">Market Opportunity</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight">High Profit Sourcing</h2>
            <p className="text-emerald-50 text-sm mt-2 max-w-md">Currently identifying local vendors with 25%+ markup potential based on real-time region demand.</p>
          </div>
          <div className="text-right">
             <div className="text-4xl font-black leading-none">38.4%</div>
             <div className="text-[10px] uppercase font-bold mt-1 opacity-80">Avg. Net Margin</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(v => (
          <div key={v.id} className="card p-6 flex flex-col group hover:border-[#4F46E5] transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-[#F1F5F9] rounded-2xl text-[#4F46E5] border border-[#E2E8F0] group-hover:bg-[#EEF2FF] group-hover:text-[#4F46E5] transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={cn(
                  "text-[9px] font-bold uppercase py-1 px-2 rounded-full border",
                  v.status === 'verified' && "bg-[#ECFDF5] text-[#10B981] border-[#10B981]/20",
                  v.status === 'pending' && "bg-[#FFFBEB] text-[#F59E0B] border-[#F59E0B]/20",
                )}>
                  {v.status}
                </span>
                {v.isLocal && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <MapPin className="w-2.5 h-2.5" /> Local
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-lg font-extrabold text-[#0F172A] mb-1">{v.name}</h3>
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-6">{v.type}</span>

            <div className="mt-auto grid grid-cols-2 border-t border-[#F1F5F9] pt-6 gap-4">
               <div>
                  <div className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Products</div>
                  <div className="text-xl font-black text-[#0F172A]">{v.productCount}</div>
               </div>
               {v.avgProfitMargin ? (
                 <div>
                    <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Profit %</div>
                    <div className="text-xl font-black text-emerald-600">+{v.avgProfitMargin}%</div>
                 </div>
               ) : (
                 <div className="flex items-center justify-end">
                    <ShieldCheck className="w-8 h-8 text-[#10B981] opacity-20" />
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
