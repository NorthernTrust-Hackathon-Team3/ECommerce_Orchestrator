import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export type WorkflowTaskType = 
  | 'action' 
  | 'condition' 
  | 'human-input' 
  | 'http-call' 
  | 'event-publish' 
  | 'event-consume'
  | 'custom';

interface WorkflowTask {
  id: string;
  name: string;
  type: WorkflowTaskType;
  service?: string;
  dependencies: string[]; // ids of tasks that must finish first
  config?: {
    branch?: string; // Optional: only run if ancestor condition matches this branch
    url?: string; // For http-call
    topic?: string; // For events
    customType?: string; // For specialized workers
  };
}

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  tasks: WorkflowTask[];
}

interface WorkflowInstance {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: string;
  endTime?: string;
  taskStatuses: Record<string, 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped'>;
  taskResults?: Record<string, any>;
  logs: { timestamp: string; message: string; taskId?: string }[];
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // In-memory store
  const workflows: WorkflowDefinition[] = [
    {
      id: "order-fullfillment-v2",
      name: "Advanced Order Orchestration",
      description: "End-to-end fulfillment with parallel payment processing and restocking",
      tasks: [
        { id: "v1", name: "Inventory Check", type: "action", service: "InventorySvc", dependencies: [] },
        { id: "p1", name: "Credit Card Prep", type: "action", service: "PaymentSvc", dependencies: ["v1"] },
        { id: "p2", name: "UPI Gateway Sync", type: "action", service: "PaymentSvc", dependencies: ["v1"] },
        { id: "p3", name: "Payment Consolidator", type: "action", service: "PaymentSvc", dependencies: ["p1", "p2"] },
        { id: "n1", name: "Send Notification", type: "action", service: "NotifySvc", dependencies: ["p3"] },
        { id: "s1", name: "Assign Shipping", type: "action", service: "LogisticsSvc", dependencies: ["p3"] },
        { id: "r1", name: "Auto-Restock Trigger", type: "action", service: "InventorySvc", dependencies: ["s1"] },
      ]
    },
    {
      id: "restock-v1",
      name: "Inventory Restocking",
      description: "Automated replenishment when stock is low",
      tasks: [
        { id: "r1", name: "Monitor Stock Levels", type: "action", service: "InventorySvc", dependencies: [] },
        { id: "r2", name: "Identify Low Stock", type: "condition", service: "InventorySvc", dependencies: ["r1"] },
        { id: "r3", name: "Generate Purchase Order", type: "action", service: "VendorSvc", dependencies: ["r2"] },
        { id: "r4", name: "Vendor Confirmation", type: "human-input", service: "VendorPortal", dependencies: ["r3"] },
        { id: "r5", name: "Update Records", type: "action", service: "DB", dependencies: ["r4"] },
      ]
    }
  ];

  const instances: WorkflowInstance[] = [];

  // Mock Logistics Data
  const inventory: any[] = [
    { id: "p1", name: "Redmi Note 12", quantity: 450, status: "in-stock", domain: "Electronics" },
    { id: "p2", name: "Tata Salt", quantity: 1200, status: "in-stock", domain: "Groceries" },
    { id: "p3", name: "Saree Silk", quantity: 85, status: "low-stock", domain: "Clothes" },
    { id: "p4", name: "Bombay Dyeing Sheets", quantity: 0, status: "out-of-stock", domain: "Home Decor" },
    { id: "p5", name: "Lakme Lipstick", quantity: 300, status: "in-stock", domain: "Makeup" },
    { id: "p6", name: "Himalaya Face Wash", quantity: 500, status: "in-stock", domain: "Skincare" },
    { id: "p7", name: "Prestige Induction Cooker", quantity: 120, status: "in-stock", domain: "Home Decor" },
    { id: "p8", name: "Biba Kurta Set", quantity: 45, status: "low-stock", domain: "Clothes" },
    { id: "p9", name: "Boat BassHeads 100", quantity: 800, status: "in-stock", domain: "Electronics" },
    { id: "p10", name: "Maggi 2-Minute Noodles", quantity: 2500, status: "in-stock", domain: "Groceries" },
    { id: "p11", name: "Nike Air Max Bharat", quantity: 15, status: "low-stock", domain: "Clothes" },
  ];

