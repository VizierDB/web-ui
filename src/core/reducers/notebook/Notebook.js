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

import { CHANGE_GROUP_MODE, REVERSE_ORDER } from '../../actions/notebook/Notebook';
import {
    RECEIVE_PROJECT_RESOURCE, UPDATE_RESOURCE, UPDATE_WORKFLOW
} from '../../actions/project/ProjectPage';
import { GRP_HIDE } from '../../resources/Notebook';

/**
* Reducer for notebook. Keeps track of the notebook itself and the cell order.
*/


/**
 * STATE:
 *
 * grouped: Flag indicating whether consecutive VizUAL commands are grouped in
 *     a single cell.
 * notebook: Notebook
 * reversed: Flag indicating whether cells are shown in reveresed order

 */
const INITIAL_STATE = {
    groupMode: GRP_HIDE,
    notebook: null,
    reversed: false
}

export const notebook = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case CHANGE_GROUP_MODE:
            return {
                ...state,
                groupMode: action.mode
            }
        case RECEIVE_PROJECT_RESOURCE:
        case UPDATE_RESOURCE:
        case UPDATE_WORKFLOW:
            const resource = action.resource;
            if (resource != null) {
                if (resource.isNotebook()) {
                    return {
                        ...state,
                        notebook: resource.content
                    }
                }
            }
            return state;
        case REVERSE_ORDER:
            return {
                ...state,
                reversed: !state.reversed
            }
        default:
            return state
    }
}
