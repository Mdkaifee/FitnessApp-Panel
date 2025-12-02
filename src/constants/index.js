export const TOKEN_KEY = 'fitness_admin_access_token'
export const ACTIVE_VIEW_KEY = 'fitness_admin_active_view'
export const WORKSPACE_VIEWS = new Set(['dashboard', 'users', 'videos', 'questions', 'subscription'])

export const GENDER_ALL_LABEL = 'All'
export const GENDER_API_BOTH = 'Both'

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

export const ANSWER_TYPES = [
  { label: 'Single choice', value: 'single_choice' },
  { label: 'Multi choice', value: 'multi_choice' },
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Date', value: 'date' },
  { label: 'Weight', value: 'weight' },
  { label: 'Height', value: 'height' },
  { label: 'Other', value: 'other' },
]
