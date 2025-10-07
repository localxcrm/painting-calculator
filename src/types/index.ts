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
  salesCommissionPercentage: number;
  pmCommissionPercentage: number;
  paintBudgetPercentage: number;
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

// Interior Painting Calculator Types
export interface InteriorRoomData {
  id: string;
  name: string;
  length: number; // in feet
  width: number; // in feet
  floorArea?: number; // alternative input in square feet
  ceilingHeight: number; // in feet, typically 8-9 feet
  hasBaseboards: boolean;
  hasCrownMolding: boolean;
  hasChairRail: boolean;
  doors: number; // number of doors
  windows: number; // number of windows
}

export interface InteriorCalculatedValues {
  totalFloorArea: number;
  totalWallArea: number;
  totalCeilingArea: number;
  totalTrimArea: number; // baseboards, crown molding, chair rail
  totalDoorArea: number;
  totalWindowArea: number;
  netWallArea: number; // walls minus doors and windows
  totalPaintableArea: number;

  // Paint calculations
  wallPaintGallons: number;
  ceilingPaintGallons: number;
  trimPaintGallons: number;
  totalPaintGallons: number;

  wallPaintCost: number;
  ceilingPaintCost: number;
  trimPaintCost: number;
  totalPaintCost: number;

  // Labor estimates
  estimatedHours: number;
  estimatedDays: number;
  laborCost: number;

  // Total project cost
  totalProjectCost: number;
  profitMargin: number;
}

export interface InteriorCalculatorInputs {
  rooms: InteriorRoomData[];
  paintCoverage: number; // sq ft per gallon
  paintCostPerGallon: number;
  hourlyLaborRate: number;
  numberOfCoats: number;
  ceilingHeight: number; // default ceiling height
  profitMarginPercentage: number;
  pricePerSqFt: number; // price per square foot for total cost calculation
  paintCeiling: boolean; // whether to paint ceilings
  paintTrim: boolean; // whether to paint trim
  paintBudgetPercentage: number; // percentage of project budget allocated to paint
  targetMarginPercentage: number; // target margin percentage
  subcontractPercentage: number; // percentage of work subcontracted
  subHourlyRate: number; // subcontract hourly rate
  subNumPainters: number; // number of subcontract painters
  subHoursPerDay: number; // subcontract hours per day
  salesCommissionPercentage: number; // sales commission percentage
  pmCommissionPercentage: number; // project manager commission percentage
}
