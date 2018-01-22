/**
 * Actions for project name edit form. Allows to toggle form and headline
 * view, submit new project name, and set form error.
 */

import { receiveProject } from './ProjectPage'
import { updateResourceProperty } from '../../util/Api'


export const SET_PROJECT_NAME_FORM_ERROR = 'SET_PROJECT_NAME_FORM_ERROR'
export const SHOW_PROJECT_NAME_FORM = 'SHOW_PROJECT_NAME_FORM'
export const START_PROJECT_NAME_FORM_SUBMIT = 'START_PROJECT_NAME_FORM_SUBMIT'

/**
 * Show error that is generated while updating the project name.
 */
export const setProjectNameErrorInForm = (error) => ({
    type: SET_PROJECT_NAME_FORM_ERROR,
    error
})

/**
 * Toggle visibility of the edit project name form.
 */
export const showProjectNameForm = (value) => ({
    type: SHOW_PROJECT_NAME_FORM,
    value
})

/**
 * Signal start of submitting edit project name form.
 */
export const startProjectNameFormSubmit = () => ({
    type: START_PROJECT_NAME_FORM_SUBMIT
})

/**
 * Submit request to update project name in project listing.
 */
export const updateProjectNameInForm = (url, projectName) => (dispatch) => {
    // Need to wrap recive project and hide edit form into success handler
    dispatch(updateResourceProperty(
        url,
        'name',
        projectName,
        (json) => (dispatch) => {
            dispatch(receiveProject(json))
            dispatch(showProjectNameForm(false))
        },
        setProjectNameErrorInForm,
        startProjectNameFormSubmit)
    )
}
