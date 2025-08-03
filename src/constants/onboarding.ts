// Color palettes for automatic theme selection
export const COLOR_PALETTES = [
  {
    primaryColor: '#3B82F6', // Blue
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    primaryColor: '#10B981', // Emerald
    backgroundColor: 'linear-gradient(135deg, #2dd4bf 0%, #059669 100%)'
  },
  {
    primaryColor: '#F59E0B', // Amber
    backgroundColor: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)'
  },
  {
    primaryColor: '#EF4444', // Red
    backgroundColor: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)'
  },
  {
    primaryColor: '#8B5CF6', // Violet
    backgroundColor: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)'
  },
  {
    primaryColor: '#06B6D4', // Cyan
    backgroundColor: 'linear-gradient(135deg, #67e8f9 0%, #0891b2 100%)'
  },
  {
    primaryColor: '#84CC16', // Lime
    backgroundColor: 'linear-gradient(135deg, #a3e635 0%, #65a30d 100%)'
  },
  {
    primaryColor: '#EC4899', // Pink
    backgroundColor: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)'
  },
  {
    primaryColor: '#6366F1', // Indigo
    backgroundColor: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)'
  },
  {
    primaryColor: '#14B8A6', // Teal
    backgroundColor: 'linear-gradient(135deg, #5eead4 0%, #0f766e 100%)'
  }
];

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', direction: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', direction: 'rtl' }
] as const;
