export const TOKEN_KEY = 'fitness_admin_access_token'
export const ACTIVE_VIEW_KEY = 'fitness_admin_active_view'
export const WORKSPACE_VIEWS = new Set(['dashboard', 'users', 'videos', 'questions', 'subscription'])

export const VIDEO_CATEGORIES = [
  { label: 'NewCore', value: 'NewCore' },
  { label: 'NewArms', value: 'NewArms' },
  { label: 'NewLegs', value: 'NewLegs' },
  { label: 'NewFullBody', value: 'NewFullBody' },
]

export const VIDEO_GENDERS = [
  { label: 'All genders', value: 'Both' },
  { label: 'Female', value: 'Female' },
  { label: 'Male', value: 'Male' },
]

export const QUESTION_TYPES = [
  { label: 'All Types', value: '' },
  { label: 'Weight', value: 'weight' },
  { label: 'Height', value: 'height' },
  { label: 'Habits', value: 'habits' },
  { label: 'Nutrition', value: 'nutrition' },
  { label: 'Other', value: 'other' },
]
