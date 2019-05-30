/**
 * Copyright (C) 2018 New York University
 *                    University at Buffalo,
 *                    Illinois Institute of Technology.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /**
 * Reducer for actions that affect the notebook page.
 */

import { RECEIVE_WORKFLOW, REQUEST_WORKFLOW, SET_ACTIVE_NOTEBOOK_CELL,
    UPDATE_NOTEBOOK } from '../../actions/project/Notebook';
import { PROJECT_FETCH_ERROR, RECEIVE_PROJECT, REQUEST_PROJECT } from '../../actions/project/Project';
import { Notebook } from '../../resources/Notebook';


/**
 * STATE:
 *
 * activeCell: Identifier of the active cell
 * fetchError: Error while loading the project handle or workflow handle
 * groupMode: Mode for grouping Vizual commands
 * isFetching: Load of project handle or workflow handle in progress
 * notebook: Notebook for the current workflow handle
 * reversed: Order of cells in a notebook
 */

const INITIAL_STATE = {
    activeCell: null,
    fetchError: null,
    isFetching: false,
    notebook: null,
    reversed: false,
}

export const spreadsheetPage = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case PROJECT_FETCH_ERROR:
            return {
                ...state,
                isFetching: false,
                fetchError: action.error
            };
        case RECEIVE_WORKFLOW:
            return {
                ...state,
                activeCell: null,
                isFetching: false,
                fetchError: null,
                notebook: new Notebook(action.workflow).fromWorkflow(action.workflow)
            };
        case RECEIVE_PROJECT:
            return {...state, activeCell: null, notebook: null};
        case REQUEST_PROJECT:
        case REQUEST_WORKFLOW:
            return {
                ...state,
                isFetching: true,
            };
        case SET_ACTIVE_NOTEBOOK_CELL:
            return {...state, activeCell: action.cellId};
        case UPDATE_NOTEBOOK:
            return {...state, notebook: action.notebook};
        default:
            return state
    }
}