  const warehouses: any[] = [
    { id: "w1", name: "Mumbai Hub", status: "active", capacity: 10000, currentLoad: 8200, type: "Cold Storage" },
    { id: "w2", name: "Bangalore Tech-Park", status: "active", capacity: 5000, currentLoad: 3100, type: "Electronics" },
    { id: "w3", name: "Delhi Central Logistics", status: "full", capacity: 2000, currentLoad: 2000, type: "General" },
    { id: "w4", name: "Chennai Port Depot", status: "active", capacity: 8000, currentLoad: 5200, type: "Dry Goods" },
    { id: "w5", name: "Kolkata East Terminal", status: "active", capacity: 3000, currentLoad: 1200, type: "Secure Storage" },
  ];

  const vendors: any[] = [
    { id: "v1", name: "Reliance Retail", status: "verified", productCount: 42, type: "Manufacturer", isLocal: false },
    { id: "v2", name: "Tata Consumer Products", status: "verified", productCount: 145, type: "Wholesale", isLocal: false },
    { id: "v3", name: "Nykaa Indian Beauty", status: "verified", productCount: 88, type: "Distributor", isLocal: false },
    { id: "v4", name: "Aditya Birla Fashion", status: "verified", productCount: 210, type: "Manufacturer", isLocal: false },
  ];

  const localVendors: any[] = [
    { id: "lv1", name: "Bangalore Silk Emporium", status: "verified", productCount: 128, type: "Manufacturer", isLocal: true, avgProfitMargin: 42 },
    { id: "lv2", name: "Koramangala Crafts", status: "verified", productCount: 75, type: "Distributor", isLocal: true, avgProfitMargin: 38 },
    { id: "lv3", name: "Whitefield Organics", status: "verified", productCount: 92, type: "Manufacturer", isLocal: true, avgProfitMargin: 45 },
    { id: "lv4", name: "Indiranagar Local Mart", status: "verified", productCount: 161, type: "Wholesale", isLocal: true, avgProfitMargin: 51 },
  ];

  const salesData: any[] = [
    { month: "Jan", sales: 4000, profit: 2400 },
    { month: "Feb", sales: 3000, profit: 1398 },
    { month: "Mar", sales: 2000, profit: 9800 },
    { month: "Apr", sales: 6780, profit: 3908 },
    { month: "May", sales: 7890, profit: 4800 },
    { month: "Jun", sales: 8390, profit: 3800 },
    { month: "Jul", sales: 9490, profit: 4300 },
  ];

  const payments: any[] = [
    { id: "PAY-IND-001", orderId: "ORD-IND-9821", amount: 12000, status: "completed", timestamp: "2026-04-21T10:00:00Z", user: "John Doe", product: "Redmi Note 12" },
    { id: "PAY-IND-002", orderId: "ORD-IND-9822", amount: 4500, status: "pending", timestamp: "2026-04-21T12:30:00Z", user: "Anita Sharma", product: "Lakme Lipstick" },
    { id: "PAY-IND-003", orderId: "ORD-IND-9823", amount: 89000, status: "completed", timestamp: "2026-04-21T14:15:00Z", user: "Rohan Varma", product: "Saree Silk" },
    { id: "PAY-IND-004", orderId: "ORD-IND-9824", amount: 1540, status: "completed", timestamp: "2026-04-21T15:45:00Z", user: "Dharmika", product: "Tata Salt" },
    { id: "PAY-IND-005", orderId: "ORD-IND-9825", amount: 599, status: "completed", timestamp: "2026-04-22T08:00:00Z", user: "Suresh Raina", product: "Cricket Ball" },
    { id: "PAY-IND-006", orderId: "ORD-IND-9826", amount: 1250, status: "failed", timestamp: "2026-04-22T09:15:00Z", user: "Priya Patel", product: "Yoga Mat" },
    { id: "PAY-IND-007", orderId: "ORD-IND-9827", amount: 24900, status: "completed", timestamp: "2026-04-22T10:30:00Z", user: "Amit Shah", product: "Dyson Vacuum" },
    { id: "PAY-IND-008", orderId: "ORD-IND-9828", amount: 450, status: "pending", timestamp: "2026-04-22T11:45:00Z", user: "Nisha Gupta", product: "Bangle Set" },
  ];

