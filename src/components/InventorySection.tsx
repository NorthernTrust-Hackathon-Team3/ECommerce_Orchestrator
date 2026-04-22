import { useState, useEffect } from "react";
import { Package, Smartphone, Shirt, Coffee, Home, AlertCircle, Sparkles, Wand2, Scissors, Download } from "lucide-react";
import { InventoryItem } from "../types";
import { cn } from "../lib/utils";

export default function InventorySection() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inventory")
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'Electronics': return <Smartphone className="w-5 h-5" />;
      case 'Clothes': return <Shirt className="w-5 h-5" />;
      case 'Groceries': return <Coffee className="w-5 h-5" />;
      case 'Home Decor': return <Home className="w-5 h-5" />;
      case 'Makeup': return <Sparkles className="w-5 h-5" />;
      case 'Skincare': return <Wand2 className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Name", "Quantity", "Domain", "Status"];
    const rows = items.map(i => [i.id, i.name, i.quantity, i.domain, i.status].join(","));
    const csvContent = [headers.join(","), ...rows].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Inventory...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="card-label">Total SKUs</div>
          <div className="text-3xl font-extrabold text-[#0F172A]">{items.length}</div>
          <div className="text-[10px] text-[#10B981] font-bold mt-1 uppercase tracking-wider">↑ 4% this week</div>
        </div>
        <div className="card p-6">
          <div className="card-label">In Stock</div>
          <div className="text-3xl font-extrabold text-[#10B981]">{items.filter(i => i.status === 'in-stock').length}</div>
        </div>
        <div className="card p-6">
          <div className="card-label">Low Stock</div>
          <div className="text-3xl font-extrabold text-[#F59E0B]">{items.filter(i => i.status === 'low-stock').length}</div>
        </div>
        <div className="card p-6 border-red-100">
          <div className="card-label">Out of Stock</div>
          <div className="text-3xl font-extrabold text-[#EF4444]">{items.filter(i => i.status === 'out-of-stock').length}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]/50 flex justify-between items-center">
            <h3 className="font-bold text-[#0F172A]">Stock Status & Domains</h3>
            <button 
              onClick={exportCSV}
              className="text-[10px] uppercase font-bold text-[#4F46E5] cursor-pointer flex items-center gap-1.5 hover:underline"
            >
              <Download className="w-3 h-3" />
              Export CSV
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/30 text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Domain</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-[#0F172A]">{item.name}</div>
                    <div className="text-[10px] text-[#94A3B8] font-mono">ID: {item.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-[#475569]">{item.quantity}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
                      <div className="p-1.5 rounded bg-[#EEF2FF] text-[#4F46E5]">
                        {getDomainIcon(item.domain)}
                      </div>
                      {item.domain}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold uppercase py-1 px-2 rounded-full border",
                      item.status === 'in-stock' && "bg-[#ECFDF5] text-[#10B981] border-[#10B981]/20",
                      item.status === 'low-stock' && "bg-[#FFFBEB] text-[#F59E0B] border-[#F59E0B]/20",
                      item.status === 'out-of-stock' && "bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/20",
                    )}>
                      {item.status.replace('-', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
