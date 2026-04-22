import { TrendingUp, Server, Activity, ShieldCheck, Database, Zap, Cpu, Bell } from "lucide-react";
import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface OperationMonitorProps {
  instances: any[];
}

export default function OperationMonitor({ instances }: OperationMonitorProps) {
  const successCount = instances.filter(i => i.status === 'completed').length;
  const failureCount = instances.filter(i => i.status === 'failed').length;
  const runningCount = instances.filter(i => i.status === 'running').length;
  
  const throughputData = [
    { time: '08:00', load: 45, latency: 120 },
    { time: '10:00', load: 72, latency: 145 },
    { time: '12:00', load: 88, latency: 190 },
    { time: '14:00', load: 65, latency: 130 },
    { time: '16:00', load: 95, latency: 175 },
    { time: '18:00', load: 110, latency: 210 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Real-time Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 bg-white border-[#F1F5F9] relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Zap className="w-5 h-5" /></div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full text-[9px] font-black text-emerald-600 uppercase">A+ Vitality</div>
          </div>
          <div className="text-3xl font-black text-slate-900 leading-none">99.98%</div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Node Uptime (Bharat-Central)</p>
        </div>

        <div className="card p-6 bg-white border-[#F1F5F9] relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Activity className="w-5 h-5" /></div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-full text-[9px] font-black text-indigo-600 uppercase">Live Thr'put</div>
          </div>
          <div className="text-3xl font-black text-slate-900 leading-none">{runningCount}</div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Active Orchestrations</p>
        </div>

        <div className="card p-6 bg-[#0F172A] text-white border-none shadow-xl relative group overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 -mr-16 -mb-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20"><ShieldCheck className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-black leading-none">{successCount}</div>
          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-2">Successful Handshakes Today</p>
        </div>

        <div className="card p-6 bg-white border-[#F1F5F9] relative group overflow-hidden">
            <div className="flex justify-between items-start mb-4 text-red-600">
                <div className="p-3 bg-red-50 rounded-2xl"><Bell className="w-5 h-5" /></div>
                <div className="text-[9px] font-black uppercase tracking-widest">Alert Threshold: 5%</div>
            </div>
            <div className="text-3xl font-black text-slate-900 leading-none">{failureCount}</div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Retriable Failures Detected</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Load Chart */}
        <div className="lg:col-span-2 card p-8 bg-white shadow-sm border-[#EEF2FF]">
           <div className="flex justify-between items-center mb-8">
               <div>
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Supply Chain IO Throughput</h3>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Telemetry Data x-Realtime</p>
               </div>
               <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                       <Cpu className="w-3.5 h-3.5 text-slate-500" />
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest underline decoration-dotted">Cluster: IND-S1</span>
                   </div>
               </div>
           </div>
           <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={throughputData}>
                       <defs>
                           <linearGradient id="opLoad" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                               <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                           </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                       <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748B'}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748B'}} />
                       <Tooltip 
                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', backgroundColor: '#0F172A', color: '#FFF'}}
                            labelStyle={{fontWeight: 900, fontSize: '12px'}}
                            itemStyle={{fontWeight: 900, fontSize: '10px'}}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="load" 
                         stroke="#4F46E5" 
                         strokeWidth={4} 
                         fillOpacity={1} 
                         fill="url(#opLoad)" 
                         animationDuration={2000}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="latency" 
                         stroke="#10B981" 
                         strokeWidth={2} 
                         strokeDasharray="5 5"
                         fill="transparent"
                       />
                   </AreaChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* Node Performance Section */}
        <div className="lg:col-span-1 space-y-6">
            <div className="card p-6 bg-[#4F46E5] text-white shadow-xl shadow-indigo-100">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-80">Orchestrator Stability</h4>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase">Payload Validation</span>
                    <span className="text-xs font-black tracking-widest">99.2%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-6">
                    <motion.div initial={{ width: 0 }} animate={{ width: '99.2%' }} className="h-full bg-white"></motion.div>
                </div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase">Database Latency (P95)</span>
                    <span className="text-xs font-black tracking-widest">12ms</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-6">
                    <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-emerald-400"></motion.div>
                </div>
                <button className="w-full py-3 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Download Audit Logs</button>
            </div>

            <div className="card p-6 bg-white border-[#F1F5F9]">
                <div className="flex items-center gap-3 mb-6">
                    <Database className="w-5 h-5 text-slate-400" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Storage Resilience</h4>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase italic">Primary Replicas</span>
                        <span className="text-[10px] font-black text-emerald-600 uppercase">Synchronized</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase italic">Cold Storage Offset</span>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">OK (412MB)</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase italic">Encryption Key Node</span>
                        <span className="text-[10px] font-black text-slate-900 uppercase">ACTIVE v2.1</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
