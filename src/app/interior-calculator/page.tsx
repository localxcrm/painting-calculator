import Link from 'next/link';
import InteriorCalculator from '@/components/InteriorCalculator';

export default function InteriorCalculatorPage() {
  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Interior Painting Calculator</h1>
          <p className="text-muted mb-0">Calculate paint requirements for interior rooms</p>
        </div>
        <Link href="/" className="btn btn-outline-secondary">
          ← Back to Home
        </Link>
      </div>

      <InteriorCalculator />
    </div>
  );
}