  const shipments: any[] = [
    { 
        id: "SH-001", orderId: "ORD-IND-9821", status: "In Transit", location: "Bangalore Hub", ETA: "2026-04-22", product: "Redmi Note 12",
        trackingData: [
            { stage: "Order Placed", completed: true },
            { stage: "Payment Verified", completed: true },
            { stage: "Shipped", completed: true },
            { stage: "In Transit", completed: true, current: true },
            { stage: "Out for Delivery", completed: false },
            { stage: "Delivered", completed: false }
        ]
    },
    { 
        id: "SH-002", orderId: "ORD-IND-9822", status: "Processing", location: "Mumbai Central", ETA: "2026-04-25", product: "Lakme Lipstick",
        trackingData: [
            { stage: "Order Placed", completed: true },
            { stage: "Payment Pending", completed: false, current: true },
            { stage: "Shipped", completed: false },
            { stage: "Delivered", completed: false }
        ]
    },
    { 
        id: "SH-003", orderId: "ORD-IND-9823", status: "Delivered", location: "Delhi Doorstep", ETA: "Completed", product: "Saree Silk",
        trackingData: [
            { stage: "Order Placed", completed: true },
            { stage: "Payment Verified", completed: true },
            { stage: "Shipped", completed: true },
            { stage: "Delivered", completed: true, current: true }
        ]
    },
    { 
        id: "SH-004", orderId: "ORD-IND-9824", status: "Out for Delivery", location: "Chennai Distro", ETA: "Today", product: "Tata Salt",
        trackingData: [
            { stage: "Order Placed", completed: true },
            { stage: "Payment Verified", completed: true },
            { stage: "Shipped", completed: true },
            { stage: "Out for Delivery", completed: true, current: true },
            { stage: "Delivered", completed: false }
        ]
    },
    { 
        id: "SH-005", orderId: "ORD-IND-9825", status: "Processing", location: "Chennai Hub", ETA: "2026-04-26", product: "Cricket Ball",
        trackingData: [
            { stage: "Order Placed", completed: true },
            { stage: "Payment Verified", completed: true, current: true },
            { stage: "Shipped", completed: false },
            { stage: "Delivered", completed: false }
        ]
    },
  ];

  // API Routes
  app.get("/api/inventory", (req, res) => res.json(inventory));
  app.get("/api/warehouses", (req, res) => res.json(warehouses));
  app.get("/api/vendors", (req, res) => res.json(vendors));
  app.get("/api/local-vendors", (req, res) => res.json(localVendors));
  app.get("/api/sales", (req, res) => res.json(salesData));
  app.get("/api/shipments", (req, res) => res.json(shipments));
  app.get("/api/payments", (req, res) => res.json(payments));

  app.get("/api/workflows", (req, res) => {
    res.json(workflows);
  });

  app.get("/api/instances", (req, res) => {
    res.json(instances);
  });

  app.post("/api/instances", (req, res) => {
    const { workflowId } = req.body;
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return res.status(404).json({ error: "Workflow not found" });

    const newInstance: WorkflowInstance = {
      id: uuidv4(),
      workflowId,
      status: "running",
      startTime: new Date().toISOString(),
      taskStatuses: workflow.tasks.reduce((acc, t) => ({ ...acc, [t.id]: 'pending' }), {}),
      taskResults: {},
      logs: [{ timestamp: new Date().toISOString(), message: `Workflow ${workflow.name} started.` }]
    };

    instances.unshift(newInstance);
    
    // Start background execution simulation
    runWorkflowInstance(newInstance.id);

    res.json(newInstance);
  });

  app.get("/api/instances/:id", (req, res) => {
    const instance = instances.find(i => i.id === req.params.id);
    if (!instance) return res.status(404).json({ error: "Instance not found" });
    res.json(instance);
  });

  app.post("/api/instances/:id/action", (req, res) => {
    const { action } = req.body;
    const instance = instances.find(i => i.id === req.params.id);
    if (!instance) return res.status(404).json({ error: "Instance not found" });

    const workflow = workflows.find(w => w.id === instance.workflowId);
    if (!workflow) return res.status(404).json({ error: "Workflow not found" });

    if (action === "pause") instance.status = "paused";
    if (action === "resume" || action === "approve") {
        instance.status = "running";
        // If it was waiting for human input, complete that task
        const waitingTask = workflow.tasks.find(t => 
            instance.taskStatuses[t.id] === 'in-progress' && t.type === 'human-input'
        );
        if (waitingTask) {
            instance.taskStatuses[waitingTask.id] = 'completed';
            instance.logs.push({ timestamp: new Date().toISOString(), message: `Human approval granted for: ${waitingTask.name}` });
        }
        runWorkflowInstance(instance.id);
    }
    if (action === "retry") {
        instance.status = "running";
        // Reset failed tasks to pending
        Object.keys(instance.taskStatuses).forEach(tid => {
            if (instance.taskStatuses[tid] === 'failed') instance.taskStatuses[tid] = 'pending';
        });
        runWorkflowInstance(instance.id);
    }

    res.json(instance);
  });

