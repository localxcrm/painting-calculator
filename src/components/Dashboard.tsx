'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calculator as CalculatorIcon, FileText, Copy, CheckCircle, Settings as SettingsIcon } from 'lucide-react';
import MetricCard from './MetricCard';
import Calculator from './Calculator';
import DescriptionGenerator from './DescriptionGenerator';
import { ProjectData, CalculatedValues, MetricCardData } from '@/types';
import Link from 'next/link';

type Props = {
  initialData: ProjectData;
};

export default function Dashboard({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState<'calculator' | 'description'>('calculator');
  const [projectData, setProjectData] = useState<ProjectData>(initialData);
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
    const totalServiceHours = projectData.hourlyRateWithMaterials > 0 ? (totalCostBySq / projectData.hourlyRateWithMaterials) : 0;
    const workDaysToComplete =
      projectData.numPainters > 0 && projectData.hoursPerDay > 0
        ? (totalServiceHours / (projectData.numPainters * projectData.hoursPerDay))
        : 0;
    const gallonsNeeded =
      projectData.paintCoverage > 0
        ? ((projectData.squareFootage / projectData.paintCoverage) * Math.max(projectData.numberOfCoats, 0))
        : 0;
    const totalPaintCost = gallonsNeeded * projectData.paintCostPerGallon;
    const subcontractValue = totalCostBySq * (projectData.subcontractPercentage / 100);
    const denom = projectData.subHourlyRate * projectData.subNumPainters * projectData.subHoursPerDay;
    const subcontractDays = denom > 0 ? (subcontractValue / denom) : 0;

    const salesCommission = totalCostBySq * (projectData.salesCommissionPercentage / 100);
    const pmCommission = totalCostBySq * (projectData.pmCommissionPercentage / 100);
    const totalCommissions = salesCommission + pmCommission;

    const totalCosts = totalPaintCost + subcontractValue + totalCommissions;

    const grossProfit = totalCostBySq - totalCosts;
    const actualMarginPercentage = totalCostBySq > 0 ? ((grossProfit / totalCostBySq) * 100) : 0;
    const actualMaterialPercentage = totalCostBySq > 0 ? ((totalPaintCost / totalCostBySq) * 100) : 0;

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

PROJECT OVERVIEW
----------------
Project Type: Professional Painting Service
Total Square Footage: ${projectData.squareFootage.toLocaleString()} SF
Price per Square Foot: $${projectData.pricePerSq.toFixed(2)}
Total Project Value: $${calculatedValues.totalCostBySq.toLocaleString()}

PROJECT SCOPE & SPECIFICATIONS
------------------------------
Number of Coats: ${projectData.numberOfCoats}
Paint Coverage: ${projectData.paintCoverage} SF/gallon
Paint Cost per Gallon: $${projectData.paintCostPerGallon}
Estimated Gallons Required: ${calculatedValues.gallonsNeeded.toFixed(1)} gallons
Total Material Cost: $${calculatedValues.totalPaintCost.toFixed(2)}

LABOR REQUIREMENTS
------------------
Primary Team:
- Hourly Rate (with materials): $${projectData.hourlyRateWithMaterials}
- Number of Painters: ${projectData.numPainters}
- Hours per Day: ${projectData.hoursPerDay}
- Total Hours Required: ${calculatedValues.totalServiceHours.toFixed(1)} hours
- Estimated Completion Time: ${calculatedValues.workDaysToComplete.toFixed(1)} days

Subcontract Work:
- Subcontract Percentage: ${projectData.subcontractPercentage}%
- Sub Hourly Rate: $${projectData.subHourlyRate}
- Sub Painters: ${projectData.subNumPainters}
- Sub Hours per Day: ${projectData.subHoursPerDay}
- Subcontract Value: $${calculatedValues.subcontractValue.toLocaleString()}
- Subcontract Days: ${calculatedValues.subcontractDays.toFixed(1)} days

FINANCIAL BREAKDOWN
-------------------
Revenue:
- Total Project Value: $${calculatedValues.totalCostBySq.toLocaleString()}

Direct Costs:
- Paint & Materials: $${calculatedValues.totalPaintCost.toLocaleString()} (${calculatedValues.actualMaterialPercentage.toFixed(1)}% of project)
- Subcontract Services: $${calculatedValues.subcontractValue.toLocaleString()}
- Sales Commission: ${(calculatedValues.totalCostBySq * projectData.salesCommissionPercentage / 100).toLocaleString()} (${projectData.salesCommissionPercentage}%)
- Project Manager Commission: ${(calculatedValues.totalCostBySq * projectData.pmCommissionPercentage / 100).toLocaleString()} (${projectData.pmCommissionPercentage}%)

Total Direct Costs: $${(calculatedValues.totalPaintCost + calculatedValues.subcontractValue + (calculatedValues.totalCostBySq * projectData.salesCommissionPercentage / 100) + (calculatedValues.totalCostBySq * projectData.pmCommissionPercentage / 100)).toLocaleString()}

Profitability Analysis:
- Gross Profit: $${calculatedValues.grossProfit.toLocaleString()}
- Actual Margin: ${calculatedValues.actualMarginPercentage.toFixed(1)}%
- Target Margin: ${projectData.targetMarginPercentage}%
- Margin Status: ${calculatedValues.actualMarginPercentage >= projectData.targetMarginPercentage ? '✅ TARGET MET' : '⚠️ BELOW TARGET'}

MATERIAL BUDGET ANALYSIS
------------------------
Paint Budget Allocation: ${projectData.paintBudgetPercentage}%
Budgeted Amount: $${(calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100).toLocaleString()}
Required Paint Cost: $${calculatedValues.totalPaintCost.toLocaleString()}
Budget Status: ${calculatedValues.totalPaintCost <= (calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100) ? '✅ WITHIN BUDGET' : '❌ OVER BUDGET'}

COMMISSIONS & ADMINISTRATIVE EXPENSES
-------------------------------------
Sales Commission: ${projectData.salesCommissionPercentage}% ($${(calculatedValues.totalCostBySq * projectData.salesCommissionPercentage / 100).toLocaleString()})
Project Manager Commission: ${projectData.pmCommissionPercentage}% ($${(calculatedValues.totalCostBySq * projectData.pmCommissionPercentage / 100).toLocaleString()})
Total Commissions: ${(projectData.salesCommissionPercentage + projectData.pmCommissionPercentage).toFixed(1)}% ($${((calculatedValues.totalCostBySq * projectData.salesCommissionPercentage / 100) + (calculatedValues.totalCostBySq * projectData.pmCommissionPercentage / 100)).toLocaleString()})

PROJECT TIMELINE
----------------
Primary Work Duration: ${calculatedValues.workDaysToComplete.toFixed(1)} days
Subcontract Work Duration: ${calculatedValues.subcontractDays.toFixed(1)} days
Estimated Project Completion: ${Math.max(calculatedValues.workDaysToComplete, calculatedValues.subcontractDays).toFixed(1)} days

QUALITY ASSURANCE
-----------------
This project will be completed following industry best practices with:
- Proper surface preparation
- High-quality paint application
- ${projectData.numberOfCoats} coat${projectData.numberOfCoats > 1 ? 's' : ''} for optimal coverage
- Professional cleanup and protection
- Final inspection and client approval

TERMS & CONDITIONS
------------------
- 50% deposit required to begin work
- 50% final payment upon completion
- Work guarantee: 2 years on labor, manufacturer warranty on materials
- Project start date: [To be determined]
- Project completion date: [To be determined]
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
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="display-5 fw-bold text-dark mb-0">Painting Calculator</h1>
        <div className="d-flex gap-2">
          <Link href="/admin" className="btn btn-warning d-flex align-items-center gap-2">
            <FileText style={{ width: '1.25rem', height: '1.25rem' }} />
            <span>Projects</span>
          </Link>
          <Link href="/settings" className="btn btn-outline-secondary d-flex align-items-center gap-2">
            <SettingsIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row g-2 mb-4">
        {metrics.map((metric, index) => (
          <div key={index} className="col-6 col-md-4 col-lg-3 col-xl-2">
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
      <div className="mb-5">
        {activeTab === 'calculator' && (
          <Calculator
            projectData={projectData}
            onProjectDataChange={updateProjectData}
            calculatedValues={calculatedValues}
          />
        )}
        {activeTab === 'description' && <DescriptionGenerator />}
      </div>

      {/* Bottom Button */}
      <div className="text-center">
        <button
          onClick={copyWorkOrder}
          className="btn btn-primary btn-lg d-flex align-items-center gap-2 mx-auto"
        >
          {workOrderCopied ? (
            <>
              <CheckCircle style={{ width: '1.5rem', height: '1.5rem' }} />
              <span>Work Order Copied!</span>
            </>
          ) : (
            <>
              <Copy style={{ width: '1.5rem', height: '1.5rem' }} />
              <span>Generate Work Order</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
