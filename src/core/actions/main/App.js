export const REDIRECT_TO = 'REDIRECT_TO'

/**
 * Redirect to a given internal resource
 */
export const redirectTo = (url) => ({
  type: REDIRECT_TO,
  url
})