  // Orchestrator Simulator
  async function runWorkflowInstance(instanceId: string) {
    const instance = instances.find(i => i.id === instanceId);
    if (!instance || instance.status !== "running") return;

    const workflow = workflows.find(w => w.id === instance.workflowId);
    if (!workflow) return;

    let progress = true;
    while (progress && instance.status === "running") {
      progress = false;
      const tasks = workflow.tasks;

      for (const task of tasks) {
        if (instance.taskStatuses[task.id] !== 'pending') continue;

        // Check Branch Constraint
        if (task.config?.branch) {
            const parentCondition = tasks.find(t => t.id === task.dependencies[0]);
            if (parentCondition && instance.taskResults?.[parentCondition.id] !== task.config.branch) {
                instance.taskStatuses[task.id] = 'skipped';
                progress = true;
                continue;
            }
        }

        // Check if dependencies are met (completed or skipped)
        const depsMet = task.dependencies.every(depId => 
            instance.taskStatuses[depId] === 'completed' || instance.taskStatuses[depId] === 'skipped'
        );

        if (depsMet) {
          progress = true;
          instance.taskStatuses[task.id] = 'in-progress';
          instance.logs.push({ 
            timestamp: new Date().toISOString(), 
            message: `Executing [${task.type.toUpperCase()}]: ${task.name}`, 
            taskId: task.id 
          });

          // Simulate task work based on type
          if (task.type === 'human-input') {
              instance.status = 'paused'; // Stop execution until resumed
              instance.logs.push({ timestamp: new Date().toISOString(), message: `Workflow WAITING for human approval: ${task.name}`, taskId: task.id });
              return;
          }

          (async () => {
            const delay = Math.random() * 2000 + 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            
            if (instance.status === 'paused') {
                // If it was paused during execution (not human-input), reset
                if (instance.taskStatuses[task.id] === 'in-progress') {
                    instance.taskStatuses[task.id] = 'pending';
                }
                return;
            }

            // Task Logic
            if (task.id === 'v1') {
                instance.logs.push({ timestamp: new Date().toISOString(), message: "Scanning Indian Warehouse nodes for stock availability...", taskId: task.id });
                const available = Math.random() > 0.1;
                instance.taskResults![task.id] = available ? 'available' : 'unavailable';
            }
            if (task.id === 'p1') {
                instance.logs.push({ timestamp: new Date().toISOString(), message: "Initiating Credit Card Auth via Secure Gateway...", taskId: task.id });
            }
            if (task.id === 'p2') {
                instance.logs.push({ timestamp: new Date().toISOString(), message: "Syncing UPI Deep-link with Mobile App Handle...", taskId: task.id });
            }
            if (task.id === 'p3') {
                instance.logs.push({ timestamp: new Date().toISOString(), message: "Consolidating multi-channel payment verification...", taskId: task.id });
            }
            if (task.id === 's1') {
                instance.logs.push({ timestamp: new Date().toISOString(), message: "Generating Bharat-Logistics Manifest and Shipping Labels...", taskId: task.id });
            }
            if (task.id === 'r1') {
                instance.logs.push({ timestamp: new Date().toISOString(), message: "Triggering JIT Restocking for regional warehouse...", taskId: task.id });
            }

            if (task.type === 'condition') {
                const decision = Math.random() > 0.5 ? 'bulk' : 'standard';
                instance.taskResults![task.id] = decision;
                instance.logs.push({ timestamp: new Date().toISOString(), message: `Decision made: ${decision}`, taskId: task.id });
            }

            // Simulate random failure (3% chance)
            if (Math.random() < 0.03) {
              instance.taskStatuses[task.id] = 'failed';
              instance.status = 'failed';
              instance.logs.push({ 
                timestamp: new Date().toISOString(), 
                message: `Task ${task.name} FAILED!`, 
                taskId: task.id 
              });
            } else {
              instance.taskStatuses[task.id] = 'completed';
              instance.logs.push({ 
                timestamp: new Date().toISOString(), 
                message: `Task ${task.name} finished.`, 
                taskId: task.id 
              });
              runWorkflowInstance(instanceId);
            }
          })();
        }
      }

      // Check if all tasks finished (completed, failed, or skipped)
      const allDone = tasks.every(t => ['completed', 'failed', 'skipped'].includes(instance.taskStatuses[t.id]));
      if (allDone) {
        if (tasks.some(t => instance.taskStatuses[t.id] === 'failed')) {
            instance.status = 'failed';
        } else {
            instance.status = 'completed';
            instance.endTime = new Date().toISOString();
            instance.logs.push({ timestamp: new Date().toISOString(), message: "DAG execution finalized successfully." });
        }
        break;
      }

      if (!progress) break; 
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus Flow Server running on http://localhost:${PORT}`);
  });
}

startServer();
