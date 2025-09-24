'use client';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function DashboardCard({ title, children, className = '' }: DashboardCardProps) {
  return (
    <div className={`card ${className}`}>
      <div className="card-body">
        <h3 className="card-title h5 mb-4">{title}</h3>
        <div className="gap-3 d-flex flex-column">
          {children}
        </div>
      </div>
    </div>
  );
}
