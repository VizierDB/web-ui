/**
 * Collection of definitions and helper methods to submit Vizual operstions.
 */

/**
 * Vizual operation identifier
 */
export const VIZUAL_OP = 'vizual'

export const DELETE_COLUMN = 'DELETE_COLUMN'
export const DELETE_ROW = 'DELETE_ROW'
export const INSERT_COLUMN = 'INSERT_COLUMN'
export const INSERT_ROW = 'INSERT_ROW'
export const LOAD = 'LOAD'
export const MOVE_COLUMN = 'MOVE_COLUMN'
export const MOVE_ROW = 'MOVE_ROW'
export const RENAME_COLUMN = 'RENAME_COLUMN'
export const UPDATE_CELL = 'UPDATE_CELL'


/**
 * DELETE COLUMN operation request body
 */
export const deleteColumn = (dataset, column) => ({
    type: VIZUAL_OP,
    id: DELETE_COLUMN,
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
    id: DELETE_ROW,
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
    id: INSERT_COLUMN,
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
    id: INSERT_ROW,
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
    id: MOVE_COLUMN,
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
    id: MOVE_ROW,
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
    id: RENAME_COLUMN,
    arguments: {
        dataset,
        column,
        name
    }
})

/**
 * UPDATE CELL operation request body
 */
export const updateCell = (dataset, column, row, value) => ({
    type: VIZUAL_OP,
    id: UPDATE_CELL,
    arguments: {
        dataset,
        column,
        row,
        value
    }
})
