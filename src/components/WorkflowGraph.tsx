import { motion } from "motion/react";
import { WorkflowDefinition, WorkflowTask } from "../types";
import { cn } from "../lib/utils";
import { Check, Clock, AlertTriangle, PlayCircle } from "lucide-react";

interface WorkflowGraphProps {
  workflow: WorkflowDefinition;
  taskStatuses: Record<string, string>;
}

export default function WorkflowGraph({ workflow, taskStatuses }: WorkflowGraphProps) {
  // Simple layout logic: Layer tasks based on depth in DAG
  const layers: WorkflowTask[][] = [];
  const taskMap = new Map<string, WorkflowTask>(workflow.tasks.map(t => [t.id, t]));
  const processed = new Set<string>();

  let currentLayer = workflow.tasks.filter(t => t.dependencies.length === 0);
  while (currentLayer.length > 0) {
    layers.push(currentLayer);
    currentLayer.forEach(t => processed.add(t.id));
    
    const nextLayer: WorkflowTask[] = [];
    workflow.tasks.forEach(t => {
        if (!processed.has(t.id) && t.dependencies.every(d => processed.has(d))) {
            if (!nextLayer.some(nt => nt.id === t.id)) nextLayer.push(t);
        }
    });
    currentLayer = nextLayer;
  }

  // Handle potentially missed nodes due to cycles (though it should be a DAG)
  if (processed.size < workflow.tasks.length) {
      const remaining = workflow.tasks.filter(t => !processed.has(t.id));
      if (remaining.length) layers.push(remaining);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return "border-[#10B981] bg-[#ECFDF5] text-[#10B981] shadow-sm";
      case 'in-progress': return "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5] animate-pulse";
      case 'failed': return "border-[#EF4444] bg-[#FEF2F2] text-[#EF4444]";
      default: return "border-[#E2E8F0] bg-white text-[#64748B]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-3.5 h-3.5" />;
      case 'in-progress': return <PlayCircle className="w-3.5 h-3.5 animate-spin-slow" />;
      case 'failed': return <AlertTriangle className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex flex-col gap-16 items-center justify-center min-h-full py-12">
      {layers.map((layer, lIndex) => (
        <div key={lIndex} className="flex gap-12 items-center justify-center">
          {layer.map((task) => (
            <motion.div
              layout
              key={task.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "relative w-40 p-4 border rounded-xl flex flex-col items-center text-center transition-all duration-500 shadow-sm",
                getStatusColor(taskStatuses[task.id])
              )}
            >
               {/* Connections */}
               {task.dependencies.map((depId, dIndex) => (
                   <div key={dIndex} className="absolute -top-16 left-1/2 -translate-x-1/2 h-16 w-px bg-[#E2E8F0] -z-10">
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#CBD5E1]"></div>
                   </div>
               ))}

               <div className="mb-2 p-1.5 rounded-lg bg-current opacity-10"></div>
               <div className="absolute top-4 left-4">
                    {getStatusIcon(taskStatuses[task.id])}
               </div>
               <span className="text-xs font-bold uppercase tracking-tight">{task.name}</span>
               <span className="text-[9px] opacity-60 font-mono mt-1 font-bold underline decoration-dotted">{task.service}</span>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}
