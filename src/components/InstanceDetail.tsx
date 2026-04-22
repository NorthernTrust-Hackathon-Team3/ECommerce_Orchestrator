import { X, Play, Pause, RefreshCw, Terminal, Activity } from "lucide-react";
import { WorkflowDefinition, WorkflowInstance } from "../types";
import { cn } from "../lib/utils";
import WorkflowGraph from "./WorkflowGraph";
import LogViewer from "./LogViewer";

interface InstanceDetailProps {
  instance?: WorkflowInstance;
  workflow?: WorkflowDefinition;
  onClose: () => void;
}

export default function InstanceDetail({ instance, workflow, onClose }: InstanceDetailProps) {
  if (!instance || !workflow) return null;

  const handleAction = async (action: string) => {
    try {
      await fetch(`/api/instances/${instance.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Detail Header */}
      <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center border border-[#E0E7FF] shadow-sm">
            <Activity className="w-7 h-7 text-[#4F46E5]" />
          </div>
          <div>
            <h3 className="font-bold text-xl leading-tight text-[#0F172A]">{workflow.name}</h3>
            <p className="text-[10px] text-[#64748B] uppercase tracking-widest mt-1 font-bold">{instance.id}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-[#F1F5F9] rounded-full transition-colors">
          <X className="w-5 h-5 text-[#94A3B8]" />
        </button>
      </div>

      {/* Control Bar */}
      <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-4 bg-white shadow-sm z-10">
        <div className="flex bg-[#F8FAFC] rounded-lg p-1 border border-[#E2E8F0]">
           <button 
             disabled={instance.status !== 'paused'}
             onClick={() => handleAction('resume')}
             className="px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all uppercase tracking-tight text-[#475569]"
           >
             <Play className="w-3.5 h-3.5 fill-[#4F46E5] text-[#4F46E5]" /> Resume
           </button>
           <button 
             disabled={instance.status !== 'running'}
             onClick={() => handleAction('pause')}
             className="px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all uppercase tracking-tight text-[#475569]"
           >
             <Pause className="w-3.5 h-3.5 fill-[#64748B] text-[#64748B]" /> Pause
           </button>
           <div className="w-px h-4 bg-[#E2E8F0] self-center mx-1"></div>
           <button 
             disabled={instance.status !== 'failed'}
             onClick={() => handleAction('retry')}
             className="px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all uppercase tracking-tight text-[#EF4444]"
           >
             <RefreshCw className="w-3.5 h-3.5" /> Retry
           </button>
        </div>
        <div className="flex-1"></div>
        <div className="hidden md:flex items-center gap-3">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Health</span>
            <div className="w-24 h-2 bg-[#F1F5F9] rounded-full overflow-hidden border border-[#E2E8F0]">
                <div className="h-full bg-[#10B981] w-[92%] transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
            </div>
        </div>
      </div>

      {/* Primary View: Workflow Graph */}
      <div className="flex-1 min-h-0 bg-[#F1F5F9]/30 relative overflow-hidden">
        <div className="absolute inset-0 p-8">
            <WorkflowGraph workflow={workflow} taskStatuses={instance.taskStatuses} />
        </div>
      </div>

      {/* Secondary View: Activity Logs */}
      <div className="h-1/3 border-t border-[#E2E8F0] bg-white flex flex-col">
        <div className="px-6 py-3 border-b border-[#E2E8F0] flex items-center gap-2 bg-[#F8FAFC]">
            <Terminal className="w-4 h-4 text-[#64748B]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Live Execution Log</span>
        </div>
        <div className="flex-1 p-6 font-mono text-[11px] overflow-auto">
            <LogViewer logs={instance.logs} />
        </div>
      </div>
    </div>
  );
}
