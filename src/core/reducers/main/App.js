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

import { UserSettings } from '../../util/Settings';
import { ADD_FILTERED_COMMAND, COPY_CELL, HIDE_CELLS, REMOVE_FILTERED_COMMAND,
    REVERSE_ORDER, SET_FILTERED_MODULES } from '../../actions/main/App';

/**
* This application state contains the user preferences object.
*/

const INITIAL_STATE = {
    userSettings: new UserSettings()
}


export const app = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ADD_FILTERED_COMMAND:
            return {
                ...state,
                userSettings: state.userSettings.addCommandToHiddenList(action.command)
            };
        case COPY_CELL:
            return {
                ...state,
                userSettings: state.userSettings.copyCell(action.cell)
            };
        case HIDE_CELLS:
            return {
                ...state,
                userSettings: state.userSettings.toggleHideCells()
            };
        case REMOVE_FILTERED_COMMAND:
            return {
                ...state,
                userSettings: state.userSettings.removeCommandFromHiddenList(action.command)
            };
        case REVERSE_ORDER:
            return {
                ...state,
                userSettings: state.userSettings.reverseOrder()
            };
        case SET_FILTERED_MODULES:
            return {
                ...state,
                userSettings: state.userSettings.setFilter(action.filter)
            };
        default:
            return state
    }
}
