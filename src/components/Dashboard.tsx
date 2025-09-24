'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calculator as CalculatorIcon, FileText, Copy, CheckCircle } from 'lucide-react';
import MetricCard from './MetricCard';
import Calculator from './Calculator';
import DescriptionGenerator from './DescriptionGenerator';
import { ProjectData, CalculatedValues, MetricCardData } from '@/types';

const defaultProjectData: ProjectData = {
  pricePerSq: 4.00,
  squareFootage: 3800,
  hourlyRateWithMaterials: 65,
  numPainters: 3,
  hoursPerDay: 10,
  paintCoverage: 350,
  numberOfCoats: 2,
  paintCostPerGallon: 65,
  targetMaterialPercentage: 12,
  targetMarginPercentage: 25,
  subcontractPercentage: 50,
  subHourlyRate: 35,
  subNumPainters: 2,
  subHoursPerDay: 8,
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'description'>('calculator');
  const [projectData, setProjectData] = useState<ProjectData>(defaultProjectData);
  const [calculatedValues, setCalculatedValues] = useState<CalculatedValues>({
    totalCostBySq: 0,
    totalServiceHours: 0,
    workDaysToComplete: 0,
    gallonsNeeded: 0,
    totalPaintCost: 0,
    grossProfit: 0,
    actualMarginPercentage: 0,
    actualMaterialPercentage: 0,
    subcontractValue: 0,
    subcontractDays: 0,
  });
  const [workOrderCopied, setWorkOrderCopied] = useState(false);

  const calculateValues = useCallback(() => {
    const totalCostBySq = projectData.pricePerSq * projectData.squareFootage;
    const totalServiceHours = totalCostBySq / projectData.hourlyRateWithMaterials;
    const workDaysToComplete = totalServiceHours / (projectData.numPainters * projectData.hoursPerDay);
    const gallonsNeeded = (projectData.squareFootage / projectData.paintCoverage) * projectData.numberOfCoats;
    const totalPaintCost = gallonsNeeded * projectData.paintCostPerGallon;
    const subcontractValue = totalCostBySq * (projectData.subcontractPercentage / 100);
    const subcontractDays = subcontractValue / (projectData.subHourlyRate * projectData.subNumPainters * projectData.subHoursPerDay);

    // Margem calculada apenas com base no trabalho, sem subtrair tinta e subcontrato
    const grossProfit = totalCostBySq - subcontractValue;
    const actualMarginPercentage = (grossProfit / totalCostBySq) * 100;
    const actualMaterialPercentage = (totalPaintCost / totalCostBySq) * 100;

    setCalculatedValues({
      totalCostBySq,
      totalServiceHours,
      workDaysToComplete,
      gallonsNeeded,
      totalPaintCost,
      grossProfit,
      actualMarginPercentage,
      actualMaterialPercentage,
      subcontractValue,
      subcontractDays,
    });
  }, [projectData]);

  useEffect(() => {
    calculateValues();
  }, [calculateValues]);

  const updateProjectData = (updates: Partial<ProjectData>) => {
    setProjectData(prev => ({ ...prev, ...updates }));
  };

  const getTrend = (value: number, target: number, isHigherBetter: boolean = true) => {
    if (isHigherBetter) {
      return value >= target ? 'up' : 'down';
    } else {
      return value <= target ? 'up' : 'down';
    }
  };

  const metrics: MetricCardData[] = [
    {
      title: 'Total Project Value',
      value: `$${calculatedValues.totalCostBySq.toLocaleString()}`,
      trend: 'neutral',
      icon: 'dollar'
    },
    {
      title: 'Gross Profit',
      value: `$${calculatedValues.grossProfit.toLocaleString()}`,
      trend: getTrend(calculatedValues.actualMarginPercentage, projectData.targetMarginPercentage),
      icon: 'dollar'
    },
    {
      title: 'Project Timeline',
      value: `${calculatedValues.workDaysToComplete.toFixed(1)} days`,
      trend: 'neutral',
      icon: 'calendar'
    },
    {
      title: 'Material Cost',
      value: `${calculatedValues.actualMaterialPercentage.toFixed(1)}%`,
      trend: getTrend(projectData.targetMaterialPercentage, calculatedValues.actualMaterialPercentage, false),
      icon: 'percent'
    },
    {
      title: 'Subcontract Value',
      value: `$${calculatedValues.subcontractValue.toLocaleString()}`,
      trend: 'neutral',
      icon: 'users'
    }
  ];

  const generateWorkOrder = () => {
    const workOrder = `
PROFESSIONAL PAINTING WORK ORDER

Project Details:
- Total Square Footage: ${projectData.squareFootage.toLocaleString()} SF
- Price per Square Foot: $${projectData.pricePerSq.toFixed(2)}
- Total Project Value: $${calculatedValues.totalCostBySq.toLocaleString()}

Labor Requirements:
- Hourly Rate: $${projectData.hourlyRateWithMaterials}
- Number of Painters: ${projectData.numPainters}
- Hours per Day: ${projectData.hoursPerDay}
- Total Hours Required: ${calculatedValues.totalServiceHours.toFixed(1)}
- Estimated Completion: ${calculatedValues.workDaysToComplete.toFixed(1)} days

Material Requirements:
- Paint Coverage: ${projectData.paintCoverage} SF/gallon
- Number of Coats: ${projectData.numberOfCoats}
- Paint Cost per Gallon: $${projectData.paintCostPerGallon}
- Gallons Required: ${calculatedValues.gallonsNeeded.toFixed(1)}
- Total Paint Cost: $${calculatedValues.totalPaintCost.toFixed(2)}

Financial Analysis:
- Gross Profit: $${calculatedValues.grossProfit.toLocaleString()}
- Actual Margin: ${calculatedValues.actualMarginPercentage.toFixed(1)}%
- Target Margin: ${projectData.targetMarginPercentage}%
- Material Percentage: ${calculatedValues.actualMaterialPercentage.toFixed(1)}%
- Target Material: ${projectData.targetMaterialPercentage}%

Subcontract Information:
- Subcontract Percentage: ${projectData.subcontractPercentage}%
- Subcontract Value: $${calculatedValues.subcontractValue.toLocaleString()}
- Sub Hourly Rate: $${projectData.subHourlyRate}
- Sub Painters: ${projectData.subNumPainters}
- Sub Hours per Day: ${projectData.subHoursPerDay}
- Subcontract Days: ${calculatedValues.subcontractDays.toFixed(1)}
    `.trim();

    return workOrder;
  };

  const copyWorkOrder = async () => {
    try {
      await navigator.clipboard.writeText(generateWorkOrder());
      setWorkOrderCopied(true);
      setTimeout(() => setWorkOrderCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy work order: ', err);
    }
  };

  return (
    <div className="min-vh-100 p-4">
      {/* Header */}
      <div className="bg-white border-bottom sticky-top mb-5 py-4 px-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4">
          <div>
            <h1 className="display-5 fw-bold text-dark mb-2">
              Professional Painting Calculator
            </h1>
            <p className="text-muted lead mb-0">
              Comprehensive business tool for painting contractors
            </p>
          </div>
          <button
            onClick={copyWorkOrder}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            {workOrderCopied ? (
              <>
                <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />
                <span>Work Order Copied!</span>
              </>
            ) : (
              <>
                <Copy style={{ width: '1.25rem', height: '1.25rem' }} />
                <span>Generate Work Order</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row g-3 mb-5">
        {metrics.map((metric, index) => (
          <div key={index} className="col-12 col-md-6 col-xl-2-4">
            <MetricCard {...metric} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="d-flex gap-1 mb-4 p-1 bg-light rounded-pill d-inline-flex">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`btn d-flex align-items-center gap-2 px-4 py-2 fw-semibold ${
            activeTab === 'calculator'
              ? 'btn-primary'
              : 'btn-outline-secondary'
          }`}
        >
          <CalculatorIcon style={{ width: '1.25rem', height: '1.25rem' }} />
          <span>Calculator</span>
        </button>
        <button
          onClick={() => setActiveTab('description')}
          className={`btn d-flex align-items-center gap-2 px-4 py-2 fw-semibold ${
            activeTab === 'description'
              ? 'btn-primary'
              : 'btn-outline-secondary'
          }`}
        >
          <FileText style={{ width: '1.25rem', height: '1.25rem' }} />
          <span>Description Generator</span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'calculator' && (
          <Calculator
            projectData={projectData}
            onProjectDataChange={updateProjectData}
            calculatedValues={calculatedValues}
          />
        )}
        {activeTab === 'description' && <DescriptionGenerator />}
      </div>
    </div>
  );
}
