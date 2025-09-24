'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Lock } from 'lucide-react';

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  locked?: boolean;
  prefix?: string;
}

export default function InputField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit = '',
  locked = false,
  prefix = '$'
}: InputFieldProps) {
  const [inputValue, setInputValue] = useState(() => value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    const numValue = parseFloat(inputValue) || 0;
    let clampedValue = Math.max(min, numValue);
    if (max !== undefined) {
      clampedValue = Math.min(max, clampedValue);
    }
    onChange(clampedValue);
    setInputValue(clampedValue.toString());
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const increment = () => {
    const newValue = value + step;
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  return (
    <div className="mb-3">
      <label className="form-label fw-medium">
        {label}
      </label>
      <div className="input-group">
        <div className="input-group">
          {prefix && (
            <span className="input-group-text">{prefix}</span>
          )}
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            min={min}
            step={step}
            disabled={locked}
            className={`form-control text-end ${locked ? 'bg-light' : ''}`}
            suppressHydrationWarning
          />
          {unit && (
            <span className="input-group-text">{unit}</span>
          )}
          {locked && (
            <span className="input-group-text">
              <Lock className="text-muted" style={{ width: '1rem', height: '1rem' }} />
            </span>
          )}
        </div>
        {!locked && (
          <div className="btn-group-vertical">
            <button
              type="button"
              onClick={increment}
              className="btn btn-outline-secondary btn-sm"
            >
              <ChevronUp style={{ width: '1rem', height: '1rem' }} />
            </button>
            <button
              type="button"
              onClick={decrement}
              className="btn btn-outline-secondary btn-sm"
            >
              <ChevronDown style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
