/**
 * Reducer for actions in the project menu bar. The menu contains entries to
 * select, edit or delete the current branch, and to switch between notebook
 * and sepreadsheet views.
 */

import {
    CREATE_PROJECT_BRANCH, MENU_RECEIVE_BRANCHES, MENU_SET_BUSY_FLAG,
    MENU_SET_CURRENT_BRANCH, MENU_SET_CURRENT_DATASET, MENU_SET_ERROR
} from '../../actions/project/ProjectMenu'
import { RECEIVE_WORKFLOW } from '../../actions/project/Workflow'
import { BranchDescriptor } from '../../util/Api'


/**
 * Convert the list of branch descriptors returned by the API as part of a
 * project handle into a list of objects that contain id, name, and a
 * BranchReferences object.
 */
const listBranches = (branches) => {
    let result = [];
    for (let i = 0; i < branches.length; i++) {
        const br = branches[i]
        result.push(new BranchDescriptor(br))
    }
    return result;
}

/**
 * STATE:
 *
 * branches: List of branch descriptors
 * datasets: List of dataset descriptors
 * error: Error message generated while modifying a branch or fetching resources
 *        Expects an object containing error title and message.
 * isBusy: Flag indcating whether there is an active update or fetch operation
 * selectedBranch: Descriptor of the selected branch
 * selectedDataset: Descriptor for dataset that is shown in spreadsheet. The
 *                  notebook is shown if this value is null.
 */
const INITIAL_STATE = {
    branches: [],
    datasets: [],
    error: null,
    isBusy: false,
    selectedBranch: null,
    selectedDataset: null
}

export const projectMenu = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case CREATE_PROJECT_BRANCH:
            return {...state, isBusy: true}
        case MENU_RECEIVE_BRANCHES:
            return {
                ...state,
                error: null,
                isBusy: false,
                branches: listBranches(action.branches)
            }
        case RECEIVE_WORKFLOW:
            return {...state, datasets: action.workflow.datasets}
        case MENU_SET_CURRENT_BRANCH:
            return {
                ...state,
                error: null,
                isBusy: false,
                selectedBranch: action.branch,
                selectedDataset: null
            }
        case MENU_SET_CURRENT_DATASET:
            return {...state, selectedDataset: action.dataset}
        case MENU_SET_ERROR:
            return {...state, isBusy: false, error: action.error}
        case MENU_SET_BUSY_FLAG:
            return {...state, isBusy: action.value}
        default:
            return state
    }
}
