/**
 * Reducer for actions that create a new data curation project.
 */

import {
    SET_PROJECT_NAME_FORM_ERROR, SHOW_PROJECT_NAME_FORM,
    START_PROJECT_NAME_FORM_SUBMIT
} from '../../actions/project/ProjectNameForm'


/**
 * STATE:
 *
 * error: Error message that was generated during a HTTP POST request
 * isEditing: Flag indicating whether the input field is shown
 * isSubmitting: Flag indicating whether HTTP POST request has been submitted
 * project: Project resource that is being edited
 */

const INITIAL_STATE = {
    error: null,
    isEditing: false,
    isUpdating: false,
    project: null
}

export const projectName = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case SET_PROJECT_NAME_FORM_ERROR:
            return {...state, error: action.error, isEditing: true, isUpdating: false}
        case SHOW_PROJECT_NAME_FORM:
            return {...state, error: null, isEditing: action.value, isUpdating: false}
        case START_PROJECT_NAME_FORM_SUBMIT:
            return {...state, isUpdating: true, isEditing: false}
        default:
            return state
  }
}
