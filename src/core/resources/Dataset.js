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
        if (json.annotations) {
            this.annotations = json.annotations;
        }
        return this;
    }
    /**
     * Returns an object with annotations for the cell with the given column and
     * row identifier. If there are no annotations for the given cell the result
     * is null.
     */
    getCellAnnotations(columnId, rowId) {
        if (this.annotations == null) {
            return null;
        }
        const annoList = this.annotations.find(
            anno => ((anno.column === columnId) && (anno.row === rowId))
        )
        if (annoList) {
            const anno = {}
            for (let i = 0; i < annoList.annotations.length; i++) {
                const kvp = annoList.annotations[i]
                anno[kvp.key] = kvp.value
            }
            return anno
        } else {
            return null
        }
    }
}
