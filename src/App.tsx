import { useState, useEffect } from "react";
import { 
  Activity, Box, ChevronRight, ChevronLeft, Play, Settings, Database, Server, AlertCircle, 
  LayoutDashboard, Package, Warehouse, Users, ShoppingBag, LogOut, User,
  TrendingUp, DollarSign, BarChart3, X, CheckCircle2, UserCircle2, Briefcase, Calendar,
  RotateCcw, CreditCard, Map, MapPin, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { WorkflowDefinition, WorkflowInstance } from "./types";
import InstanceList from "./components/InstanceList";
import InstanceDetail from "./components/InstanceDetail";
import Auth from "./components/Auth";
import InventorySection from "./components/InventorySection";
import WarehouseSection from "./components/WarehouseSection";
import VendorSection from "./components/VendorSection";
import StatusVerify from "./components/StatusVerify";
import OperationMonitor from "./components/OperationMonitor";

type View = 'dashboard' | 'inventory' | 'warehouses' | 'vendors' | 'local-vendors' | 'orchestrator' | 'shipping' | 'payments' | 'status-verify' | 'operations';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals & Realtime Settings
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showExpansionPlan, setShowExpansionPlan] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [isLiveMonitorEnabled, setIsLiveMonitorEnabled] = useState(true);
  const [isDomesticOnly, setIsDomesticOnly] = useState(true);
  const [isAutoUPIEnabled, setIsAutoUPIEnabled] = useState(true);
  const [liveLog, setLiveLog] = useState<string[]>(["System initialized", "Awaiting incoming telemetry..."]);
  const [orderCheckResult, setOrderCheckResult] = useState<{ status: 'success' | 'fail' | null, message: string }>({ status: null, message: '' });

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchData = async () => {
      try {
        const [wRes, iRes, sRes, shRes, pRes] = await Promise.all([
          fetch("/api/workflows"),
          fetch("/api/instances"),
          fetch("/api/sales"),
          fetch("/api/shipments"),
          fetch("/api/payments")
        ]);
        setWorkflows(await wRes.json());
        setInstances(await iRes.json());
        setSalesData(await sRes.json());
        setShipments(await shRes.json());
        setPayments(await pRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(async () => {
        const res = await fetch("/api/instances");
        const data = await res.json();
        setInstances(data);
        
        if (isLiveMonitorEnabled) {
             const active = data.filter((i: any) => i.status === 'running');
             if (active.length > 0) {
                 const msgs = [
                     `Processing inventory data for ${active[0].id.slice(0,8)}...`,
                     `Secure payment verification in progress...`,
                     `Generating shipping labels...`,
                     `Updating warehouse stock levels...`,
                     `Matching Order ID with Indian Warehouse Inventory...`
                 ];
                 setLiveLog(prev => [...prev.slice(-4), msgs[Math.floor(Math.random() * msgs.length)]]);
             }
        }
    }, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isLiveMonitorEnabled]);

  const startWorkflow = async (workflowId: string) => {
    try {
      const res = await fetch("/api/instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId })
      });
      const data = await res.json();
      setSelectedInstanceId(data.id);
      setActiveView('orchestrator');
    } catch (e) {
      console.log(e);
    }
  };

  const retryWorkflow = async (instanceId: string) => {
    try {
        await fetch(`/api/instances/${instanceId}/action`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "retry" })
        });
    } catch (e) {
        console.error(e);
    }
  };

  const approveWorkflowTask = async (instanceId: string) => {
    try {
        await fetch(`/api/instances/${instanceId}/action`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "approve" })
        });
    } catch (e) {
        console.error(e);
    }
  };

  const checkOrderRef = (id: string) => {
    if (!id) {
        setOrderCheckResult({ status: null, message: '' });
        return;
    }
    const cleanId = id.trim().toUpperCase();
    const foundPayment = payments.find(p => p.orderId === cleanId);
    const foundShipment = shipments.find(s => s.orderId === cleanId);
    
    if (foundShipment) {
        let msg = `Tracking: ${foundShipment.status} (${foundShipment.location})`;
        if (foundPayment) {
            msg += ` | Payment Audit: ${foundPayment.status.toUpperCase()}`;
            setOrderCheckResult({ status: foundPayment.status === 'completed' ? 'success' : 'fail', message: msg });
        } else {
            setOrderCheckResult({ status: 'fail', message: `${msg} | Payment Data Not Found` });
        }
    } else {
        setOrderCheckResult({ status: 'fail', message: 'INVALID ORDER ID' });
    }
  };

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return (
        <div className="space-y-10 animate-in fade-in duration-1000">
           {/* Growth Spotlight */}
           <div className="card p-10 bg-black text-white shadow-[0_20px_50px_rgba(79,70,229,0.25)] border-none relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-indigo-500/30 transition-colors duration-1000"></div>
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                   <div>
                       <div className="flex items-center gap-3 mb-4">
                           <div className="p-3 bg-indigo-600 rounded-2xl ring-8 ring-indigo-600/10"><TrendingUp className="w-8 h-8 text-white" /></div>
                           <div>
                               <h2 className="text-3xl font-black tracking-tighter">FINANCIAL HARVEST</h2>
                               <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em]">Performance Metrics Q2 2026</p>
                           </div>
                       </div>
                       <div className="flex items-baseline gap-4">
                           <div className="text-8xl font-black tracking-tighter leading-none text-white transition-transform hover:scale-105 duration-500 cursor-default">24.8%</div>
                           <div className="text-2xl font-black text-emerald-400">GROWTH</div>
                       </div>
                       <div className="mt-8 flex gap-4">
                           <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
                               <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Revenue Impact</div>
                               <div className="text-xl font-black">+ ₹3.2 Cr</div>
                           </div>
                           <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/10 backdrop-blur-sm">
                               <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Growth Forecast</div>
                               <div className="text-xl font-black text-emerald-400">Accelerated</div>
                           </div>
                       </div>
                   </div>
                   <div className="hidden lg:block w-px h-48 bg-white/10"></div>
                   <div className="md:w-64 space-y-6">
                       <div className="card p-4 bg-white/5 border-white/10">
                           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Domestic Fulfillment</div>
                           <div className="text-2xl font-black">94.2%</div>
                           <div className="w-full bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: '94.2%' }} className="h-full bg-indigo-500"></motion.div>
                           </div>
                       </div>
                       <div className="card p-4 bg-white/5 border-white/10">
                           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer Retension</div>
                           <div className="text-2xl font-black">88.5%</div>
                           <div className="w-full bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: '88.5%' }} className="h-full bg-emerald-500"></motion.div>
                           </div>
                       </div>
                   </div>
               </div>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="card p-8 bg-white border-[#EEF2FF] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-6">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Users className="w-6 h-6" /></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">Procured Capital</span>
                  </div>
                  <div className="text-4xl font-black text-[#0F172A]">₹1.24 Cr</div>
                  <div className="text-xs mt-3 text-[#64748B] font-bold">Bangalore & Regional Spend</div>
              </div>

              <div className="card p-8 bg-white border-[#F0FDF4] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-6">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Package className="w-6 h-6" /></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">Active Stock</span>
                  </div>
                  <div className="text-4xl font-black text-[#0F172A]">18.5k</div>
                  <div className="text-xs mt-3 text-emerald-600 font-bold">SKU Optimized for Bharat</div>
              </div>

              <div className="lg:col-span-1 card p-8 bg-indigo-600 text-white shadow-xl shadow-indigo-100">
                  <div className="flex justify-between items-center mb-6">
                      <div className="p-3 bg-white/10 rounded-2xl text-white"><CreditCard className="w-6 h-6" /></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">User Payments</span>
                  </div>
                  <div className="text-4xl font-black">₹84 Lakhs</div>
                  <div className="text-xs mt-3 text-indigo-100 font-bold">Processed today via UPI/Cards</div>
              </div>
           </div>
           
           {/* Sales & Profit Trends */}
           <div className="card p-8 bg-white border-[#E2E8F0] shadow-sm">
               <div className="flex justify-between items-center mb-8">
                   <div>
                       <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Enterprise Growth Trends</h3>
                       <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest mt-1">Sales vs Profit Performance</p>
                   </div>
                   <div className="flex gap-4">
                       <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                           <span className="text-[10px] font-black uppercase text-[#64748B]">Sales</span>
                       </div>
                       <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                           <span className="text-[10px] font-black uppercase text-[#64748B]">Profit</span>
                       </div>
                   </div>
               </div>
               <div className="h-[350px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={salesData}>
                           <defs>
                               <linearGradient id="chartSales" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                                   <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                               </linearGradient>
                               <linearGradient id="chartProfit" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                                   <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                           <XAxis 
                             dataKey="month" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{fontSize: 10, fontWeight: 900, fill: '#000000'}} 
                             dy={10} 
                           />
                           <YAxis 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{fontSize: 10, fontWeight: 900, fill: '#000000'}} 
                           />
                           <Tooltip 
                                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '16px', backgroundColor: '#0F172A', color: '#FFFFFF'}}
                                itemStyle={{fontWeight: 900, fontSize: '11px', textTransform: 'uppercase'}}
                                labelStyle={{fontWeight: 900, color: '#FFFFFF', marginBottom: '8px', fontSize: '14px'}}
                           />
                           <Area type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#chartSales)" />
                           <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#chartProfit)" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </div>
        </div>
      );
      case 'inventory': return <InventorySection />;
      case 'warehouses': return <WarehouseSection onExpansionPlan={() => setShowExpansionPlan(true)} />;
      case 'vendors': return <VendorSection onAddVendor={() => setShowAddVendor(true)} />;
      case 'local-vendors': return (
          <div>
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                <Box className="w-5 h-5 text-indigo-600" />
                <p className="text-sm font-bold text-indigo-800">Showing local vendors from Bangalore and surrounding hubs.</p>
            </div>
            <VendorSection isLocalOnly onAddVendor={() => setShowAddVendor(true)} />
          </div>
      );
      case 'shipping': return (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {shipments.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => setSelectedShipment(s)}
                        className="card p-6 border-l-4 border-[#4F46E5] hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                    >
                          <div className="flex justify-between items-start mb-4">
                              <span className="text-[10px] font-black uppercase text-[#64748B] tracking-widest">{s.id}</span>
                              <div className="flex flex-col items-end gap-1">
                                <div className="px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[9px] font-black">{s.status}</div>
                                {payments.find(p => p.orderId === s.orderId) && (
                                    <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                                        payments.find(p => p.orderId === s.orderId).status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                        Pay: {payments.find(p => p.orderId === s.orderId).status}
                                    </div>
                                )}
                              </div>
                          </div>
                          <div className="font-bold text-[#0F172A] mb-1">{s.orderId}</div>
                          <div className="text-xs font-black text-indigo-600 mb-2 uppercase">{s.product}</div>
                          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-4">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]"></div>
                              {s.location}
                          </div>
                          <div className="pt-4 border-t border-[#F1F5F9] flex justify-between items-center">
                               <div className="text-[9px] font-black uppercase text-[#94A3B8]">ETA</div>
                               <div className="text-[10px] font-black text-[#4F46E5]">{s.ETA}</div>
                          </div>
                      </div>
                  ))}
              </div>
              <div className="card p-10 bg-white border-dashed border-2 border-[#E2E8F0] flex flex-col items-center justify-center text-center">
                  <Package className="w-12 h-12 text-[#94A3B8] mb-4 opacity-50" />
                  <h4 className="font-bold text-[#0F172A]">Visual Tracking Enabled</h4>
                  <p className="text-sm text-[#64748B] max-w-sm mt-2">Click any shipment card to see its precise logistics journey across Indian domestic nodes.</p>
              </div>
          </div>
      );
      case 'payments': return (
          <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 card p-6 bg-white flex items-center justify-between border-l-4 border-indigo-600">
                      <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Verification Engine</div>
                          <div className="text-lg font-black text-slate-900">PARALLEL UPI SYNC</div>
                      </div>
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><RotateCcw className="w-5 h-5 animate-spin-slow" /></div>
                  </div>
                  <div className="flex-1 card p-6 bg-white flex items-center justify-between border-l-4 border-emerald-500">
                      <div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gateway Health (IND-01)</div>
                          <div className="text-lg font-black text-slate-900">OPTIMAL (12ms)</div>
                      </div>
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Server className="w-5 h-5" /></div>
                  </div>
              </div>
              <div className="card overflow-hidden">
                  <div className="px-8 py-6 bg-[#0F172A] flex justify-between items-center">
                      <h3 className="font-black text-white uppercase text-xs tracking-widest">Customer Payment Audit</h3>
                      <div className="flex gap-4">
                          <div className="flex flex-col items-end">
                              <div className="text-[8px] font-black text-[#94A3B8] uppercase">Audit Revenue (Total)</div>
                              <div className="text-xl font-black text-white">
                                  ₹{payments.reduce((acc, curr) => acc + (curr.status === 'completed' ? curr.amount : 0), 0).toLocaleString()}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-black text-[#64748B] uppercase tracking-wider">
                            <tr>
                                <th className="px-8 py-4">User</th>
                                <th className="px-8 py-4">Product Purchased</th>
                                <th className="px-8 py-4">Order Ref</th>
                                <th className="px-8 py-4">Amount</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                            {payments.map(p => (
                                <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                                    <td className="px-8 py-5 font-bold text-slate-900">{p.user}</td>
                                    <td className="px-8 py-5 text-sm font-black text-indigo-600 uppercase">{p.product}</td>
                                    <td className="px-8 py-5 text-sm font-bold">
                                        <button 
                                           onClick={() => {
                                               const ship = shipments.find(s => s.orderId === p.orderId);
                                               if (ship) setSelectedShipment(ship);
                                               else alert('Tracking data unavailable.');
                                           }}
                                           className="text-[#0F172A] hover:text-[#4F46E5] hover:underline transition-all flex items-center gap-2 group/ref"
                                        >
                                            {p.orderId}
                                            <Activity className="w-3 h-3 opacity-0 group-hover/ref:opacity-100 transition-opacity" />
                                        </button>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-black text-[#0F172A]">₹{p.amount.toLocaleString()}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${p.status === 'completed' ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#FFFBEB] text-[#F59E0B]'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-xs text-[#64748B]">{new Date(p.timestamp).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      );
      case 'orchestrator': return (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
             <div>
                <h2 className="text-xl font-bold text-[#0F172A]">Flow Monitor</h2>
                <p className="text-xs text-[#64748B]">Centralized logistics orchestration with parallel processing</p>
             </div>
             <div className="flex gap-2">
                {workflows.map(w => (
                    <button 
                      key={w.id}
                      onClick={() => startWorkflow(w.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white text-[10px] font-black uppercase rounded-lg hover:bg-black transition-all shadow-lg shadow-indigo-100"
                    >
                      <Play className="w-3 h-3 fill-white" /> Start {w.id.split('-')[0].toUpperCase()}
                    </button>
                ))}
             </div>
          </div>
          
          <div className="card p-6 bg-indigo-50 border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm"><ShieldCheck className="w-6 h-6" /></div>
                  <div>
                      <h4 className="font-bold text-[#0F172A] uppercase text-xs tracking-tight">Order Fulfillment Engine</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status: Operational | Policy: Bharat-Prime v4</p>
                  </div>
              </div>
              <div className="flex gap-4">
                  <div className="text-right">
                    <div className="text-[8px] font-black text-slate-400 uppercase">Avg Handshake</div>
                    <div className="text-sm font-black text-indigo-600">840ms</div>
                  </div>
              </div>
          </div>

          <InstanceList 
            instances={instances} 
            selectedId={selectedInstanceId} 
            onSelect={setSelectedInstanceId} 
          />

          <AnimatePresence>
            {selectedInstance && (
                <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[100] flex justify-end">
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-full max-w-4xl bg-white shadow-2xl h-full"
                    >
                        <InstanceDetail 
                            instance={selectedInstance}
                            workflow={workflows.find(w => w.id === selectedInstance.workflowId)}
                            onClose={() => setSelectedInstanceId(null)}
                        />
                    </motion.div>
                </div>
            )}
          </AnimatePresence>
        </div>
      );
      case 'status-verify': return <StatusVerify shipments={shipments} payments={payments} />;
      case 'operations': return <OperationMonitor instances={instances} />;
      default: return <InventorySection />;
    }
  };

  const selectedInstance = instances.find(i => i.id === selectedInstanceId);
  const userInitials = "D";

  return (
    <div className="flex h-screen bg-[#F0F4F8] text-[#1E293B] overflow-hidden font-sans">
      {/* Modals */}
      <AnimatePresence>
        {showProfile && (
            <div 
                className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                onClick={() => setShowProfile(false)}
            >
                <motion.div 
                   initial={{ scale: 0.95, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.95, opacity: 0 }}
                   onClick={(e) => e.stopPropagation()}
                   className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="h-24 bg-gradient-to-r from-[#4F46E5] to-[#4338CA]"></div>
                    <div className="px-8 pb-8">
                        <div className="relative -mt-12 mb-6">
                            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl">
                                <div className="w-full h-full rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] font-black text-3xl">D</div>
                            </div>
                            <button onClick={() => setShowProfile(false)} className="absolute top-16 right-0 p-2 bg-[#F1F5F9] rounded-xl hover:bg-[#E2E8F0] transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <h2 className="text-2xl font-black text-[#0F172A]">Dharmika</h2>
                        <p className="text-sm text-[#4F46E5] font-bold uppercase tracking-wider mb-8">Supply Chain Director (India)</p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                                <Briefcase className="w-5 h-5 text-[#64748B]" />
                                <div>
                                    <div className="text-[10px] font-black text-[#94A3B8] uppercase">Department</div>
                                    <div className="text-sm font-bold text-[#475569]">Bharat Logistics Ops</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                                <Calendar className="w-5 h-5 text-[#64748B]" />
                                <div>
                                    <div className="text-[10px] font-black text-[#94A3B8] uppercase">Joining Date</div>
                                    <div className="text-sm font-bold text-[#475569]">March 12, 2021</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center pt-4">
                                <span className="flex items-center gap-2 text-[10px] font-black text-[#10B981] uppercase tracking-widest">
                                    <CheckCircle2 className="w-4 h-4" /> Verified Admin
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}

        {showSettings && (
             <div 
                className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                onClick={() => setShowSettings(false)}
             >
                <motion.div 
                   initial={{ scale: 0.95, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.95, opacity: 0 }}
                   onClick={(e) => e.stopPropagation()}
                   className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-[#0F172A]">Sourcing Settings</h2>
                        <button onClick={() => setShowSettings(false)} className="p-2 bg-[#F1F5F9] rounded-xl hover:bg-[#E2E8F0]"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-bold text-[#475569]">Domestic-Only Sourcing</div>
          <button 
            onClick={() => setIsDomesticOnly(!isDomesticOnly)}
            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isDomesticOnly ? 'bg-[#4F46E5]' : 'bg-[#E2E8F0] shadow-inner'}`}
          >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${isDomesticOnly ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-bold text-[#475569]">Live Traffic Monitor</div>
          <button 
            onClick={() => setIsLiveMonitorEnabled(!isLiveMonitorEnabled)}
            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isLiveMonitorEnabled ? 'bg-[#4F46E5]' : 'bg-[#E2E8F0] shadow-inner'}`}
          >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${isLiveMonitorEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-bold text-[#475569]">Auto-UPI Verification</div>
          <button 
            onClick={() => setIsAutoUPIEnabled(!isAutoUPIEnabled)}
            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isAutoUPIEnabled ? 'bg-[#4F46E5]' : 'bg-[#E2E8F0] shadow-inner'}`}
          >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${isAutoUPIEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
                        </div>
                        <button onClick={() => setShowSettings(false)} className="w-full py-3 bg-[#4F46E5] text-white font-bold rounded-xl shadow-lg mt-4 shadow-indigo-100">Apply Audit Policy</button>
                    </div>
                </motion.div>
             </div>
        )}

        {showAddVendor && (
             <div 
                className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                onClick={() => setShowAddVendor(false)}
             >
                <motion.div 
                   initial={{ scale: 0.95, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.95, opacity: 0 }}
                   onClick={(e) => e.stopPropagation()}
                   className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-[#0F172A]">Add Vendor</h2>
                        <button onClick={() => setShowAddVendor(false)} className="p-2 bg-[#F1F5F9] rounded-xl hover:bg-[#E2E8F0]"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-[#94A3B8] uppercase">Vendor Name</label>
                            <input type="text" className="w-full mt-1 p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]" placeholder="Enter name..." />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-[#94A3B8] uppercase">Type</label>
                            <select className="w-full mt-1 p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                                <option>Manufacturer</option>
                                <option>Distributor</option>
                                <option>Wholesaler</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-[#94A3B8] uppercase">Region</label>
                            <input type="text" className="w-full mt-1 p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]" placeholder="Country..." />
                        </div>
                        <button 
                            onClick={() => {
                                alert('Partner Registration Request Sent! Verification in progress.');
                                setShowAddVendor(false);
                            }} 
                            className="col-span-2 py-4 bg-[#4F46E5] text-white font-black rounded-xl shadow-xl mt-4 hover:bg-[#4338CA] transition-all"
                        >
                            Register Partner
                        </button>
                    </div>
                </motion.div>
             </div>
        )}

        {selectedShipment && (
             <div 
                className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                onClick={() => setSelectedShipment(null)}
             >
                 <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                 >
                     <div className="p-8 bg-[#0F172A] text-white shrink-0">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setSelectedShipment(null)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Back</span>
                                </button>
                                <div>
                                    <h3 className="text-2xl font-black">{selectedShipment.orderId}</h3>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Real-time Visual Journey</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedShipment(null)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 mb-4">
                            <div className="p-3 bg-indigo-600 rounded-xl"><Package className="w-6 h-6 text-white" /></div>
                            <div className="flex-1">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item in Transit</div>
                                <div className="font-bold text-lg">{selectedShipment.product}</div>
                            </div>
                            {payments.find(p => p.orderId === selectedShipment.orderId) && (
                                <div className="text-right">
                                    <div className="text-[8px] font-black text-slate-500 uppercase">Audit Status</div>
                                    <div className={`text-xs font-black uppercase ${payments.find(p => p.orderId === selectedShipment.orderId).status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {payments.find(p => p.orderId === selectedShipment.orderId).status}
                                    </div>
                                </div>
                            )}
                        </div>
                     </div>
                     <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#F1F5F9]"></div>
                            <div className="space-y-10">
                                {selectedShipment.trackingData?.map((step: any, idx: number) => (
                                    <div key={idx} className="relative flex items-start gap-6 group">
                                        <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${step.completed ? 'bg-emerald-500 shadow-emerald-200' : step.current ? 'bg-indigo-600 shadow-indigo-200 animate-pulse' : 'bg-slate-200'} shadow-lg`}>
                                            {step.completed ? <CheckCircle2 className="w-4 h-4 text-white" /> : <MapPin className={`w-4 h-4 ${step.current ? 'text-white' : 'text-slate-400'}`} />}
                                        </div>
                                        <div>
                                            <div className={`text-xs font-black uppercase tracking-wider mb-1 ${step.current ? 'text-indigo-600' : 'text-slate-900'}`}>{step.stage}</div>
                                            <div className="text-xs text-slate-500 font-medium">Verified at Logistics Node {idx + 1}</div>
                                        </div>
                                        {step.current && (
                                            <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></div>
                                                <span className="text-[9px] font-black text-indigo-600 uppercase">LIVE</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#EEF2FF] flex items-center justify-between sticky bottom-0">
                            <div className="flex items-center gap-3">
                                <Map className="w-5 h-5 text-indigo-600" />
                                <span className="text-[10px] font-black uppercase text-slate-600">Current Hub: {selectedShipment.location}</span>
                            </div>
                            <div className="text-[10px] font-black text-indigo-600">ETA: {selectedShipment.ETA}</div>
                        </div>
                     </div>
                     <div className="p-8 pt-0 shrink-0">
                        <button onClick={() => setSelectedShipment(null)} className="w-full py-4 bg-[#0F172A] text-white font-black rounded-2xl hover:bg-black transition-colors shadow-xl">Return to Tracking List</button>
                     </div>
                 </motion.div>
             </div>
        )}

        {showExpansionPlan && (
             <div 
                className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                onClick={() => setShowExpansionPlan(false)}
             >
                <motion.div 
                   initial={{ scale: 0.95, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.95, opacity: 0 }}
                   onClick={(e) => e.stopPropagation()}
                   className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-[#0F172A]">Bharat Logistics Roadmap 2026</h2>
                            <p className="text-sm text-[#4F46E5] font-bold uppercase tracking-wider">Project: Akhand Marg</p>
                        </div>
                        <button onClick={() => setShowExpansionPlan(false)} className="p-2 bg-[#F1F5F9] rounded-xl hover:bg-[#E2E8F0]"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-[#EEF2FF] border border-[#E0E7FF]">
                            <h4 className="font-black text-[#0F172A] mb-2">Phase 1: North India Logistics Hub</h4>
                            <p className="text-sm text-[#475569]">Establishing a 100,000 sq.ft state-of-the-art automated fulfillment center in Gurugram by Q4 2026.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                                <div className="text-[10px] font-black text-[#94A3B8] uppercase mb-1">Domestic Capex</div>
                                <div className="text-xl font-black text-[#0F172A]">₹35 Cr Allocated</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#D1FAE5]">
                                <div className="text-[10px] font-black text-[#10B981] uppercase mb-1">State Govt Approval</div>
                                <div className="text-xl font-black text-[#10B981]">Cleared</div>
                            </div>
                        </div>
                        <button onClick={() => setShowExpansionPlan(false)} className="w-full py-4 bg-[#0F172A] text-white font-black rounded-xl">Download Full PDF Roadmap</button>
                    </div>
                </motion.div>
             </div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col shrink-0 shadow-sm z-50">
        <div className="p-6 flex items-center gap-3 border-b border-[#E2E8F0]">
          <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center shadow-indigo-100 shadow-xl">
            <ShoppingBag className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black tracking-tight text-lg text-[#0F172A] leading-none uppercase">E-commerce</h1>
            <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest leading-none mt-1 inline-block">Everything at one place</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-wider text-[#64748B] font-black px-3 mb-4 mt-2">Core Dashboard</div>
          
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${activeView === 'dashboard' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
          >
            <LayoutDashboard className={`w-4 h-4 ${activeView === 'dashboard' ? 'text-[#4F46E5]' : ''}`} />
            <span className="font-bold">Overview</span>
          </button>

          <div className="text-[10px] uppercase tracking-wider text-[#64748B] font-black px-3 mb-4 mt-8">Logistics Hub</div>
          
          <button
            onClick={() => setActiveView('inventory')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${activeView === 'inventory' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
          >
            <Package className={`w-4 h-4 ${activeView === 'inventory' ? 'text-[#4F46E5]' : ''}`} />
            <span className="font-bold">Inventory Control</span>
          </button>

          <button
            onClick={() => setActiveView('warehouses')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${activeView === 'warehouses' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
          >
            <Warehouse className={`w-4 h-4 ${activeView === 'warehouses' ? 'text-[#4F46E5]' : ''}`} />
            <span className="font-bold">Warehouses</span>
          </button>

          <div className="text-[10px] uppercase tracking-wider text-[#64748B] font-black px-3 mb-4 mt-8">Supply Chain</div>

          <button
            onClick={() => setActiveView('vendors')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${activeView === 'vendors' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
          >
            <Users className={`w-4 h-4 ${activeView === 'vendors' ? 'text-[#4F46E5]' : ''}`} />
            <span className="font-bold">Domestic Partners</span>
          </button>

          <button
            onClick={() => setActiveView('local-vendors')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${activeView === 'local-vendors' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
          >
            <ShoppingBag className={`w-4 h-4 ${activeView === 'local-vendors' ? 'text-[#4F46E5]' : ''}`} />
            <span className="font-bold">Local Vendors (Bangalore)</span>
          </button>

          <div className="text-[10px] uppercase tracking-wider text-[#64748B] font-black px-3 mb-4 mt-8">Audit & Tracking</div>

          <button
            onClick={() => setActiveView('payments')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${activeView === 'payments' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
          >
            <CreditCard className={`w-4 h-4 ${activeView === 'payments' ? 'text-[#4F46E5]' : ''}`} />
            <span className="font-bold">Payments Audit</span>
          </button>

          <button
            onClick={() => setActiveView('shipping')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${activeView === 'shipping' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
          >
            <Activity className={`w-4 h-4 ${activeView === 'shipping' ? 'text-[#4F46E5]' : ''}`} />
            <span className="font-bold">Track Shipping</span>
          </button>

          <button
            onClick={() => setActiveView('status-verify')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${activeView === 'status-verify' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeView === 'status-verify' ? 'text-[#4F46E5]' : ''}`} />
            <span className="font-bold">Status Verify</span>
          </button>

          <div className="text-[10px] uppercase tracking-wider text-[#64748B] font-black px-3 mb-4 mt-8">Operations</div>

          <button
            onClick={() => setActiveView('orchestrator')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${activeView === 'orchestrator' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
          >
            <Play className={`w-4 h-4 ${activeView === 'orchestrator' ? 'text-[#4F46E5]' : ''}`} />
            <span className="font-bold">Flow Monitor</span>
          </button>

          <button
            onClick={() => setActiveView('operations')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${activeView === 'operations' ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-sm' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
          >
            <TrendingUp className={`w-4 h-4 ${activeView === 'operations' ? 'text-[#4F46E5]' : ''}`} />
            <span className="font-bold">Operation Monitor</span>
          </button>
        </nav>

        <div className="p-4 border-t border-[#E2E8F0]">
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-[#EF4444] hover:bg-red-50 rounded-xl transition-colors font-bold"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Header */}
        <header className="h-20 border-b border-[#E2E8F0] flex flex-col shrink-0 bg-white/50 backdrop-blur z-40">
          <div className="flex-1 flex items-center px-10 gap-12">
            <div>
              <h1 className="text-xl font-black text-[#0F172A] tracking-tight">{activeView.replace('-', ' ').toUpperCase()}</h1>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Enterprise Monitoring System</p>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase text-[#10B981]">Central Node Active</span>
              </div>
              <button onClick={() => setShowSettings(true)} className="p-2.5 bg-[#F1F5F9] rounded-xl hover:bg-[#E2E8F0] transition-colors relative group">
                  <Settings className="w-5 h-5 text-[#64748B]" />
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Settings</span>
              </button>
              <div 
                onClick={() => setShowProfile(true)}
                className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center font-black text-[#4F46E5] text-sm border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
              >
                  {userInitials}
              </div>
            </div>
          </div>
          
          {/* Real-time Ticker */}
          <AnimatePresence>
            {isLiveMonitorEnabled && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="bg-[#F1F5F9] border-t border-[#E2E8F0] px-10 py-1 flex items-center overflow-hidden"
               >
                   <div className="flex items-center gap-2 mr-6 shrink-0">
                       <span className="text-[8px] font-black text-[#4F46E5] uppercase bg-[#EEF2FF] px-1.5 py-0.5 rounded">Live Traffic</span>
                   </div>
                   <div className="flex gap-8 animate-marquee">
                       {liveLog.map((log, i) => (
                           <span key={i} className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap opacity-60">
                               {log}
                           </span>
                       ))}
                   </div>
               </motion.div>
            )}
          </AnimatePresence>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Area */}
          <div className="flex-1 overflow-auto p-10 scroll-smooth">
            <div className="max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Flow Trigger / Orchestrator Detail Overlay */}
          <AnimatePresence>
            {selectedInstanceId && (
              <motion.div
                initial={{ opacity: 0, x: 400 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 400 }}
                className="w-[500px] bg-white border-l border-[#E2E8F0] flex flex-col relative shadow-2xl z-[60] pointer-events-auto"
              >
                <InstanceDetail
                  instance={selectedInstance}
                  workflow={workflows.find(w => w.id === selectedInstance?.workflowId)}
                  onClose={() => setSelectedInstanceId(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Simple placeholder icon if Lucide Target is not found (though it should be)
function Target({ className }: { className?: string }) {
    return <ShoppingBag className={className} />;
}
