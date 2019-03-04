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

import { NoAnnotation } from './Annotation';
import { ChartDescriptor } from './Chart';
import { DatasetDescriptor } from './Dataset';
import { isError } from './Workflow';
import { HATEOASReferences } from '../util/HATEOAS';
import { sortByName } from '../util/Sort';
import { utc2LocalTime } from '../util/Timestamp';


// -----------------------------------------------------------------------------
// Cell Output
// -----------------------------------------------------------------------------

// Output cell resource type identifier
export const CONTENT_CHART = 'CONTENT_CHART'
export const CONTENT_DATASET = 'CONTENT_DATASET'
export const CONTENT_ERROR = 'CONTENT_ERROR'
export const CONTENT_TEXT = 'CONTENT_TEXT'
export const CONTENT_HTML = 'CONTENT_HTML'

/**
 * Output resource content. Contains functionality to determine content type.
 */
class OutputResource {
    constructor(type, content, isFetching) {
        this.type = type;
        this.content = content;
        this.isFetching = isFetching;
    }
    isChart = () => (this.type === CONTENT_CHART);
    isDataset = () => (this.type === CONTENT_DATASET);
    isError = () => (this.type === CONTENT_ERROR);
    isText = () => (this.type === CONTENT_TEXT);
    isHtml = () => (this.type === CONTENT_HTML);
}

export const OutputChart = (name, dataset) => (new OutputResource(CONTENT_CHART, {name, dataset}, false));
export const OutputDataset = (name, dataset) => (new OutputResource(CONTENT_DATASET, {name, dataset}, false));
export const OutputError = (error) => (new OutputResource(CONTENT_ERROR, error, false));
export const OutputFetching = (output) => (new OutputResource(output.type, output.content, true));
export const OutputText = (outputObjects) => {
    const lines  = [];
    for (let j = 0; j < outputObjects.length; j++) {
        const out = outputObjects[j];
        if (out.type === 'text/plain') {
            lines.push(out.data);
        }
    }
    return new OutputResource(CONTENT_TEXT, {lines}, false);
};
export const OutputHtml = (outputObjects) => {
    const lines  = [];
    for (let j = 0; j < outputObjects.length; j++) {
        const out = outputObjects[j];
        if (out.type === 'text/html') {
            lines.push(out.data);
        }
    }
    return new OutputResource(CONTENT_HTML, {lines}, false);
};


// -----------------------------------------------------------------------------
// Notebook
// -----------------------------------------------------------------------------

// Cell grouping mode states
export const GRP_COLLAPSE = 1;
export const GRP_HIDE = 2;
export const GRP_SHOW = 0;
export const GRP_UNDEFINED = -1;


/**
 * Workflow module handle.
 */
class ModuleHandle {
    fromJson(json) {
        this.id = json.id;
        this.state = json.state;
        this.command = json.command;
        this.outputs = json.outputs;
        this.datasets = json.datasets;
        this.views = [];
        this.text = json.text;
        this.links = new HATEOASReferences(json.links);
        // Convert timestamps to local time
        this.timestamps = {}
        for (var ts in json.timestamps) {
            this.timestamps[ts] = utc2LocalTime(json.timestamps[ts]);
        }
        return this;
    }
    isError() {
        return isError(this.state);
    }
}


/**
 * A notebook resource is a list of cells. Each cell corresponds to a module
 * in an underlying workflow. In addition to the workflow module each cell in
 * the notebook has an output resource. This resource is shown in the output
 * area when the notebook cell is rendered.
 */
export class Notebook {
    constructor(workflow) {
        this.id = workflow.id;
        this.readOnly = workflow.readOnly;
        // Create notebook cells from list of of workflow modules returned by
        // the API
        this.cells = [];
        for (let i = 0; i < workflow.modules.length; i++) {
            const module = new ModuleHandle().fromJson(workflow.modules[i]);
            // Get cell output resource
            const stdout = module.outputs.stdout;
            let outputResource = null;
            if (stdout.length === 1) {
                // If the output is a chart view it is expected to be the only
                // output element
                const out = stdout[0];
                if (out.type === 'chart/view') {
                    outputResource = OutputChart(out.data.name, out.result);
                } else if (out.type === 'text/html') {
                    outputResource = OutputHtml(stdout);
                } else  {
                    outputResource = OutputText(stdout);
                }
            } else {
                outputResource = OutputText(stdout);
            }
            // Make sure that there is some output
            if (outputResource === null) {
                outputResource = OutputText([]);
            }
            this.cells.push(new NotebookCell(module, outputResource));
        }
        // Set shortcut to access the last cell in the notebook
        if (this.cells.length > 0) {
            this.lastCell = this.cells[this.cells.length - 1];
        } else {
            this.lastCell = null;
        }
    }
    /**
     * Test if a notebook is empty.
     */
    isEmpty() {
        return this.cells.length === 0;
    }
    /**
     * Replace the output in the cell that represents the workflow module with
     * the given identifier. Returns a modified copy of this notebook.
     */
    replaceOutput(moduleId, outputResource) {
        // Modified list of notebook cells
        const modCells = [];
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if (cell.module.id === moduleId) {
                modCells.push(new NotebookCell(cell.module, outputResource));
            } else {
                modCells.push(cell);
            }
        }
        return new Notebook(modCells);
    }
    showAnnotations(moduleId, annotation) {
        // Modified list of notebook cells
        const modCells = [];
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if (cell.module.id === moduleId) {
                modCells.push(new NotebookCell(cell.module, cell.output, annotation));
            } else {
                modCells.push(cell);
            }
        }
        return new Notebook(modCells);
    }
    /**
     * Set the isFetching flag in the notebook cell that that contains the
     * module with the given id. Returns a modified copy of the notebook.
     */
    setFetching(moduleId) {
        // Modified list of notebook cells
        const modCells = [];
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if (cell.module.id === moduleId) {
                modCells.push(
                    new NotebookCell(
                        cell.module,
                        new OutputFetching(cell.output)
                    )
                );
            } else {
                modCells.push(cell);
            }
        }
        return new Notebook(modCells);
    }
}


/**
 * Each cell in a notebook contains a corresponding workflow module and a cell
 * output resource to kkep track of the information that is shown in the cell
 * output area.
 */
class NotebookCell {
    constructor(module, output, annotationObject) {
        this.id = module.id;
        this.module = module;
        this.output = output;
        if (annotationObject != null) {
            this.activeDatasetCell = annotationObject
        } else {
            this.activeDatasetCell = new NoAnnotation();
        }

    }
    hasError() {
        if (this.module != null) {
            return this.module.outputs.stderr.length > 0;
        }
    }
}
