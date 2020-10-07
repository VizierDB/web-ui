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

import { HATEOASReferences } from '../util/HATEOAS';


/**
 * Dataset descriptor containing dataset identifier, columns, rowCount and
 * references.
 */
export class DatasetDescriptor {
    constructor(id, name, columns, links) {
        this.id = id;
        this.name = name;
        this.columns = columns;
        this.links = links;
    }
    /**
     * Initialize from a Json object that contains a dataset descriptor returned
     * by the Web API. Note that the name and column information are optional.
     */
    fromJson(json) {
        this.id = json.id;
        this.name = json.name
        this.columns = json.columns;
        this.rowCount = json.rowCount;
        this.links = new HATEOASReferences(json.links);
        return this;
    }
}


/**
 * Handle for dataset that is associated with a workflow module. Contains the
 * columns, rows, dataset name, and references. The dataset annotations are
 * optional.
 */
export class DatasetHandle {
    constructor(id, name, columns, rows, rowCount, offset, links, moduleId=null, properties=null) {
        this.id = id;
        this.name = name;
        this.columns = columns;
        this.rows = rows;
        this.rowCount = rowCount;
        this.offset = offset;
        this.links = links;
        this.moduleId = moduleId;
        this.properties = properties;
    }
    /**
     * Initialize the dataset handle from a Json object returned by the Web API.
     * Note that the dataset name is not expected to be part of the Json object.
     * Dataset annotations are optional.
     */
    fromJson(json) {
        this.id = json.id;
        this.name = json.name;
        this.columns = json.columns;
        this.rows = json.rows;
        this.rowCount = json.rowCount;
        this.offset = json.offset;
        this.links = new HATEOASReferences(json.links);
        this.moduleId = json.moduleId;
        this.properties = json.properties;
        return this;
    }
    hasAnnotations(columnId, rowId) {
    	let roi = this.rows.find((row) => (row.id === rowId));
        return roi && roi.rowAnnotationFlags && (roi.rowAnnotationFlags[columnId] === false);
    }
    /**
     * Get the dataset row at with the given index position. Note that the
     * row index position is not the same as the index in the row array.
     */
    rowAtIndex(index) {
        return this.rows[index];//this.rows.find((row) => (row.index === index));
    }
    /**
     * Create an updated copy of the dataset where annotation information for
     * the given cell has been modified according to whether the cell has
     * annotations or not (as indicated by the given flag).
     */
    updateAnnotations(columnId, rowId, hasAnnotations) {
        // Get the status of the hasAnnotation flag for the previous version
        const hadAnnotations = this.hasAnnotations(columnId, rowId);
        let annotations = null;
        if ((hasAnnotations) && (hadAnnotations)) {
            return this;
        } else if ((!hasAnnotations) && (!hadAnnotations)) {
            return this;
        } else if ((hasAnnotations) && (!hadAnnotations)) {
            // Add annotation idicator for cell
            annotations = this.annotatedCells.slice();
            annotations.push({column: columnId, row: rowId});
        } else if ((!hasAnnotations) && (hadAnnotations)) {
            // Delete annotation
            annotations = [];
            for (let i = 0; i < this.annotatedCells.length; i++) {
                const cell = this.annotatedCells[i];
                if ((cell.column !== columnId) || (cell.row !== rowId)) {
                    annotations.push(cell);
                }
            }
        }
        const {id, name, columns, rows, offset, links, moduleId, properties } = this;
        return new DatasetHandle(id, name, columns, rows, offset, links, annotations, moduleId, properties);
    }

    isProfiled = () => this.properties != null && Object.keys(this.properties).length > 0 && this.properties.is_profiled != null
}
