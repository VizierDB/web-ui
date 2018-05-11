/**
 * Annotation object for a database cell. Contains all annotations for a
 * given cell.
 *
 */
export class CellAnnotation {
    constructor(column, row, content) {
        this.column = column;
        this.row = row;
        this.content = content;
    }
    /**
     * Test if the annotation is for a given column-id, row-id pair.
     */
    isActive(columnId, rowId) {
        return ((this.column === columnId) && (this.row === rowId));
    }
}


export class NoAnnotation {
    constructor(column, row, content) {
        this.column = -1;
        this.row = -1;
    }
    /**
     * Test if the annotation is for a given column-id, row-id pair.
     */
    isActive(columnId, rowId) {
        return false;
    }
}


/**
 * Annotation content indicating that annotations are currently being fetched.
 */
export class IsFetching {
    isFetching() {
        return true;
    }
    isError() {
        return false;
    }
}


/**
 * Annotation content containing an error that occured while fetching
 * annotations.
 */
export class FetchError {
    constructor(title, message) {
        this.title = title;
        this.message = message;
    }
    isFetching() {
        return false;
    }
    isError() {
        return true;
    }
}


/**
 * List of annotation objects. The objects are expected to be (key,value)-pairs.
 */
export class AnnotationList {
    constructor(items) {
        this.items = items;
    }
    isFetching() {
        return false;
    }
    isError() {
        return false;
    }
}
