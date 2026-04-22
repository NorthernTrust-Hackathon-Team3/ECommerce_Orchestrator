import { useState } from "react";
import { Search, Package, CreditCard, Ship, AlertCircle, CheckCircle2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StatusVerifyProps {
  shipments: any[];
  payments: any[];
}

export default function StatusVerify({ shipments, payments }: StatusVerifyProps) {
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!orderId) return;
    setSearching(true);
    setTimeout(() => {
      const cleanId = orderId.trim().toUpperCase();
      const shipment = shipments.find(s => s.orderId === cleanId);
      const payment = payments.find(p => p.orderId === cleanId);
      
      if (shipment || payment) {
        setResult({ shipment, payment });
      } else {
        setResult("not-found");
      }
      setSearching(false);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="card p-10 bg-[#0F172A] text-white border-none shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] -mr-48 -mt-48 rounded-full"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">Status Verify</h2>
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Unified Order & Payment Audit Node</p>
          
          <div className="flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ENTER ORDER ID (E.G. ORD-IND-9821)"
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold tracking-wider"
              />
            </div>
            <button 
              onClick={handleSearch}
              disabled={searching}
              className="px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
            >
              {searching ? "VERIFYING..." : "AUDIT STATUS"}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result === "not-found" && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="card p-12 flex flex-col items-center text-center bg-white border-red-100"
           >
              <AlertCircle className="w-16 h-16 text-red-500 mb-4 opacity-20" />
              <h3 className="text-xl font-black text-slate-900 mb-2">ORD-REF NOT RECOGNIZED</h3>
              <p className="text-sm text-slate-500 max-w-sm font-bold uppercase tracking-tight">The provided ID does not match any records in the domestic logistics or payment nodes.</p>
           </motion.div>
        )}

        {result && result !== "not-found" && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="grid grid-cols-1 md:grid-cols-2 gap-8"
           >
              {/* Payment Status Node */}
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600"><CreditCard className="w-5 h-5" /></div>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Payment Audit</span>
                    </div>
                </div>
                <div className="p-8">
                    {result.payment ? (
                        <>
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction ID</div>
                                    <div className="text-xl font-black text-slate-900">{result.payment.id}</div>
                                </div>
                                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${result.payment.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {result.payment.status}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</div>
                                    <div className="text-lg font-black text-slate-900">₹{result.payment.amount.toLocaleString()}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</div>
                                    <div className="text-lg font-black text-slate-900">{result.payment.user}</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-12 flex flex-col items-center text-center opacity-50">
                            <AlertCircle className="w-10 h-10 mb-2" />
                            <p className="text-xs font-black uppercase">No Payment Records Found</p>
                        </div>
                    )}
                </div>
              </div>

              {/* Logistics Status Node */}
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600"><Ship className="w-5 h-5" /></div>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Logistics Node Status</span>
                    </div>
                </div>
                <div className="p-8">
                    {result.shipment ? (
                        <>
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Domestic Hub</div>
                                    <div className="text-xl font-black text-slate-900">{result.shipment.location}</div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Current Status</div>
                                    <div className="px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                                        {result.shipment.status}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-600 text-white shadow-xl shadow-indigo-100">
                                    <MapPin className="w-5 h-5" />
                                    <div>
                                        <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">ETA (Scheduled)</div>
                                        <div className="font-bold">{result.shipment.ETA}</div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                                        <Package className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatched Item</div>
                                        <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{result.shipment.product}</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-12 flex flex-col items-center text-center opacity-50">
                            <AlertCircle className="w-10 h-10 mb-2" />
                            <p className="text-xs font-black uppercase">No Logistics Records Found</p>
                        </div>
                    )}
                </div>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
