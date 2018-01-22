/**
 * Collection of classes, components, and functions to interact with the Vizier
 * DB Web service API.
 */

export const DEFAULT_BRANCH = 'master'


// -----------------------------------------------------------------------------
// Classes
// -----------------------------------------------------------------------------

/**
 * Create a dictionary of HATEOAS references.
 */
export class HATEOASReferences {
    constructor(links) {
        for (let i = 0; i < links.length; i++) {
            const ref = links[i]
            this[ref.rel] = ref.href
        }
        this.links = links;
    }
}

/**
 * Branch descriptor containing branch name and references.
 */
export class BranchDescriptor {
    constructor(json) {
        this.id = json.id
        this.name = getProperty(json, 'name', 'undefined')
        this.links = new HATEOASReferences(json.links)
    }
}

/**
 * Dataset descriptor containing dataset name and references.
 */
export class DatasetDescriptor {
    constructor(json) {
        this.name = json.name
        this.links = new HATEOASReferences(json.links)
    }
}

/**
 * Handle for dataset that is associated with a workflow module. Contains the
 * columns, rows, dataset name, and references
 */
export class DatasetHandle {
    constructor(json, name) {
        this.name = name
        this.columns = json.columns
        this.rows = json.rows
        if (json.annotations) {
            this.annotations = json.annotations.cells
        } else {
            this.annotations = []
        }
        this.links = new HATEOASReferences(json.links)
    }
    /**
     * Returns true if there exists an annotation for the cell with the given
     * column and row identifier.
     */
    hasCellAnnotation(columnId, rowId) {
        const anno = this.annotations.find(anno => ((anno.column === columnId) && (anno.row === rowId)))
        if (anno) {
            return true
        }
        return false
    }
    /**
     * Returns the first annotation for the cell with the given column and row
     * identifier. Assumes that hasCellAnnotation is true for the given cell.
     * TODO: (1) Check that annotations for the cell exist; (2) return the full
     * list of cell annotations; (3) set annotation title based on value of
     * anno.key.
     */
    getCellAnnotation(columnId, rowId) {
        const anno = this.annotations.find(anno => ((anno.column === columnId) && (anno.row === rowId))).annotations[0]
        return {title: 'Mimir Reason', text: anno.value}
    }
}

/**
 * Organize the set of supported modules. Uses the concatenation of module type
 * and id as a unique key. Groups modules by type.
 */
export class ModuleRegistry {
    constructor(commands) {
        this.module = []
        this.modules = []
        this.types = new Set()
        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i]
            this.module[moduleIdentifier(cmd)] = cmd
            if (this.types.has(cmd.type)) {
                this.modules[cmd.type].push(cmd)
            } else {
                this.modules[cmd.type] = [cmd]
                this.types.add(cmd.type)
            }
        }
    }
}

/**
 * Workflow descriptor containing references.
 */
export class WorkflowHandle {
    constructor(json) {
        this.branch = json.branch
        this.version = json.version
        this.modules = json.modules
        this.links = new HATEOASReferences(json.links)
        this.datasets = []
        if ((!this.hasError()) && (this.modules.length > 0)) {
            const lastModule = this.modules[this.modules.length - 1]
            for (let i = 0; i < lastModule.datasets.length; i++) {
                this.datasets.push(new DatasetDescriptor(lastModule.datasets[i]))
            }
        }
    }
    hasError() {
        for (let i = 0; i < this.modules.length; i++) {
            if (this.modules[i].stderr.length > 0) {
                return true
            }
        }
        return false
    }
}


// -----------------------------------------------------------------------------
// Helper Methods
// -----------------------------------------------------------------------------

/**
 * Generic function to create a new resource at the Web service via HTTP POST
 * request. Expects at least two callback functions (successHandler and
 * errorHandler) that will be called respectively when the resource was
 * retrieved successfully or in case of an error. The optional
 * signalStartHandler will be called before the request is being made.
 */
export const createResource = (url, data, successHandler, errorHandler, signalStartHandler) => (dispatch) => {
    return postResourceData(dispatch, url, data, successHandler, errorHandler, signalStartHandler)
}

/**
 * Generic function to delete a resource from the Web service. Expects at
 * least two callback functions (successHandler and errorHandler) that will be
 * called respectively when the resource was deleted successfully or in case
 * of an error. The optional signalStartHandler will be called before the
 * attempt to fetch the resource is being made.
 *
 * There are no arguments that are being passed to the success handler because
 * Vizier DB API DELETE requests to not return any content.
 *
 * If the resource does not exists no error will be displayed. Instead, the
 * success handler is called.
 */
