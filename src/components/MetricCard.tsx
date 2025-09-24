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
  const IconComponent = iconMap[icon as keyof typeof iconMap] || DollarSign;

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="card border">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <IconComponent style={{ width: '1.5rem', height: '1.5rem' }} className="text-secondary" />
          {getTrendIcon()}
        </div>
        <div>
          <p className="text-muted small mb-1">{title}</p>
          <p className="fw-bold fs-5 mb-0">{value}</p>
        </div>
      </div>
    </div>
  );
}
