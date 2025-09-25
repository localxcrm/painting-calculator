'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { ProjectData } from '@/types';

type NumericKeys =
  | 'pricePerSq'
  | 'hourlyRateWithMaterials'
  | 'numPainters'
  | 'hoursPerDay'
  | 'paintCoverage'
  | 'numberOfCoats'
  | 'paintCostPerGallon'
  | 'paintBudgetPercentage'
  | 'salesCommissionPercentage'
  | 'pmCommissionPercentage'
  | 'subcontractPercentage'
  | 'subHourlyRate'
  | 'subNumPainters'
  | 'subHoursPerDay'
  | 'targetMaterialPercentage'
  | 'targetMarginPercentage';

type Settings = Partial<Record<NumericKeys, number>>;

interface SettingsFormProps {
  initialUserSettings: Settings | null;
  companyDefaults: Settings | null;
}

function toInputValue(value: number | undefined): string {
  return value === undefined ? '' : String(value);
}

export default function SettingsForm({
  initialUserSettings,
  companyDefaults,
}: SettingsFormProps) {
  const router = useRouter();

  const [values, setValues] = useState<Settings>(initialUserSettings ?? {});
  const [savedSettings, setSavedSettings] = useState<Settings>(initialUserSettings ?? {});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const setField = (key: NumericKeys, raw: string) => {
    const v = raw.trim();
    if (v === '') {
      setValues((prev) => {
        const next = { ...prev };
        // remove key to allow fallback from companyDefaults
        delete (next as any)[key];
        return next;
      });
      return;
    }
    const num = parseFloat(v);
    if (Number.isNaN(num)) return;
    setValues((prev) => ({ ...prev, [key]: num }));
  };

  const getFallback = (key: NumericKeys): number | undefined => companyDefaults?.[key];

  const getSaved = (key: NumericKeys): number | undefined => savedSettings?.[key];

  const getEffective = (key: NumericKeys): number | undefined => {
    const sv = savedSettings?.[key];
    if (sv !== undefined) return sv;
    return companyDefaults?.[key];
  };

  const SavedInfo: React.FC<{ k: NumericKeys }> = ({ k }) => (
    <small className="text-muted">
      Saved: {getSaved(k) ?? '—'} • Effective: {getEffective(k) ?? '—'}
    </small>
  );

  const resetToCompanyDefaults = () => {
    if (companyDefaults) {
      setValues(companyDefaults);
      setMessage({ type: 'info', text: 'Loaded company default values into the form. Remember to Save.' });
    }
  };

  const sanitizePayload = (obj: Settings) => {
    const out: Record<string, number> = {};
    (Object.keys(obj) as NumericKeys[]).forEach((k) => {
      const n = obj[k];
      if (typeof n === 'number' && !Number.isNaN(n)) {
        out[k] = n;
      }
    });
    return out;
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error('Not authenticated');

      const payload = sanitizePayload(values);
      const { error } = await supabase
        .from('user_profiles')
        .update({ settings: payload })
        .eq('id', user.id);

      if (error) throw error;

      setSavedSettings(payload);
      setMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const applyToCalculator = () => {
    try {
      const STORAGE_KEY = 'painting-calculator-data';
      const existingRaw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      const existing = existingRaw ? JSON.parse(existingRaw) as Partial<ProjectData> : {};

      const merged: Partial<ProjectData> = { ...existing };

      (Object.keys(values) as NumericKeys[]).forEach((k) => {
        const v = values[k];
        if (typeof v === 'number' && !Number.isNaN(v)) {
          // Only assign known keys from NumericKeys onto ProjectData type
          (merged as any)[k] = v;
        } else if (v === undefined && companyDefaults && companyDefaults[k] !== undefined) {
          (merged as any)[k] = companyDefaults[k]!;
        }
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      router.push('/dashboard');
    } catch {
      setMessage({ type: 'error', text: 'Failed to apply settings to calculator.' });
    }
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">{title}</h5>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );

  return (
    <div>
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : message.type === 'error' ? 'alert-danger' : 'alert-info'}`}>
          {message.text}
        </div>
      )}

      {!companyDefaults && (
        <div className="alert alert-warning">
          Company default settings were not found. You can still save personal defaults below.
        </div>
      )}

      {/* Pricing */}
      <Section title="Pricing">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Price per Square Foot ($)</label>
            <input
              type="number"
              step="0.25"
              className="form-control"
              value={toInputValue(values.pricePerSq)}
              placeholder={getFallback('pricePerSq')?.toString() ?? 'e.g. 4.00'}
              onChange={(e) => setField('pricePerSq', e.target.value)}
            />
            <SavedInfo k="pricePerSq" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Hourly Rate with Materials ($)</label>
            <input
              type="number"
              step="1"
              className="form-control"
              value={toInputValue(values.hourlyRateWithMaterials)}
              placeholder={getFallback('hourlyRateWithMaterials')?.toString() ?? 'e.g. 65'}
              onChange={(e) => setField('hourlyRateWithMaterials', e.target.value)}
            />
            <SavedInfo k="hourlyRateWithMaterials" />
          </div>
        </div>
      </Section>

      {/* Schedule */}
      <Section title="Schedule">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Number of Painters</label>
            <input
              type="number"
              min={1}
              step="1"
              className="form-control"
              value={toInputValue(values.numPainters)}
              placeholder={getFallback('numPainters')?.toString() ?? 'e.g. 3'}
              onChange={(e) => setField('numPainters', e.target.value)}
            />
            <SavedInfo k="numPainters" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Hours per Day</label>
            <input
              type="number"
              min={1}
              max={12}
              step="1"
              className="form-control"
              value={toInputValue(values.hoursPerDay)}
              placeholder={getFallback('hoursPerDay')?.toString() ?? 'e.g. 10'}
              onChange={(e) => setField('hoursPerDay', e.target.value)}
            />
            <SavedInfo k="hoursPerDay" />
          </div>
        </div>
      </Section>

      {/* Paint */}
      <Section title="Paint">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Coverage (SF/gal)</label>
            <input
              type="number"
              min={100}
              step="10"
              className="form-control"
              value={toInputValue(values.paintCoverage)}
              placeholder={getFallback('paintCoverage')?.toString() ?? 'e.g. 350'}
              onChange={(e) => setField('paintCoverage', e.target.value)}
            />
            <SavedInfo k="paintCoverage" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Number of Coats</label>
            <input
              type="number"
              min={1}
              step="1"
              className="form-control"
              value={toInputValue(values.numberOfCoats)}
              placeholder={getFallback('numberOfCoats')?.toString() ?? 'e.g. 2'}
              onChange={(e) => setField('numberOfCoats', e.target.value)}
            />
            <SavedInfo k="numberOfCoats" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Paint Cost per Gallon ($)</label>
            <input
              type="number"
              min={0}
              step="1"
              className="form-control"
              value={toInputValue(values.paintCostPerGallon)}
              placeholder={getFallback('paintCostPerGallon')?.toString() ?? 'e.g. 65'}
              onChange={(e) => setField('paintCostPerGallon', e.target.value)}
            />
            <SavedInfo k="paintCostPerGallon" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Paint Budget (%)</label>
            <input
              type="number"
              min={0}
              max={50}
              step="0.5"
              className="form-control"
              value={toInputValue(values.paintBudgetPercentage)}
              placeholder={getFallback('paintBudgetPercentage')?.toString() ?? 'e.g. 12'}
              onChange={(e) => setField('paintBudgetPercentage', e.target.value)}
            />
            <SavedInfo k="paintBudgetPercentage" />
          </div>
        </div>
      </Section>

      {/* Commissions */}
      <Section title="Commissions">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Sales Commission (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.5"
              className="form-control"
              value={toInputValue(values.salesCommissionPercentage)}
              placeholder={getFallback('salesCommissionPercentage')?.toString() ?? 'e.g. 10'}
              onChange={(e) => setField('salesCommissionPercentage', e.target.value)}
            />
            <SavedInfo k="salesCommissionPercentage" />
          </div>
          <div className="col-md-6">
            <label className="form-label">PM Commission (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.5"
              className="form-control"
              value={toInputValue(values.pmCommissionPercentage)}
              placeholder={getFallback('pmCommissionPercentage')?.toString() ?? 'e.g. 5'}
              onChange={(e) => setField('pmCommissionPercentage', e.target.value)}
            />
            <SavedInfo k="pmCommissionPercentage" />
          </div>
        </div>
      </Section>

      {/* Subcontract */}
      <Section title="Subcontract">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Subcontract (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step="5"
              className="form-control"
              value={toInputValue(values.subcontractPercentage)}
              placeholder={getFallback('subcontractPercentage')?.toString() ?? 'e.g. 50'}
              onChange={(e) => setField('subcontractPercentage', e.target.value)}
            />
            <SavedInfo k="subcontractPercentage" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Sub Hourly Rate ($)</label>
            <input
              type="number"
              min={0}
              step="1"
              className="form-control"
              value={toInputValue(values.subHourlyRate)}
              placeholder={getFallback('subHourlyRate')?.toString() ?? 'e.g. 35'}
              onChange={(e) => setField('subHourlyRate', e.target.value)}
            />
            <SavedInfo k="subHourlyRate" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Sub Painters</label>
            <input
              type="number"
              min={1}
              step="1"
              className="form-control"
              value={toInputValue(values.subNumPainters)}
              placeholder={getFallback('subNumPainters')?.toString() ?? 'e.g. 2'}
              onChange={(e) => setField('subNumPainters', e.target.value)}
            />
            <SavedInfo k="subNumPainters" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Sub Hours per Day</label>
            <input
              type="number"
              min={1}
              max={12}
              step="1"
              className="form-control"
              value={toInputValue(values.subHoursPerDay)}
              placeholder={getFallback('subHoursPerDay')?.toString() ?? 'e.g. 8'}
              onChange={(e) => setField('subHoursPerDay', e.target.value)}
            />
            <SavedInfo k="subHoursPerDay" />
          </div>
        </div>
      </Section>

      {/* Targets */}
      <Section title="Targets">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Target Material (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.5"
              className="form-control"
              value={toInputValue(values.targetMaterialPercentage)}
              placeholder={getFallback('targetMaterialPercentage')?.toString() ?? 'e.g. 12'}
              onChange={(e) => setField('targetMaterialPercentage', e.target.value)}
            />
            <SavedInfo k="targetMaterialPercentage" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Target Margin (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.5"
              className="form-control"
              value={toInputValue(values.targetMarginPercentage)}
              placeholder={getFallback('targetMarginPercentage')?.toString() ?? 'e.g. 25'}
              onChange={(e) => setField('targetMarginPercentage', e.target.value)}
            />
            <SavedInfo k="targetMarginPercentage" />
          </div>
        </div>
      </Section>

      {/* Actions */}
      <div className="d-flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <button className="btn btn-outline-primary" onClick={applyToCalculator}>
          Apply to Calculator Now
        </button>
        <button className="btn btn-outline-secondary" onClick={resetToCompanyDefaults} disabled={!companyDefaults}>
          Reset to Company Defaults
        </button>
      </div>
    </div>
  );
}
