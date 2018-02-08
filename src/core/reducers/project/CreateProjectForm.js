/**
 * Reducer for actions that create a new data curation project.
 */

import {
    PROJECT_SUBMITTING, SET_PROJECT_CREATE_ERROR
} from '../../actions/project/ProjectListing'


/**
 * STATE:
 *
 * error: Error message that was generated during a HTTP POST request
 * isSubmitting: Flag indicating whether HTTP POST request has been submitted
 */

const INITIAL_STATE = {
    error: null,
    isSubmitting: false
}

export const projectCreate = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case PROJECT_SUBMITTING:
            return {
                ...state,
                isSubmitting: action.flag
            }
        case SET_PROJECT_CREATE_ERROR:
            return {
                ...state,
                isSubmitting: false,
                error: action.error
            }
        default:
            return state
  }
}
