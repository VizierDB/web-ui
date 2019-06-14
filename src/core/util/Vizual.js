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
 * Collection of definitions and helper methods to submit Vizual operstions.
 */

/**
 * Vizual operation identifier
 */

export const VIZUAL = {
    DELETE_COLUMN: 'DELETE_COLUMN',
    DELETE_ROW: 'DELETE_ROW',
    DROP_DATASET: 'DROP_DATASET',
    INSERT_COLUMN: 'INSERT_COLUMN',
    INSERT_ROW: 'INSERT_ROW',
    LOAD: 'LOAD',
    MOVE_COLUMN: 'MOVE_COLUMN',
    MOVE_ROW: 'MOVE_ROW',
    PROJECTION: 'PROJECTION',
    RENAME_COLUMN: 'RENAME_COLUMN',
    RENAME_DATASET: 'RENAME_DATASET',
    SORT: 'SORT_DATASET',
    UPDATE_CELL: 'updateCell'
}

export const VIZUAL_OP = 'vizual';

// Sort orders
export const SORT = {
    ASC: 'A-Z',
    DESC: 'Z-A'
}


/**
 * DELETE COLUMN operation request body
 */
export const deleteColumn = (dataset, column) => ({
    type: VIZUAL_OP,
    id: VIZUAL.DELETE_COLUMN,
    arguments: {
        dataset,
        column
    }
})


/**
 * DELETE ROW operation request body
 */
export const deleteRow = (dataset, row) => ({
    type: VIZUAL_OP,
    id: VIZUAL.DELETE_ROW,
    arguments: {
        dataset,
        row
    }
})


/**
 * INSERT COLUMN operation request body
 */
export const insertColumn = (dataset, name, position) => ({
    type: VIZUAL_OP,
    id: VIZUAL.INSERT_COLUMN,
    arguments: {
        dataset,
        name,
        position
    }
})


/**
 * INSERT ROW operation request body
 */
export const insertRow = (dataset, position) => ({
    type: VIZUAL_OP,
    id: VIZUAL.INSERT_ROW,
    arguments: {
        dataset,
        position
    }
})


/**
 * MOVE COLUMN operation request body
 */
export const moveColumn = (dataset, column, position) => ({
    type: VIZUAL_OP,
    id: VIZUAL.MOVE_COLUMN,
    arguments: {
        dataset,
        column,
        position
    }
})


/**
 * MOVE ROW operation request body
 */
export const moveRow = (dataset, row, position) => ({
    type: VIZUAL_OP,
    id: VIZUAL.MOVE_ROW,
    arguments: {
        dataset,
        row,
        position
    }
})


/**
 * RENAME COLUMN operation request body
 */
export const renameColumn = (dataset, column, name) => ({
    type: VIZUAL_OP,
    id: VIZUAL.RENAME_COLUMN,
    arguments: {
        dataset,
        column,
        name
    }
})


/**
 * SORT A DATASET based on the values int he given column.
 */
export const sortDataset = (dataset, column, sortOrder) => ({
    type: VIZUAL_OP,
    id: VIZUAL.SORT,
    arguments: {
        dataset,
        columns: [{
            columns_column: column,
            columns_order: sortOrder
        }]
    }
})

/**
 * UPDATE CELL operation request body
 */
export const updateCell = (dataset, column, row, value) => ({
	packageId: VIZUAL_OP,
	commandId: VIZUAL.UPDATE_CELL,
    arguments: [
        {id:'dataset',value:dataset},
        {id:'column',value:column},
        {id:'row',value:row},
        {id:'value',value:value}
    ]
})
