'use client';

import { MetricCardData } from '@/types';

export default function MetricCard({ title, value }: MetricCardData) {
  return (
    <div className="card border">
      <div className="card-body p-3">
        <div>
          <p className="text-muted small mb-1">{title}</p>
          <p className="fw-bold fs-6 mb-0">{value}</p>
        </div>
      </div>
    </div>
  );
}
