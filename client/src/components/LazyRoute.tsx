import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LazyRouteProps {
  component: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
}

const LazyRoute: React.FC<LazyRouteProps> = ({ 
  component, 
  fallback = <LoadingSpinner size="lg" className="min-h-screen" />
}) => {
  const LazyComponent = lazy(component);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
};

export default LazyRoute;
