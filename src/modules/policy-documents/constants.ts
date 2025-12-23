/**
 * Policy Library Constants
 */

export const POLICY_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
};

export const POLICY_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  draft: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  archived: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
};

export const POLICY_CATEGORY_LABELS: Record<string, string> = {
  hr: 'Human Resources',
  it: 'Information Technology',
  security: 'Security',
  compliance: 'Compliance',
  general: 'General',
  safety: 'Safety',
};

export const POLICY_CATEGORY_COLORS: Record<string, string> = {
  hr: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  it: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  security: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  compliance: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  general: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
  safety: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
};

export const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: '📄',
  docx: '📝',
  url: '🔗',
};