export const deleteResource = (url, successHandler, errorHandler, signalStartHandler) => (dispatch) => {
    // Signal start if callback handle is given
    if (signalStartHandler) {
        dispatch(signalStartHandler())
    }
    return fetch(url, {method: 'DELETE'})
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status === 204 || response.status === 404) {
                // SUCCESS: Pass the JSON result to the respective callback
                // handler
                dispatch(successHandler());
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                response.json().then(json => dispatch(errorHandler(json.message)));
            }
        })
        .catch(err => dispatch(errorHandler(err.message)))
}

/**
 * Generic function to retrieve a resource from the Web service. Expects at
 * least two callback functions (successHandler and errorHandler) that will be
 * called respectively when the resource was retrieved successfully or in case
 * of an error. The optional signalStartHandler will be called before the
 * attempt to fetch the resource is being made.
 */
export const fetchResource = (url, successHandler, errorHandler, signalStartHandler) => (dispatch) => {
    // Signal start if callback handle is given
    if (signalStartHandler) {
        dispatch(signalStartHandler())
    }
    return fetch(url)
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: Pass the JSON result to the respective callback
                // handler
                response.json().then(json => dispatch(successHandler(json)));
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                response.json().then(json => dispatch(errorHandler(json.message)));
            }
        })
        .catch(err => dispatch(errorHandler(err.message)))
}

/**
 * Get the value for a resource property with given key. If no property with
 * given key exists the defaultValue will be returned.
 */
export const getProperty = (object, key, defaultValue) => {
    // Get dictionary value for key 'name'
    let property = object.properties.find(prop => (prop.key === key));
    if (property) {
        return property.value;
    } else {
        return defaultValue;
    }
};

/**
 * Use the combination of module type and type-dependent module identifier as
 * a unique module identifier.
 */
export const moduleIdentifier = (module) => (module.type + ':' + module.id)

/**
 * Generic function to update a property of a resource at the Web service via
 * HTTP POST request. Expects at least two callback functions (successHandler
 * and errorHandler) that will be called respectively when the resource was
 * updated successfully or in case of an error. The optional signalStartHandler
 * will be called before the request is being made.
 *
 * The property key cannot be null. If the new property value is null, the
 * property will be deleted.
 */
 export const updateResourceProperty = (url, key, value, successHandler, errorHandler, signalStartHandler) => (dispatch) => {
    let updStmt = {'key': key}
    if (value !== null) {
        updStmt['value'] = value
    }
    return postResourceData(dispatch, url, {'properties': [updStmt]}, successHandler, errorHandler, signalStartHandler)
}

/**
 * Generic function to create or update a resource at the Web service via HTTP
 * POST request. Expects at least two callback functions (successHandler and
 * errorHandler) that will be called respectively when the resource was
 * created or updated successfully or in case of an error. The optional
 * signalStartHandler will be called before the request is being made.
 */
export const postResourceData = (dispatch, url, data, successHandler, errorHandler, signalStartHandler) => {
    // Signal start if callback handle is given
    if (signalStartHandler) {
        dispatch(signalStartHandler())
    }
    return fetch(
            url,
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
            }
        )
        // Check the response. Assume that eveything is all right if status
        // code below 400
        .then(function(response) {
            if (response.status >= 200 && response.status < 400) {
                // SUCCESS: Pass the JSON result to the respective callback
                // handler
                response.json().then(json => dispatch(successHandler(json)));
            } else {
                // ERROR: The API is expected to return a JSON object in case
                // of an error that contains an error message
                response.json().then(json => dispatch(errorHandler(json.message)));
            }
        })
        .catch(err => dispatch(errorHandler(err.message)))
}

/**
 * Update a resource at the Vizier DB Web API by posting a Json object. Expects
 * at least two callback functions (successHandler and errorHandler) that will
 * be called respectively when the resource was updated successfully or in case
 * of an error. The optional signalStartHandler will be called before the
 * request is being made.
 */
export const updateResource = (url, data, successHandler, errorHandler, signalStartHandler) => (dispatch) => {
    return postResourceData(dispatch, url, data, successHandler, errorHandler, signalStartHandler)
}
