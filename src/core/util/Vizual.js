/**
 * Collection of definitions and helper methods to submit Vizual operstions.
 */

/**
 * Vizual operation identifier
 */

export const VIZUAL = {
    DELETE_COLUMN: 'DELETE_COLUMN',
    DELETE_ROW: 'DELETE_ROW',
    INSERT_COLUMN: 'INSERT_COLUMN',
    INSERT_ROW: 'INSERT_ROW',
    LOAD: 'LOAD',
    MOVE_COLUMN: 'MOVE_COLUMN',
    MOVE_ROW: 'MOVE_ROW',
    RENAME_COLUMN: 'RENAME_COLUMN',
    UPDATE_CELL: 'UPDATE_CELL'
}

export const VIZUAL_OP = 'vizual';

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
 * UPDATE CELL operation request body
 */
export const updateCell = (dataset, column, row, value) => ({
    type: VIZUAL_OP,
    id: VIZUAL.UPDATE_CELL,
    arguments: {
        dataset,
        column,
        row,
        value
    }
})
