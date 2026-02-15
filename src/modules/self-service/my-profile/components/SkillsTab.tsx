/**
 * Skills Tab
 * View-only display of employee skills and certifications
 */

import { SkillsSetCard } from './SkillsSetCard';

interface SkillsTabProps {
  // Props kept for compatibility
}

export function SkillsTab({}: SkillsTabProps) {
  return (
    <div className="w-full">
      <SkillsSetCard />
    </div>
  );
}
