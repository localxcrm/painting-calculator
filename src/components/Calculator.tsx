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
            <InputField
              label="Paint Budget Percentage"
              value={projectData.paintBudgetPercentage}
              onChange={(value) => updateProjectData('paintBudgetPercentage', value)}
              unit="%"
              step={0.5}
              min={0}
              max={50}
            />

            {/* Dois cálculos paralelos */}
            <div className="row g-3 mt-3">
              {/* O que preciso para pintar */}
              <div className="col-md-6">
                <div className="card border-primary">
                  <div className="card-header bg-primary text-white">
                    <h6 className="mb-0">🎨 O QUE PRECISO PARA PINTAR</h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <small className="text-muted">Área total a cobrir:</small>
                      <div className="fw-bold">{projectData.squareFootage.toLocaleString()} SF</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Galões necessários:</small>
                      <div className="fw-bold fs-5 text-primary">{calculatedValues.gallonsNeeded.toFixed(1)} galões</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Custo total estimado:</small>
                      <div className="fw-bold fs-5 text-primary">${calculatedValues.totalPaintCost.toFixed(2)}</div>
                    </div>
                    <div className={`alert py-2 ${calculatedValues.totalPaintCost <= (calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100) ? 'alert-success' : 'alert-warning'}`}>
                      <small className="fw-semibold">
                        {calculatedValues.totalPaintCost <= (calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100) ? '✅ Orçamento suficiente' : '⚠️ Orçamento limitado'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* O que tenho orçamento para */}
              <div className="col-md-6">
                <div className="card border-success">
                  <div className="card-header bg-success text-white">
                    <h6 className="mb-0">💰 O QUE TENHO ORÇAMENTO PARA</h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <small className="text-muted">Orçamento disponível ({projectData.paintBudgetPercentage}% do projeto):</small>
                      <div className="fw-bold">${(calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100).toLocaleString()}</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Galões que posso comprar:</small>
                      <div className="fw-bold fs-5 text-success">{((calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100) / projectData.paintCostPerGallon).toFixed(1)} galões</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Área que posso cobrir:</small>
                      <div className="fw-bold fs-5 text-success">{(((calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100) / projectData.paintCostPerGallon) * projectData.paintCoverage / projectData.numberOfCoats).toLocaleString()} SF</div>
                    </div>
                    <div className={`alert py-2 ${((calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100) / projectData.paintCostPerGallon) >= calculatedValues.gallonsNeeded ? 'alert-success' : 'alert-danger'}`}>
                      <small className="fw-semibold">
                        {((calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100) / projectData.paintCostPerGallon) >= calculatedValues.gallonsNeeded ? '✅ Orçamento excedente' : '❌ Orçamento insuficiente'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparação e recomendações */}
            <div className="mt-3">
              <div className="bg-light p-3 rounded border">
                <h6 className="fw-bold mb-2">📊 Comparação</h6>
                <div className="row g-2 text-center">
                  <div className="col-4">
                    <small className="text-muted d-block">Diferença de Galões</small>
                    <span className={`fw-bold ${((calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100) / projectData.paintCostPerGallon) - calculatedValues.gallonsNeeded >= 0 ? 'text-success' : 'text-danger'}`}>
                      {(((calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100) / projectData.paintCostPerGallon) - calculatedValues.gallonsNeeded).toFixed(1)} galões
                    </span>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block">Diferença de Custo</small>
                    <span className={`fw-bold ${(calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100) - calculatedValues.totalPaintCost >= 0 ? 'text-success' : 'text-danger'}`}>
                      ${((calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100) - calculatedValues.totalPaintCost).toFixed(2)}
                    </span>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block">Percentual de Cobertura</small>
                    <span className={`fw-bold ${(((calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100) / projectData.paintCostPerGallon) / calculatedValues.gallonsNeeded * 100) >= 100 ? 'text-success' : 'text-danger'}`}>
                      {(((calculatedValues.totalCostBySq * projectData.paintBudgetPercentage / 100) / projectData.paintCostPerGallon) / calculatedValues.gallonsNeeded * 100).toFixed(1)}%
                    </span>
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


          {/* Margin Analysis */}
          <DashboardCard title="Margin Analysis">
            <InputField
              label="Target Margin Percentage"
              value={projectData.targetMarginPercentage}
              onChange={(value) => updateProjectData('targetMarginPercentage', value)}
              unit="%"
              step={0.5}
            />

            {/* Breakdown de Custos */}
            <div className="bg-light p-3 rounded border mb-3">
              <h6 className="fw-bold mb-3">Cost Breakdown</h6>
              <div className="small">
                <div className="d-flex justify-content-between mb-1">
                  <span>Project Value:</span>
                  <span className="fw-semibold">${calculatedValues.totalCostBySq.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-1 text-danger">
                  <span>- Paint Cost:</span>
                  <span>${calculatedValues.totalPaintCost.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-1 text-danger">
                  <span>- Subcontract:</span>
                  <span>${calculatedValues.subcontractValue.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-1 text-danger">
                  <span>- Commissions:</span>
                  <span>${((calculatedValues.totalCostBySq * projectData.salesCommissionPercentage / 100) + (calculatedValues.totalCostBySq * projectData.pmCommissionPercentage / 100)).toLocaleString()}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between fw-bold">
                  <span>= Net Profit:</span>
                  <span className={calculatedValues.grossProfit >= 0 ? 'text-success' : 'text-danger'}>
                    ${calculatedValues.grossProfit.toLocaleString()}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Margin %:</span>
                  <span className={`fw-bold ${calculatedValues.actualMarginPercentage >= 0 ? 'text-success' : 'text-danger'}`}>
                    {calculatedValues.actualMarginPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Comparação com Target */}
            <div className="mb-3">
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Target vs Actual Margin</span>
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

            {/* Alerta se margem estiver negativa */}
            {calculatedValues.actualMarginPercentage < 0 && (
              <div className="alert alert-danger py-2">
                <small className="fw-semibold">
                  ⚠️ Margem negativa! Ajuste o preço ou reduza custos.
                </small>
              </div>
            )}
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

          {/* Commissions & Administrative Expenses */}
          <DashboardCard title="Comissões e Despesas Administrativas">
            <InputField
              label="Comissão Vendas"
              value={projectData.salesCommissionPercentage}
              onChange={(value) => updateProjectData('salesCommissionPercentage', value)}
              unit="%"
              step={0.5}
            />
            <InputField
              label="Comissão Project Manager"
              value={projectData.pmCommissionPercentage}
              onChange={(value) => updateProjectData('pmCommissionPercentage', value)}
              unit="%"
              step={0.5}
            />
            <div className="bg-light p-3 rounded border mb-3">
              <div className="row g-3">
                <div className="col-6">
                  <div className="text-center">
                    <div className="text-muted small">Valor Comissão Vendas</div>
                    <div className="fw-bold fs-5 text-primary">
                      ${(calculatedValues.totalCostBySq * projectData.salesCommissionPercentage / 100).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <div className="text-muted small">Valor Comissão PM</div>
                    <div className="fw-bold fs-5 text-primary">
                      ${(calculatedValues.totalCostBySq * projectData.pmCommissionPercentage / 100).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-warning p-3 rounded border mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Total Comissões</span>
                <span className="fw-bold fs-5 text-danger">
                  ${((calculatedValues.totalCostBySq * projectData.salesCommissionPercentage / 100) + (calculatedValues.totalCostBySq * projectData.pmCommissionPercentage / 100)).toLocaleString()}
                </span>
              </div>
              <div className="text-muted small mt-1">
                {((projectData.salesCommissionPercentage + projectData.pmCommissionPercentage)).toFixed(1)}% do valor total do projeto
              </div>
            </div>

            {/* Margem Líquida do Trabalho */}
            <div className={`p-3 rounded border ${calculatedValues.grossProfit >= 0 ? 'bg-success bg-opacity-10 border-success' : 'bg-danger bg-opacity-10 border-danger'}`}>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Margem Líquida do Trabalho</span>
                <span className={`fw-bold fs-5 ${calculatedValues.grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                  ${calculatedValues.grossProfit.toLocaleString()}
                </span>
              </div>
              <div className={`text-muted small mt-1 ${calculatedValues.grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {calculatedValues.actualMarginPercentage >= 0 ? '✅ Lucro' : '❌ Prejuízo'} • {Math.abs(calculatedValues.actualMarginPercentage).toFixed(1)}% do projeto
              </div>
              <div className="text-muted small mt-1">
                Receita após todos os custos (tinta + subcontrato + comissões)
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
