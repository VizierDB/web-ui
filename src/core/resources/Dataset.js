import { HATEOASReferences } from '../util/HATEOAS';


/**
 * Dataset descriptor containing dataset identifier, name, and links. The list
 * of columns is optional.
 */
export class DatasetDescriptor {
    constructor(id, name, columns, links) {
        this.id = id;
        this.name = name;
        this.columns = columns;
        this.links = links;
    }
    /**
     * Initialize from a Json object that contains a WorkflowResource returned
     * by the Web API. Note that the name and column information are optional.
     */
    fromJson(json, name) {
        this.id = json.id;
        this.links = new HATEOASReferences(json.links);
        if (json.name) {
            this.name = json.name;
        }
        if (json.columns) {
            this.columns = json.columns;
        }
        return this;
    }
}


/**
 * Handle for dataset that is associated with a workflow module. Contains the
 * columns, rows, dataset name, and references. The dataset annotations are
 * optional.
 */
export class DatasetHandle {
    constructor(id, name, columns, rows, offset, links, annotations) {
        this.id = id;
        this.name = name;
        this.columns = columns;
        this.rows = rows;
        this.offset = offset;
        this.links = links;
        this.annotatedCells = annotations;
    }
    /**
     * Initialize the dataset handle from a Json object returned by the Web API.
     * Note that the dataset name is not expected to be part of the Json object.
     * Dataset annotations are optional.
     */
    fromJson(json) {
        this.id = json.id;
        this.columns = json.columns;
        this.rows = json.rows;
        this.offset = json.offset;
        this.links = new HATEOASReferences(json.links);
        if (json.annotatedCells) {
            this.annotatedCells = json.annotatedCells;
        } else {
            this.annotatedCells = [];
        }
        return this;
    }
    /**
     * Test if there exist annotations for a given dataset cell
     */
    hasAnnotations(columnId, rowId) {
        const cell = this.annotatedCells.find(
            (anno) => ((anno.column === columnId) && (anno.row === rowId))
        );
        return (cell != null);
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
        const {id, name, columns, rows, offset, links } = this;
        return new DatasetHandle(id, name, columns, rows, offset, links, annotations);
    }
}
