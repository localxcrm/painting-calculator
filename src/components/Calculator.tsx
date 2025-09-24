'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import InputField from './InputField';
import DashboardCard from './DashboardCard';
import { ProjectData, CalculatedValues } from '@/types';

interface CalculatorProps {
  projectData: ProjectData;
  onProjectDataChange: (updates: Partial<ProjectData>) => void;
  calculatedValues: CalculatedValues;
}

export default function Calculator({ projectData, onProjectDataChange, calculatedValues }: CalculatorProps) {
  const updateProjectData = (key: keyof ProjectData, value: number) => {
    onProjectDataChange({ [key]: value });
  };

  const getProgressColor = (actual: number, target: number) => {
    return actual <= target ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusIcon = (actual: number, target: number) => {
    return actual <= target ? (
      <CheckCircle className="w-5 h-5 text-green-400" />
    ) : (
      <XCircle className="w-5 h-5 text-red-400" />
    );
  };

  return (
    <div className="row g-4">
      {/* Left Column */}
      <div className="col-lg-6">
        <div className="d-flex flex-column gap-4">
          {/* Project Pricing */}
          <DashboardCard title="Project Pricing">
            <InputField
              label="Price per Square Foot"
              value={projectData.pricePerSq}
              onChange={(value) => updateProjectData('pricePerSq', value)}
              prefix="$"
              step={0.25}
            />
            <InputField
              label="Total Square Footage"
              value={projectData.squareFootage}
              onChange={(value) => updateProjectData('squareFootage', value)}
              unit="SF"
              step={100}
            />
            <div className="bg-light p-3 rounded border">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Total Project Value</span>
                <span className="h5 mb-0 fw-bold">
                  ${calculatedValues.totalCostBySq.toLocaleString()}
                </span>
              </div>
            </div>
          </DashboardCard>

          {/* Work Schedule */}
          <DashboardCard title="Work Schedule">
            <InputField
              label="Hourly Rate with Materials"
              value={projectData.hourlyRateWithMaterials}
              onChange={(value) => updateProjectData('hourlyRateWithMaterials', value)}
              prefix="$"
            />
            <InputField
              label="Number of Painters"
              value={projectData.numPainters}
              onChange={(value) => updateProjectData('numPainters', value)}
              min={1}
            />
            <InputField
              label="Hours per Day"
              value={projectData.hoursPerDay}
              onChange={(value) => updateProjectData('hoursPerDay', value)}
              min={1}
              max={12}
            />
            <div className="row g-3">
              <div className="col-6">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Total Hours</div>
                  <div className="fw-bold fs-5">
                    {calculatedValues.totalServiceHours.toFixed(1)}
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Completion Days</div>
                  <div className="fw-bold fs-5">
                    {calculatedValues.workDaysToComplete.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Paint Requirements */}
          <DashboardCard title="Paint Requirements">
            <InputField
              label="Paint Coverage per Gallon"
              value={projectData.paintCoverage}
              onChange={(value) => updateProjectData('paintCoverage', value)}
              unit="SF/gal"
              min={100}
            />
            <InputField
              label="Number of Coats"
              value={projectData.numberOfCoats}
              onChange={(value) => updateProjectData('numberOfCoats', value)}
              min={1}
            />
            <InputField
              label="Paint Cost per Gallon"
              value={projectData.paintCostPerGallon}
              onChange={(value) => updateProjectData('paintCostPerGallon', value)}
              prefix="$"
            />
            <div className="row g-3">
              <div className="col-6">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Gallons Needed</div>
                  <div className="fw-bold fs-5">
                    {calculatedValues.gallonsNeeded.toFixed(1)}
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Paint Cost</div>
                  <div className="fw-bold fs-5">
                    ${calculatedValues.totalPaintCost.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Right Column */}
      <div className="col-lg-6">
        <div className="d-flex flex-column gap-4">
          {/* Material Analysis */}
          <DashboardCard title="Material Analysis">
            <InputField
              label="Target Material Percentage"
              value={projectData.targetMaterialPercentage}
              onChange={(value) => updateProjectData('targetMaterialPercentage', value)}
              unit="%"
              step={0.5}
            />
            <div className="mb-3">
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Actual vs Target</span>
                <span className="fw-semibold">
                  {calculatedValues.actualMaterialPercentage.toFixed(1)}% / {projectData.targetMaterialPercentage}%
                </span>
              </div>
              <div className="progress mb-2" style={{ height: '8px' }}>
                <div
                  className={`progress-bar ${getProgressColor(calculatedValues.actualMaterialPercentage, projectData.targetMaterialPercentage) === 'bg-green-500' ? 'bg-success' : 'bg-danger'}`}
                  style={{ width: `${Math.min((calculatedValues.actualMaterialPercentage / projectData.targetMaterialPercentage) * 100, 100)}%` }}
                />
              </div>
              <div className="d-flex justify-content-center align-items-center gap-2">
                {getStatusIcon(calculatedValues.actualMaterialPercentage, projectData.targetMaterialPercentage)}
                <span className={`fw-semibold ${calculatedValues.actualMaterialPercentage <= projectData.targetMaterialPercentage ? 'text-success' : 'text-danger'}`}>
                  {calculatedValues.actualMaterialPercentage <= projectData.targetMaterialPercentage ? 'On Target' : 'Over Budget'}
                </span>
              </div>
            </div>
          </DashboardCard>

          {/* Margin Analysis */}
          <DashboardCard title="Margin Analysis">
            <InputField
              label="Target Margin Percentage"
              value={projectData.targetMarginPercentage}
              onChange={(value) => updateProjectData('targetMarginPercentage', value)}
              unit="%"
              step={0.5}
            />
            <div className="bg-light p-3 rounded border mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">Gross Profit</span>
                <span className="h5 mb-0 fw-bold">
                  ${calculatedValues.grossProfit.toLocaleString()}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Actual Margin</span>
                <span className="fw-bold">
                  {calculatedValues.actualMarginPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Target vs Actual</span>
                <span className="fw-semibold">
                  {projectData.targetMarginPercentage}% / {calculatedValues.actualMarginPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="progress mb-2" style={{ height: '8px' }}>
                <div
                  className={`progress-bar ${getProgressColor(projectData.targetMarginPercentage, calculatedValues.actualMarginPercentage) === 'bg-green-500' ? 'bg-success' : 'bg-danger'}`}
                  style={{ width: `${Math.min((calculatedValues.actualMarginPercentage / projectData.targetMarginPercentage) * 100, 100)}%` }}
                />
              </div>
              <div className="d-flex justify-content-center align-items-center gap-2">
                {getStatusIcon(projectData.targetMarginPercentage, calculatedValues.actualMarginPercentage)}
                <span className={`fw-semibold ${calculatedValues.actualMarginPercentage >= projectData.targetMarginPercentage ? 'text-success' : 'text-danger'}`}>
                  {calculatedValues.actualMarginPercentage >= projectData.targetMarginPercentage ? 'Profit Target Met' : 'Below Target'}
                </span>
              </div>
            </div>
          </DashboardCard>

          {/* Subcontract Analysis */}
          <DashboardCard title="Subcontract Analysis">
            <InputField
              label="Subcontract Percentage"
              value={projectData.subcontractPercentage}
              onChange={(value) => updateProjectData('subcontractPercentage', value)}
              unit="%"
              step={5}
            />
            <InputField
              label="Sub Hourly Rate"
              value={projectData.subHourlyRate}
              onChange={(value) => updateProjectData('subHourlyRate', value)}
              prefix="$"
            />
            <InputField
              label="Sub Painters"
              value={projectData.subNumPainters}
              onChange={(value) => updateProjectData('subNumPainters', value)}
              min={1}
            />
            <InputField
              label="Sub Hours per Day"
              value={projectData.subHoursPerDay}
              onChange={(value) => updateProjectData('subHoursPerDay', value)}
              min={1}
              max={12}
            />
            <div className="row g-3">
              <div className="col-6">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Subcontract Value</div>
                  <div className="fw-bold fs-5">
                    ${calculatedValues.subcontractValue.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Sub Days</div>
                  <div className="fw-bold fs-5">
                    {calculatedValues.subcontractDays.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
