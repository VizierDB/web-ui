/**
 * Actions to interact with the project menu bar. Actions include
 * (i) selecting the current branch, (ii) edit the name of the selected branch,
 * and (iii) delete the selected branch, (iv) switch between notebook and
 * spreadsheet view.
 */

import { fetchWorkflow } from './Workflow'
import { fetchSpreadsheet } from '../spreadsheet/Spreadsheet'
import {
    deleteResource, fetchResource, postResourceData, updateResourceProperty,
    BranchDescriptor
} from '../../util/Api'

export const CREATE_PROJECT_BRANCH = 'CREATE_PROJECT_BRANCH'
export const MENU_RECEIVE_BRANCHES = 'MENU_RECEIVE_BRANCHES'
export const MENU_SET_BUSY_FLAG = 'MENU_SET_BUSY_FLAG'
export const MENU_SET_CURRENT_BRANCH = 'MENU_SET_CURRENT_BRANCH'
export const MENU_SET_CURRENT_DATASET = 'MENU_SET_CURRENT_DATASET'
export const MENU_SET_ERROR = 'MENU_SET_ERROR'

export const clearMenuError = () => ({
    type: MENU_SET_ERROR,
    error: null
})

/**
 * Create a new project branch from a given source. Fetch the modified list of
 * branches on success. Assumes that the Url to create a branch and to fetch
 * all branches is the same.
 */
export const createProjectBranch = (url, branch, version, moduleId, name) =>  (dispatch) => {
    const data = {
        source: {
            branch,
            version,
            moduleId
        },
        properties: [{
            key: 'name',
            value: name
        }]
    }
    return postResourceData(
        dispatch,
        url,
        data,
        () => (fetchProjectBranches(url, setCreateBranchError)),
        setCreateBranchError,
        () => (setMenuBusyFlag(true))
    )
}

/**
 * Delete a branch using the given deleteUrl. Fetch updated branch list on
 * success using the given fetchUrl.
 */
export const deleteBranch = (deleteUrl, fetchUrl) => (dispatch) => {
    dispatch(deleteResource(
        deleteUrl,
        () => {
            dispatch(setMenuBusyFlag(false))
            return fetchProjectBranches(fetchUrl, setBranchDeleteError)
        },
        setBranchDeleteError,
        () => (setMenuBusyFlag(true))
    ))
}

/**
 * Get list of project branch descriptors from given Url.
 */
export const fetchProjectBranches = (url, errorHandler) => (dispatch) => {
    dispatch(
        fetchResource(
            url,
            (json) => (dispatch) => (
                dispatch(
                    receiveBranches(json.branches)
                )
            ),
            errorHandler,
            () => (setMenuBusyFlag(true))
        )
    )
}

/**
 * Find the default branch in the given branch listing
 */

const getDefaultBranch = (branches) => {
    for (let i = 0; i < branches.length; i++) {
        const br = branches[i]
        if (br.id === 'master') {
            return new BranchDescriptor(br)
        }
    }
}

/**
 * Set the list of branches for the current project to be displayed in the
 * selector.
 */
export const receiveBranches = (branches) => (dispatch, getState) => {
    dispatch({
        type: MENU_RECEIVE_BRANCHES,
        branches
    })
    let currentBranch =  getState().projectMenu.selectedBranch
    let selectedBranch = null
    if (currentBranch) {
        for (let i = 0; i < branches.length; i++) {
            const br = branches[i]
            if (br.id === currentBranch.id) {
                selectedBranch = new BranchDescriptor(br)
                break
            }
        }
        if (! selectedBranch) {
            selectedBranch = getDefaultBranch(branches)
        }
    } else {
        selectedBranch = getDefaultBranch(branches)
    }
    dispatch(setCurrentBranch(selectedBranch))
}

/**
 * Set error message generated during branch delete
 */
export const setBranchDeleteError = (message) => ({
    type: MENU_SET_ERROR,
    error: {
        title: 'Error while deleting branch',
        message
    }
})

/**
 * Set error message generated during branch name update
 */
export const setBranchEditError = (message) => ({
    type: MENU_SET_ERROR,
    error: {
        title: 'Error while updating branch name',
        message
    }
})

/**
 * Set error message generated during branch name update
 */
export const setCreateBranchError = (message) => ({
    type: MENU_SET_ERROR,
    error: {
        title: 'Error while creating new branch',
        message
    }
})

/**
 * Set the value of the busy flag for the project menu bar
 */
export const setMenuBusyFlag = (value) => ({
    type: MENU_SET_BUSY_FLAG,
    value
})

/**
 * Set the current branch.
 */
export const setCurrentBranch = (branch) => (dispatch) => {
    dispatch(fetchWorkflow(branch.links.head))
    dispatch({
        type: MENU_SET_CURRENT_BRANCH,
        branch
    })
}

/**
 * Set current dataset to null which will show the notebook view.
 */
export const showNotebookView = () => ({
    type: MENU_SET_CURRENT_DATASET,
    dataset: null
})

/**
 * Set the current dataset to switch to spreadsheet view.
 */
export const showSpreadsheetView = (dataset) => (dispatch) => {
    dispatch({
        type: MENU_SET_CURRENT_DATASET,
        dataset
    })
    dispatch(fetchSpreadsheet(dataset.links.annotated, dataset.name))
}

/**
 * Update the name of a given branch descriptor. Fetch updated branch list on
 * success using the given fetchUrl.
 */
export const updateBranchName = (branch, name, fetchUrl) => (dispatch) => {
    dispatch(updateResourceProperty(
        branch.links.update,
        'name',
        name,
        () => {
            dispatch(setMenuBusyFlag(false))
            return fetchProjectBranches(fetchUrl, setBranchEditError)
        },
        setBranchEditError,
        () => (setMenuBusyFlag(true))
    ))
}
