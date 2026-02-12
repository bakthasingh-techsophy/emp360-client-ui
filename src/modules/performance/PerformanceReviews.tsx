/**
 * Performance Reviews Module
 * Full RBAC implementation with template builder, workflow engine, and score calculation
 */

import { PerformanceReviewProvider } from './context/PerformanceReviewContext';
import { PerformanceReviewsPage } from './components/PerformanceReviewsPage';

export function PerformanceReviews() {
  return (
    <PerformanceReviewProvider>
      <PerformanceReviewsPage />
    </PerformanceReviewProvider>
  );
}
