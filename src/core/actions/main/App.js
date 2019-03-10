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

// Add a command to the list of hidden commands
export const ADD_FILTERED_COMMAND = 'ADD_FILTERED_COMMAND';
// Copy a given cell to the clipboard that is contained in the user settings
export const COPY_CELL = 'COPY_CELL';
// Toggle the value of the hide cells property
export const HIDE_CELLS= 'HIDE_CELLS';
// Dummy action when redirecting as result of a received resource
export const NO_OP = 'NO_OP';
// Remove a command from list of filtered commands
export const REMOVE_FILTERED_COMMAND = 'REMOVE_FILTERED_COMMAND';
// Reverse notebook cell order
export const REVERSE_ORDER = 'REVERSE_ORDER';
// Set the object that conatins the filtered module identifier
export const SET_FILTERED_MODULES = 'SET_FILTERED_MODULES';


/**
 * Add the given command to the list of filtered commands in the user
 * settings.
 */
export const addFilteredCommand = (command) => ({
    type: ADD_FILTERED_COMMAND,
    command
})


/**
 * Copy the given cell to the clipboard that is contained in the user settings.
 */
export const copyCell = (cell) => ({
    type: COPY_CELL,
    cell
})

/**
 * Set the object that contains the filtered module identifier. Expects an
 * object where the properties are package identifier and the values are
 * lists of command identifier.
 */
export const setModuleFilter = (filter) => ({
    type: SET_FILTERED_MODULES,
    filter
})

/**
 * Toggle the value of the hide filtered cells property in the user settings.
 */
export const toggleHideCells = () => ({
    type: HIDE_CELLS
});


/**
 * Remove the given command from the list of filtered commands in the user
 * settings.
 */
export const removeFilteredCommand = (command) => ({
    type: REMOVE_FILTERED_COMMAND,
    command
})

/**
 * Reverse ordering of notebook cells.
 */
export const reverseOrder = () => ({
    type: REVERSE_ORDER
});
