interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border spinner-border-lg'
  };

  return (
    <div className={`d-flex align-items-center justify-content-center ${className}`}>
      <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && size !== 'sm' && (
        <span className="ms-2 text-muted">{text}</span>
      )}
    </div>
  );
}

export function LoadingPage({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function LoadingCard({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="card">
      <div className="card-body text-center py-5">
        <LoadingSpinner text={text} />
      </div>
    </div>
  );
}
