export interface ProjectData {
  pricePerSq: number;
  squareFootage: number;
  hourlyRateWithMaterials: number;
  numPainters: number;
  hoursPerDay: number;
  paintCoverage: number;
  numberOfCoats: number;
  paintCostPerGallon: number;
  targetMaterialPercentage: number;
  targetMarginPercentage: number;
  subcontractPercentage: number;
  subHourlyRate: number;
  subNumPainters: number;
  subHoursPerDay: number;
}

export interface CalculatedValues {
  totalCostBySq: number;
  totalServiceHours: number;
  workDaysToComplete: number;
  gallonsNeeded: number;
  totalPaintCost: number;
  grossProfit: number;
  actualMarginPercentage: number;
  actualMaterialPercentage: number;
  subcontractValue: number;
  subcontractDays: number;
}

export type ProjectType = 'exterior' | 'interior' | 'both';

export interface ExteriorServices {
  softWash: boolean;
  scraping: boolean;
  sanding: boolean;
  priming: boolean;
  areas: string[];
  components: string[];
}

export interface InteriorServices {
  sanding: boolean;
  patching: boolean;
  crackRepair: boolean;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
  components: string[];
}

export interface DescriptionData {
  projectType: ProjectType;
  coats: number;
  exterior: ExteriorServices;
  interior: InteriorServices;
}

export interface MetricCardData {
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
}
