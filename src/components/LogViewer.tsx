import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface LogViewerProps {
  logs: { timestamp: string; message: string; taskId?: string }[];
}

export default function LogViewer({ logs }: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div ref={containerRef} className="h-full space-y-2 font-mono text-[11px] text-[#475569] overflow-auto">
      <AnimatePresence initial={false}>
        {logs.map((log, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 group"
          >
            <span className="text-[#94A3B8] shrink-0 font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className={cn(
                "transition-colors",
                log.message.includes('FAILED') ? 'text-red-500 font-bold' : 'text-[#334155]'
            )}>
              {log.message}
            </span>
            {log.taskId && (
              <span className="text-[9px] uppercase font-bold text-[#CBD5E1] opacity-0 group-hover:opacity-100 transition-opacity">
                #{log.taskId}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
