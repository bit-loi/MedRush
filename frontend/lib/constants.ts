import type { RiskLevel } from "@/types/medrush";

export type PipelineStage = "reach" | "reason" | "route";
export type QueueFilter = "all" | RiskLevel;
export type InventoryFilter = "all" | "attention";

export const clinicOptions = [
  { label: "Puskesmas Cibiru", value: "Puskesmas Cibiru" },
  { label: "Klinik Melati", value: "Klinik Melati" },
  { label: "Pustu Sukamaju", value: "Pustu Sukamaju" },
];

export const quickMessages = [
  "Saya pusing dan lupa minum tablet 2 hari.",
  "Obat saya sudah habis, bisa dikirim lagi?",
  "Saya mual setelah minum tablet.",
];

export const pipelineStages: Array<{
  description: string;
  id: PipelineStage;
  label: string;
}> = [
  { description: "WhatsApp check-ins", id: "reach", label: "Reach" },
  { description: "Risk signal extraction", id: "reason", label: "Reason" },
  { description: "Task and supply routing", id: "route", label: "Route" },
];

export const navItems = [
  { label: "Network", target: "network" },
  { label: "Signals", target: "signals" },
  { label: "Build on MedRush", target: "simulator" },
  { label: "Resources", target: "resources" },
  { label: "Community", target: "footer" },
];

export const footerColumns = [
  {
    label: "About MedRush",
    links: [
      { label: "District dashboard", target: "network" },
      { label: "Safety layer", target: "resources" },
      { label: "Pilot workflow", target: "signals" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "WhatsApp intake", target: "simulator" },
      { label: "Inventory watch", target: "inventory" },
      { label: "Audit trail", target: "resources" },
    ],
  },
  {
    label: "Use MedRush",
    links: [
      { label: "Risk signals", target: "signals" },
      { label: "Delivery routes", target: "routes" },
      { label: "Sync API", target: "network" },
    ],
  },
];
