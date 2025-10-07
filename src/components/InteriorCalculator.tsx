'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import InputField from './InputField';
import DashboardCard from './DashboardCard';
import { InteriorRoomData, InteriorCalculatedValues, InteriorCalculatorInputs } from '@/types';

export default function InteriorCalculator() {
  const [inputs, setInputs] = useState<InteriorCalculatorInputs>({
    rooms: [{
      id: '1',
      name: 'Living Room',
      length: 0,
      width: 0,
      ceilingHeight: 8,
      hasBaseboards: true,
      hasCrownMolding: false,
      hasChairRail: false,
      doors: 1,
      windows: 2
    }],
    paintCoverage: 350, // sq ft per gallon
    paintCostPerGallon: 45,
    hourlyLaborRate: 65,
    numberOfCoats: 2,
    ceilingHeight: 8,
    profitMarginPercentage: 30,
    pricePerSqFt: 3.50, // price per square foot
    paintCeiling: true, // paint ceilings by default
    paintTrim: true, // paint trim by default
    paintBudgetPercentage: 15, // paint budget percentage
    targetMarginPercentage: 30, // target margin percentage
    subcontractPercentage: 0, // subcontract percentage
    subHourlyRate: 0, // subcontract hourly rate
    subNumPainters: 0, // subcontract painters
    subHoursPerDay: 0, // subcontract hours per day
    salesCommissionPercentage: 5, // sales commission
    pmCommissionPercentage: 3 // PM commission
  });

  const [calculatedValues, setCalculatedValues] = useState<InteriorCalculatedValues>({
    totalFloorArea: 0,
    totalWallArea: 0,
    totalCeilingArea: 0,
    totalTrimArea: 0,
    totalDoorArea: 0,
    totalWindowArea: 0,
    netWallArea: 0,
    totalPaintableArea: 0,
    wallPaintGallons: 0,
    ceilingPaintGallons: 0,
    trimPaintGallons: 0,
    totalPaintGallons: 0,
    wallPaintCost: 0,
    ceilingPaintCost: 0,
    trimPaintCost: 0,
    totalPaintCost: 0,
    estimatedHours: 0,
    estimatedDays: 0,
    laborCost: 0,
    totalProjectCost: 0,
    profitMargin: 0
  });

  // Calculate all values when inputs change
  useEffect(() => {
    calculateInteriorPainting();
  }, [inputs]);

  const calculateInteriorPainting = () => {
    let totalFloorArea = 0;
    let totalWallArea = 0;
    let totalCeilingArea = 0;
    let totalTrimArea = 0;
    let totalDoorArea = 0;
    let totalWindowArea = 0;

    inputs.rooms.forEach(room => {
      // Calculate floor area
      const floorArea = room.floorArea || (room.length * room.width);
      totalFloorArea += floorArea;

      // Calculate ceiling area (same as floor area)
      totalCeilingArea += floorArea;

      // Calculate wall area (perimeter × height)
      const perimeter = 2 * (room.length + room.width);
      const wallArea = perimeter * room.ceilingHeight;
      totalWallArea += wallArea;

      // Calculate door and window areas (standard sizes)
      const doorArea = room.doors * 21; // Standard door: 7ft × 3ft = 21 sq ft
      const windowArea = room.windows * 15; // Average window: 5ft × 3ft = 15 sq ft
      totalDoorArea += doorArea;
      totalWindowArea += windowArea;

      // Calculate trim areas
      if (room.hasBaseboards) {
        totalTrimArea += perimeter * 0.5; // 6-inch baseboards
      }
      if (room.hasCrownMolding) {
        totalTrimArea += perimeter * 0.33; // 4-inch crown molding
      }
      if (room.hasChairRail) {
        totalTrimArea += perimeter * 0.25; // 3-inch chair rail
      }
    });

    const netWallArea = totalWallArea - totalDoorArea - totalWindowArea;

    // Calculate paintable area based on selected options
    let totalPaintableArea = netWallArea;
    if (inputs.paintCeiling) {
      totalPaintableArea += totalCeilingArea;
    }
    if (inputs.paintTrim) {
      totalPaintableArea += totalTrimArea;
    }

    // Paint calculations
    const wallPaintGallons = (netWallArea * inputs.numberOfCoats) / inputs.paintCoverage;
    const ceilingPaintGallons = inputs.paintCeiling ? (totalCeilingArea * inputs.numberOfCoats) / inputs.paintCoverage : 0;
    const trimPaintGallons = inputs.paintTrim ? (totalTrimArea * inputs.numberOfCoats) / inputs.paintCoverage : 0;
    const totalPaintGallons = wallPaintGallons + ceilingPaintGallons + trimPaintGallons;

    // Cost calculations
    const wallPaintCost = wallPaintGallons * inputs.paintCostPerGallon;
    const ceilingPaintCost = ceilingPaintGallons * inputs.paintCostPerGallon;
    const trimPaintCost = trimPaintGallons * inputs.paintCostPerGallon;
    const totalPaintCost = wallPaintCost + ceilingPaintCost + trimPaintCost;

    // Labor estimates (rough estimates based on area)
    const estimatedHours = totalPaintableArea / 100; // 100 sq ft per hour average
    const estimatedDays = Math.ceil(estimatedHours / 8); // 8-hour workdays
    const laborCost = estimatedHours * inputs.hourlyLaborRate;

    // Total project cost based on price per square foot
    const totalProjectCost = totalFloorArea * inputs.pricePerSqFt;
    const profitMargin = totalProjectCost * (inputs.profitMarginPercentage / 100);

    setCalculatedValues({
      totalFloorArea,
      totalWallArea,
      totalCeilingArea,
      totalTrimArea,
      totalDoorArea,
      totalWindowArea,
      netWallArea,
      totalPaintableArea,
      wallPaintGallons,
      ceilingPaintGallons,
      trimPaintGallons,
      totalPaintGallons,
      wallPaintCost,
      ceilingPaintCost,
      trimPaintCost,
      totalPaintCost,
      estimatedHours,
      estimatedDays,
      laborCost,
      totalProjectCost,
      profitMargin
    });
  };

  const updateInputs = (updates: Partial<InteriorCalculatorInputs>) => {
    setInputs(prev => ({ ...prev, ...updates }));
  };

  const updateRoom = (roomId: string, updates: Partial<InteriorRoomData>) => {
    setInputs(prev => ({
      ...prev,
      rooms: prev.rooms.map(room =>
        room.id === roomId ? { ...room, ...updates } : room
      )
    }));
  };

  const addRoom = () => {
    const newRoom: InteriorRoomData = {
      id: Date.now().toString(),
      name: `Room ${inputs.rooms.length + 1}`,
      length: 0,
      width: 0,
      ceilingHeight: inputs.ceilingHeight,
      hasBaseboards: true,
      hasCrownMolding: false,
      hasChairRail: false,
      doors: 1,
      windows: 1
    };
    setInputs(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));
  };

  const removeRoom = (roomId: string) => {
    if (inputs.rooms.length > 1) {
      setInputs(prev => ({
        ...prev,
        rooms: prev.rooms.filter(room => room.id !== roomId)
      }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="row g-4">
      {/* Left Column - Room Inputs */}
      <div className="col-lg-6">
        <div className="d-flex flex-column gap-4">
          {/* Global Settings */}
          <DashboardCard title="Interior Painting Calculator Settings">
            <div className="row">
              <div className="col-md-6">
                <InputField
                  label="Paint Coverage (sq ft/gallon)"
                  value={inputs.paintCoverage}
                  onChange={(value) => updateInputs({ paintCoverage: value })}
                  unit="SF/gal"
                />
                <InputField
                  label="Paint Cost per Gallon"
                  value={inputs.paintCostPerGallon}
                  onChange={(value) => updateInputs({ paintCostPerGallon: value })}
                  prefix="$"
                />
                <InputField
                  label="Number of Coats"
                  value={inputs.numberOfCoats}
                  onChange={(value) => updateInputs({ numberOfCoats: value })}
                  min={1}
                />
                <InputField
                  label="Price per Square Foot"
                  value={inputs.pricePerSqFt}
                  onChange={(value) => updateInputs({ pricePerSqFt: value })}
                  prefix="$"
                  step={0.25}
                />
              </div>
              <div className="col-md-6">
                <InputField
                  label="Hourly Labor Rate"
                  value={inputs.hourlyLaborRate}
                  onChange={(value) => updateInputs({ hourlyLaborRate: value })}
                  prefix="$"
                />
                <InputField
                  label="Default Ceiling Height"
                  value={inputs.ceilingHeight}
                  onChange={(value) => updateInputs({ ceilingHeight: value })}
                  unit="ft"
                  min={7}
                  max={12}
                />
                <InputField
                  label="Profit Margin"
                  value={inputs.profitMarginPercentage}
                  onChange={(value) => updateInputs({ profitMarginPercentage: value })}
                  unit="%"
                />
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="paintCeiling"
                      checked={inputs.paintCeiling}
                      onChange={(e) => updateInputs({ paintCeiling: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="paintCeiling">
                      Paint Ceilings
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="paintTrim"
                      checked={inputs.paintTrim}
                      onChange={(e) => updateInputs({ paintTrim: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="paintTrim">
                      Paint Trim/Baseboards
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Room Configuration */}
          <DashboardCard title="Room Configuration">
            <div className="mb-3">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={addRoom}
              >
                <Plus className="w-4 h-4 me-2" />
                Add Room
              </button>
            </div>

            {inputs.rooms.map((room, index) => (
              <div key={room.id} className="card mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Room {index + 1}: {room.name}</h6>
                  {inputs.rooms.length > 1 && (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeRoom(room.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Room Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={room.name}
                          onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Length (ft)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={room.length}
                          onChange={(e) => updateRoom(room.id, { length: Number(e.target.value) })}
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Width (ft)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={room.width}
                          onChange={(e) => updateRoom(room.id, { width: Number(e.target.value) })}
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">OR Floor Area (sq ft)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={room.floorArea || ''}
                          onChange={(e) => updateRoom(room.id, { floorArea: Number(e.target.value) || undefined })}
                          min="0"
                          placeholder="Leave empty to calculate from dimensions"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Ceiling Height (ft)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={room.ceilingHeight}
                          onChange={(e) => updateRoom(room.id, { ceilingHeight: Number(e.target.value) })}
                          min="7"
                          max="12"
                          step="0.5"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Doors</label>
                        <input
                          type="number"
                          className="form-control"
                          value={room.doors}
                          onChange={(e) => updateRoom(room.id, { doors: Number(e.target.value) })}
                          min="0"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Windows</label>
                        <input
                          type="number"
                          className="form-control"
                          value={room.windows}
                          onChange={(e) => updateRoom(room.id, { windows: Number(e.target.value) })}
                          min="0"
                        />
                      </div>
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`baseboards-${room.id}`}
                            checked={room.hasBaseboards}
                            onChange={(e) => updateRoom(room.id, { hasBaseboards: e.target.checked })}
                          />
                          <label className="form-check-label" htmlFor={`baseboards-${room.id}`}>
                            Baseboards
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`crown-${room.id}`}
                            checked={room.hasCrownMolding}
                            onChange={(e) => updateRoom(room.id, { hasCrownMolding: e.target.checked })}
                          />
                          <label className="form-check-label" htmlFor={`crown-${room.id}`}>
                            Crown Molding
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`chair-${room.id}`}
                            checked={room.hasChairRail}
                            onChange={(e) => updateRoom(room.id, { hasChairRail: e.target.checked })}
                          />
                          <label className="form-check-label" htmlFor={`chair-${room.id}`}>
                            Chair Rail
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </DashboardCard>
        </div>
      </div>

      {/* Right Column - Calculations */}
      <div className="col-lg-6">
        <div className="d-flex flex-column gap-4">
          {/* Area Calculations */}
          <DashboardCard title="Area Calculations">
            <div className="row g-3">
              <div className="col-6">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Total Floor Area</div>
                  <div className="fw-bold fs-5">{calculatedValues.totalFloorArea.toFixed(0)} SF</div>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Total Ceiling Area</div>
                  <div className="fw-bold fs-5">{calculatedValues.totalCeilingArea.toFixed(0)} SF</div>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Net Wall Area</div>
                  <div className="fw-bold fs-5">{calculatedValues.netWallArea.toFixed(0)} SF</div>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Trim Area</div>
                  <div className="fw-bold fs-5">{calculatedValues.totalTrimArea.toFixed(0)} SF</div>
                </div>
              </div>
            </div>
            <hr />
            <div className="bg-primary bg-opacity-10 p-3 rounded border text-center">
              <div className="text-muted small">Total Paintable Area</div>
              <div className="fw-bold fs-4 text-primary">{calculatedValues.totalPaintableArea.toFixed(0)} SF</div>
            </div>
          </DashboardCard>

          {/* Paint Requirements */}
          <DashboardCard title="Paint Requirements">
            <InputField
              label="Paint Budget Percentage"
              value={inputs.paintBudgetPercentage}
              onChange={(value) => updateInputs({ paintBudgetPercentage: value })}
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
                      <div className="fw-bold">{calculatedValues.totalPaintableArea.toFixed(0)} SF</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Galões necessários:</small>
                      <div className="fw-bold fs-5 text-primary">{calculatedValues.totalPaintGallons.toFixed(1)} galões</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Custo total estimado:</small>
                      <div className="fw-bold fs-5 text-primary">${calculatedValues.totalPaintCost.toFixed(2)}</div>
                    </div>
                    <div className={`alert py-2 ${calculatedValues.totalPaintCost <= (calculatedValues.totalProjectCost * inputs.paintBudgetPercentage / 100) ? 'alert-success' : 'alert-warning'}`}>
                      <small className="fw-semibold">
                        {calculatedValues.totalPaintCost <= (calculatedValues.totalProjectCost * inputs.paintBudgetPercentage / 100) ? '✅ Orçamento suficiente' : '⚠️ Orçamento limitado'}
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
                      <small className="text-muted">Orçamento disponível ({inputs.paintBudgetPercentage}% do projeto):</small>
                      <div className="fw-bold">${(calculatedValues.totalProjectCost * inputs.paintBudgetPercentage / 100).toLocaleString()}</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Galões que posso comprar:</small>
                      <div className="fw-bold fs-5 text-success">{((calculatedValues.totalProjectCost * inputs.paintBudgetPercentage / 100) / inputs.paintCostPerGallon).toFixed(1)} galões</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Área que posso cobrir:</small>
                      <div className="fw-bold fs-5 text-success">{(((calculatedValues.totalProjectCost * inputs.paintBudgetPercentage / 100) / inputs.paintCostPerGallon) * inputs.paintCoverage / inputs.numberOfCoats).toLocaleString()} SF</div>
                    </div>
                    <div className={`alert py-2 ${((calculatedValues.totalProjectCost * inputs.paintBudgetPercentage / 100) / inputs.paintCostPerGallon) >= calculatedValues.totalPaintGallons ? 'alert-success' : 'alert-danger'}`}>
                      <small className="fw-semibold">
                        {((calculatedValues.totalProjectCost * inputs.paintBudgetPercentage / 100) / inputs.paintCostPerGallon) >= calculatedValues.totalPaintGallons ? '✅ Orçamento excedente' : '❌ Orçamento insuficiente'}
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
                    <span className={`fw-bold ${((calculatedValues.totalProjectCost * inputs.paintBudgetPercentage / 100) / inputs.paintCostPerGallon) - calculatedValues.totalPaintGallons >= 0 ? 'text-success' : 'text-danger'}`}>
                      {(((calculatedValues.totalProjectCost * inputs.paintBudgetPercentage / 100) / inputs.paintCostPerGallon) - calculatedValues.totalPaintGallons).toFixed(1)} galões
                    </span>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block">Diferença de Custo</small>
                    <span className={`fw-bold ${(calculatedValues.totalProjectCost * inputs.paintBudgetPercentage / 100) - calculatedValues.totalPaintCost >= 0 ? 'text-success' : 'text-danger'}`}>
                      ${((calculatedValues.totalProjectCost * inputs.paintBudgetPercentage / 100) - calculatedValues.totalPaintCost).toFixed(2)}
                    </span>
                  </div>
                  <div className="col-4">
                    <small className="text-muted d-block">Percentual de Cobertura</small>
                    <span className={`fw-bold ${(((calculatedValues.totalProjectCost * inputs.paintBudgetPercentage / 100) / inputs.paintCostPerGallon) / calculatedValues.totalPaintGallons * 100) >= 100 ? 'text-success' : 'text-danger'}`}>
                      {(((calculatedValues.totalProjectCost * inputs.paintBudgetPercentage / 100) / inputs.paintCostPerGallon) / calculatedValues.totalPaintGallons * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3 mt-3">
              <div className="col-4">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Wall Paint</div>
                  <div className="fw-bold fs-5">{calculatedValues.wallPaintGallons.toFixed(1)} gal</div>
                  <div className="text-muted small">{formatCurrency(calculatedValues.wallPaintCost)}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Ceiling Paint</div>
                  <div className="fw-bold fs-5">{calculatedValues.ceilingPaintGallons.toFixed(1)} gal</div>
                  <div className="text-muted small">{formatCurrency(calculatedValues.ceilingPaintCost)}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Trim Paint</div>
                  <div className="fw-bold fs-5">{calculatedValues.trimPaintGallons.toFixed(1)} gal</div>
                  <div className="text-muted small">{formatCurrency(calculatedValues.trimPaintCost)}</div>
                </div>
              </div>
            </div>
            <hr />
            <div className="bg-success bg-opacity-10 p-3 rounded border text-center">
              <div className="text-muted small">Total Paint Required</div>
              <div className="fw-bold fs-4 text-success">{calculatedValues.totalPaintGallons.toFixed(1)} gallons</div>
              <div className="text-muted">{formatCurrency(calculatedValues.totalPaintCost)}</div>
            </div>
          </DashboardCard>

          {/* Margin Analysis */}
          <DashboardCard title="Margin Analysis">
            <InputField
              label="Target Margin Percentage"
              value={inputs.targetMarginPercentage}
              onChange={(value) => updateInputs({ targetMarginPercentage: value })}
              unit="%"
              step={0.5}
            />

            {/* Breakdown de Custos */}
            <div className="bg-light p-3 rounded border mb-3">
              <h6 className="fw-bold mb-3">Cost Breakdown</h6>
              <div className="small">
                <div className="d-flex justify-content-between mb-1">
                  <span>Project Value:</span>
                  <span className="fw-semibold">{formatCurrency(calculatedValues.totalProjectCost)}</span>
                </div>
                <div className="d-flex justify-content-between mb-1 text-danger">
                  <span>- Paint Cost:</span>
                  <span>{formatCurrency(calculatedValues.totalPaintCost)}</span>
                </div>
                <div className="d-flex justify-content-between mb-1 text-danger">
                  <span>- Labor Cost:</span>
                  <span>{formatCurrency(calculatedValues.laborCost)}</span>
                </div>
                <div className="d-flex justify-content-between mb-1 text-danger">
                  <span>- Commissions:</span>
                  <span>{formatCurrency((calculatedValues.totalProjectCost * inputs.salesCommissionPercentage / 100) + (calculatedValues.totalProjectCost * inputs.pmCommissionPercentage / 100))}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between fw-bold">
                  <span>= Net Profit:</span>
                  <span className={calculatedValues.profitMargin >= 0 ? 'text-success' : 'text-danger'}>
                    {formatCurrency(calculatedValues.profitMargin)}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Margin %:</span>
                  <span className={`fw-bold ${inputs.profitMarginPercentage >= 0 ? 'text-success' : 'text-danger'}`}>
                    {inputs.profitMarginPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Comparação com Target */}
            <div className="mb-3">
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Target vs Actual Margin</span>
                <span className="fw-semibold">
                  {inputs.targetMarginPercentage}% / {inputs.profitMarginPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="progress mb-2" style={{ height: '8px' }}>
                <div
                  className={`progress-bar ${inputs.profitMarginPercentage >= inputs.targetMarginPercentage ? 'bg-success' : 'bg-danger'}`}
                  style={{ width: `${Math.min((inputs.profitMarginPercentage / inputs.targetMarginPercentage) * 100, 100)}%` }}
                />
              </div>
              <div className="d-flex justify-content-center align-items-center gap-2">
                {inputs.profitMarginPercentage >= inputs.targetMarginPercentage ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`fw-semibold ${inputs.profitMarginPercentage >= inputs.targetMarginPercentage ? 'text-success' : 'text-danger'}`}>
                  {inputs.profitMarginPercentage >= inputs.targetMarginPercentage ? 'Profit Target Met' : 'Below Target'}
                </span>
              </div>
            </div>

            {/* Alerta se margem estiver negativa */}
            {inputs.profitMarginPercentage < 0 && (
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
              value={inputs.subcontractPercentage}
              onChange={(value) => updateInputs({ subcontractPercentage: value })}
              unit="%"
              step={5}
            />
            <InputField
              label="Sub Hourly Rate"
              value={inputs.subHourlyRate}
              onChange={(value) => updateInputs({ subHourlyRate: value })}
              prefix="$"
            />
            <InputField
              label="Sub Painters"
              value={inputs.subNumPainters}
              onChange={(value) => updateInputs({ subNumPainters: value })}
              min={1}
            />
            <InputField
              label="Sub Hours per Day"
              value={inputs.subHoursPerDay}
              onChange={(value) => updateInputs({ subHoursPerDay: value })}
              min={1}
              max={12}
            />
            <div className="row g-3">
              <div className="col-6">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Subcontract Value</div>
                  <div className="fw-bold fs-5">
                    {formatCurrency(calculatedValues.totalProjectCost * inputs.subcontractPercentage / 100)}
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Sub Days</div>
                  <div className="fw-bold fs-5">
                    {Math.ceil((calculatedValues.totalPaintableArea / 100) * (inputs.subcontractPercentage / 100) / inputs.subHoursPerDay).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Commissions & Administrative Expenses */}
          <DashboardCard title="Comissões e Despesas Administrativas">
            <InputField
              label="Comissão Vendas"
              value={inputs.salesCommissionPercentage}
              onChange={(value) => updateInputs({ salesCommissionPercentage: value })}
              unit="%"
              step={0.5}
            />
            <InputField
              label="Comissão Project Manager"
              value={inputs.pmCommissionPercentage}
              onChange={(value) => updateInputs({ pmCommissionPercentage: value })}
              unit="%"
              step={0.5}
            />
            <div className="bg-light p-3 rounded border mb-3">
              <div className="row g-3">
                <div className="col-6">
                  <div className="text-center">
                    <div className="text-muted small">Valor Comissão Vendas</div>
                    <div className="fw-bold fs-5 text-primary">
                      {formatCurrency(calculatedValues.totalProjectCost * inputs.salesCommissionPercentage / 100)}
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <div className="text-muted small">Valor Comissão PM</div>
                    <div className="fw-bold fs-5 text-primary">
                      {formatCurrency(calculatedValues.totalProjectCost * inputs.pmCommissionPercentage / 100)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-warning p-3 rounded border mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Total Comissões</span>
                <span className="fw-bold fs-5 text-danger">
                  {formatCurrency((calculatedValues.totalProjectCost * inputs.salesCommissionPercentage / 100) + (calculatedValues.totalProjectCost * inputs.pmCommissionPercentage / 100))}
                </span>
              </div>
              <div className="text-muted small mt-1">
                {((inputs.salesCommissionPercentage + inputs.pmCommissionPercentage)).toFixed(1)}% do valor total do projeto
              </div>
            </div>

            {/* Margem Líquida do Trabalho */}
            <div className={`p-3 rounded border ${calculatedValues.profitMargin >= 0 ? 'bg-success bg-opacity-10 border-success' : 'bg-danger bg-opacity-10 border-danger'}`}>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Margem Líquida do Trabalho</span>
                <span className={`fw-bold fs-5 ${calculatedValues.profitMargin >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(calculatedValues.profitMargin)}
                </span>
              </div>
              <div className={`text-muted small mt-1 ${calculatedValues.profitMargin >= 0 ? 'text-success' : 'text-danger'}`}>
                {calculatedValues.profitMargin >= 0 ? '✅ Lucro' : '❌ Prejuízo'} • {Math.abs(inputs.profitMarginPercentage).toFixed(1)}% do projeto
              </div>
              <div className="text-muted small mt-1">
                Receita após todos os custos (tinta + mão de obra + comissões)
              </div>
            </div>
          </DashboardCard>

          {/* Labor & Cost Summary */}
          <DashboardCard title="Labor & Cost Summary">
            <div className="row g-3">
              <div className="col-6">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Estimated Hours</div>
                  <div className="fw-bold fs-5">{calculatedValues.estimatedHours.toFixed(1)} hrs</div>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-light p-3 rounded border text-center">
                  <div className="text-muted small">Estimated Days</div>
                  <div className="fw-bold fs-5">{calculatedValues.estimatedDays} days</div>
                </div>
              </div>
            </div>
            <hr />
            <div className="row g-3">
              <div className="col-6">
                <div className="bg-warning bg-opacity-10 p-3 rounded border text-center">
                  <div className="text-muted small">Paint Cost</div>
                  <div className="fw-bold fs-5">{formatCurrency(calculatedValues.totalPaintCost)}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-warning bg-opacity-10 p-3 rounded border text-center">
                  <div className="text-muted small">Labor Cost</div>
                  <div className="fw-bold fs-5">{formatCurrency(calculatedValues.laborCost)}</div>
                </div>
              </div>
            </div>
            <hr />
            <div className="bg-primary bg-opacity-10 p-3 rounded border text-center">
              <div className="text-muted small">Total Project Cost</div>
              <div className="fw-bold fs-3 text-primary">{formatCurrency(calculatedValues.totalProjectCost)}</div>
              <div className="text-muted small">Profit Margin: {formatCurrency(calculatedValues.profitMargin)}</div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
