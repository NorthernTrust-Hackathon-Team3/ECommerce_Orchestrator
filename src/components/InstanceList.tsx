import { CheckCircle2, Clock, XCircle, PauseCircle, ChevronRight } from "lucide-react";
import { WorkflowInstance } from "../types";
import { cn } from "../lib/utils";

interface InstanceListProps {
  instances: WorkflowInstance[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function InstanceList({ instances, selectedId, onSelect }: InstanceListProps) {
  const getStatusIcon = (status: WorkflowInstance['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-[#10B981]" />;
      case 'failed': return <XCircle className="w-4 h-4 text-[#EF4444]" />;
      case 'paused': return <PauseCircle className="w-4 h-4 text-[#F59E0B]" />;
      case 'running': return <Clock className="w-4 h-4 text-[#4F46E5] animate-spin-slow" />;
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-[1fr,150px,150px,100px,40px] px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]/50">
        <div className="col-header">Instance ID</div>
        <div className="col-header">Start Time</div>
        <div className="col-header">End Time</div>
        <div className="col-header text-right">Status</div>
        <div></div>
      </div>
      <div className="divide-y divide-[#E2E8F0]">
        {instances.length === 0 && (
          <div className="px-6 py-12 text-center text-[#64748B] italic text-sm">
            No active workflows. Select a workflow from the sidebar to start.
          </div>
        )}
        {instances.map((instance) => (
          <div
            key={instance.id}
            onClick={() => onSelect(instance.id)}
            className={cn(
              "data-row grid grid-cols-[1fr,150px,150px,100px,40px] items-center px-6 py-4 cursor-pointer",
              selectedId === instance.id ? "bg-[#F1F5F9] border-l-4 border-[#4F46E5]" : ""
            )}
          >
            <div className="flex flex-col">
              <span className="data-value text-sm font-semibold text-[#0F172A]">{instance.id.slice(0, 8)}...</span>
              <span className="text-[10px] text-[#64748B] uppercase tracking-widest font-bold">{instance.workflowId}</span>
            </div>
            <div className="text-xs text-[#475569] font-mono">
              {new Date(instance.startTime).toLocaleTimeString()}
            </div>
            <div className="text-xs text-[#475569] font-mono">
              {instance.endTime ? new Date(instance.endTime).toLocaleTimeString() : '--:--:--'}
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className={cn(
                "text-[10px] uppercase font-bold tracking-tight",
                instance.status === 'completed' && "text-[#10B981]",
                instance.status === 'failed' && "text-[#EF4444]",
                instance.status === 'running' && "text-[#4F46E5]",
                instance.status === 'paused' && "text-[#F59E0B]",
              )}>
                {instance.status}
              </span>
              {getStatusIcon(instance.status)}
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8] ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
