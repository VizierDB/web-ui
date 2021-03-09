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
    DELETE_COLUMN: 'deleteColumn',
    DELETE_ROW: 'deleteRow',
    DROP_DATASET: 'dropDataset',
    INSERT_COLUMN: 'insertColumn',
    INSERT_ROW: 'insertRow',
    LOAD: 'load',
    MOVE_COLUMN: 'moveColumn',
    MOVE_ROW: 'moveRow',
    PROJECTION: 'projection',
    RENAME_COLUMN: 'renameColumn',
    RENAME_DATASET: 'renameDataset',
    SORT: 'sortDataset',
    UPDATE_CELL: 'updateCell'
}

export const VIZUAL_OP = 'vizual';

// Sort orders
export const SORT = {
    ASC: 'asc',
    DESC: 'desc'
}


/**
 * DELETE COLUMN operation request body
 */
export const deleteColumn = (dataset, column) => ({
	packageId: VIZUAL_OP,
	commandId: VIZUAL.DELETE_COLUMN,
	arguments: [
    	{id:'dataset',value:dataset},
    	{id:'column',value:column}
    ]
})


/**
 * DELETE ROW operation request body
 */
export const deleteRow = (dataset, row) => ({
	packageId: VIZUAL_OP,
	commandId: VIZUAL.DELETE_ROW,
	arguments: [
    	{id:'dataset',value:dataset},
    	{id:'row',value:row}
    ]
})


/**
 * INSERT COLUMN operation request body
 */
export const insertColumn = (dataset, name, position) => ({
	packageId: VIZUAL_OP,
	commandId: VIZUAL.INSERT_COLUMN,
	arguments: [
    	{id:'dataset',value:dataset},
    	{id:'name',value:name},
    	{id:'position',value:position}
    ]
})


/**
 * INSERT ROW operation request body
 */
export const insertRow = (dataset, position) => ({
	packageId: VIZUAL_OP,
	commandId: VIZUAL.INSERT_ROW,
	arguments: [
    	{id:'dataset',value:dataset},
    	{id:'position',value:position}
    ]
})


/**
 * MOVE COLUMN operation request body
 */
export const moveColumn = (dataset, column, position) => ({
	packageId: VIZUAL_OP,
	commandId: VIZUAL.MOVE_COLUMN,
	arguments: [
    	{id:'dataset',value:dataset},
    	{id:'column',value:column},
    	{id:'position',value:position}
    ]
})


/**
 * MOVE ROW operation request body
 */
export const moveRow = (dataset, row, position) => ({
	packageId: VIZUAL_OP,
	commandId: VIZUAL.MOVE_ROW,
	arguments: [
    	{id:'dataset',value:dataset},
    	{id:'row',value:row},
    	{id:'position',value:position}
    ]
})


/**
 * RENAME COLUMN operation request body
 */
export const renameColumn = (dataset, column, name) => ({
	packageId: VIZUAL_OP,
	commandId: VIZUAL.RENAME_COLUMN,
    arguments: [
    	{id:'dataset',value:dataset},
        {id:'column',value:column},
        {id:'name',value:name}
    ]
})


/**
 * SORT A DATASET based on the values int he given column.
 */
export const sortDataset = (dataset, column, sortOrder) => ({
	packageId: VIZUAL_OP,
	commandId: VIZUAL.SORT,
    arguments: [
    	{id:'dataset',value:dataset},
        {id:'columns',value:[
            [
                {id:'columns_column',value:column},
                {id:'columns_order',value:sortOrder}
            ]
        ]}
    ]
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

export const updateAnnotation = (dataset, column, new_value, row_id) => ({
	packageId:'mimir',
	commandId:'comment',
	arguments: [
		{id:'dataset',value:dataset.name},
		{id:'comments',value: [
				[
					{id:'expression',value:dataset.columns[column].id},
					{id:'comment',value:new_value},
					{id:'rowid',value:row_id}
				]
			]
		},
	    {id: "materializeInput", value: false}
	]
})
