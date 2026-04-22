export type WorkflowTaskType = 
  | 'action' 
  | 'condition' 
  | 'human-input' 
  | 'http-call' 
  | 'event-publish' 
  | 'event-consume'
  | 'custom';

export interface WorkflowTask {
  id: string;
  name: string;
  type: WorkflowTaskType;
  service?: string;
  dependencies: string[];
  config?: Record<string, any>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  tasks: WorkflowTask[];
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: string;
  endTime?: string;
  taskStatuses: Record<string, 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped'>;
  taskResults?: Record<string, any>;
  logs: { timestamp: string; message: string; taskId?: string }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  quantity: number;
  domain: 'Electronics' | 'Apparel' | 'Groceries' | 'Home';
}

export interface Warehouse {
  id: string;
  name: string;
  status: 'active' | 'full' | 'maintenance';
  capacity: number;
  currentload: number;
  type: 'Cold Storage' | 'Dry Goods' | 'Bulk';
}

export interface Vendor {
  id: string;
  name: string;
  status: 'verified' | 'pending' | 'suspended';
  productCount: number;
  type: 'Wholesale' | 'Manufacturer' | 'Distributor';
  isLocal?: boolean;
  avgProfitMargin?: number;
}
