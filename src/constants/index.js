export const TOKEN_KEY = 'fitness_admin_access_token'
export const ACTIVE_VIEW_KEY = 'fitness_admin_active_view'
export const AUTH_EMAIL_KEY = 'fitness_admin_auth_email'
export const WORKSPACE_VIEWS = new Set([
  'dashboard',
  'users',
  'videos',
  'questions',
  'subscription',
  'privacyPolicy',
  'deleteAccount',
])

export const PUBLIC_VIEWS = new Set(['privacyPolicy', 'deleteAccount'])

export const WORKSPACE_VIEW_ROUTES = {
  dashboard: '/dashboard',
  users: '/users',
  videos: '/videos',
  questions: '/questions',
  subscription: '/subscription',
  privacyPolicy: '/privacy-policy',
  deleteAccount: '/delete-account',
}

export const ROUTE_TO_WORKSPACE_VIEW = Object.entries(WORKSPACE_VIEW_ROUTES).reduce(
  (acc, [view, path]) => {
    acc[path] = view
    return acc
  },
  {},
)

export const GENDER_ALL_LABEL = 'All'
export const GENDER_API_BOTH = 'Both'

export const VIDEO_CATEGORIES = [
  { label: 'Cores', value: 'Core' },
  { label: 'Arms', value: 'Arms' },
  { label: 'Legs', value: 'Legs' },
  { label: 'Full Body', value: 'FullBody' },
  { label: 'Full Body Strength(20 min Video)', value: 'FullBodyStrength' },
  { label: 'Sport Nutrition(20 min Video)', value: 'SportNutrition' },
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
