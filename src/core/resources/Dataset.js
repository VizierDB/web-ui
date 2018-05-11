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
        this.annotations = annotations;
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
        this.annotations = {};
        if (json.annotations) {
            // Convert annotations to associative array with cell columnid_rowid
            for (let i = 0; i < json.annotations.length; i++) {
                const anno = json.annotations[i];
                const key = anno.column + '_' + anno.row;
                this.annotations[key] = anno.types;
            }
        }
        return this;
    }
    /**
     * Returns an object with annotations for the cell with the given column and
     * row identifier. If there are no annotations for the given cell the result
     * is null.
     */
    getAnnotations(columnId, rowId) {
        return this.annotations[columnId + '_' + rowId];
    }
    /**
     * Test if there exist annotations for a given dataset cell
     */
    hasAnnotations(columnId, rowId) {
        return (this.annotations[columnId + '_' + rowId] != null);
    }
}
