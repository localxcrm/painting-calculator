'use client';

import { TrendingUp, TrendingDown, Minus, DollarSign, Calendar, Percent, Users } from 'lucide-react';
import { MetricCardData } from '@/types';

const iconMap = {
  dollar: DollarSign,
  calendar: Calendar,
  percent: Percent,
  users: Users,
};

export default function MetricCard({ title, value, trend, icon }: MetricCardData) {
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
