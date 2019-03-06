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
import { isError, isErrorOrCanceled } from './Workflow';
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
 * Output resource content. Contains functionality to determine content type
 * and whether the content is currently being fetched from the server.
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

/**
 * Extended output resources for the different types of output.
 */
export const OutputChart = (name, dataset) => (new OutputResource(CONTENT_CHART, {name, dataset}, false));

export const OutputDataset = (name, dataset) => (new OutputResource(CONTENT_DATASET, {name, dataset}, false));

export const OutputError = (error) => (new OutputResource(CONTENT_ERROR, error, false));

export const OutputFetching = (output) => (new OutputResource(output.type, output.content, true));

export const OutputText = (outputObjects) => {
    const lines  = [];
    for (let j = 0; j < outputObjects.length; j++) {
        const out = outputObjects[j];
        if (out.type === 'text/plain') {
            lines.push(out.value);
        }
    }
    return new OutputResource(CONTENT_TEXT, {lines}, false);
};

export const OutputHtml = (outputObjects) => {
    const lines  = [];
    for (let j = 0; j < outputObjects.length; j++) {
        const out = outputObjects[j];
        if (out.type === 'text/html') {
            lines.push(out.value);
        }
    }
    return new OutputResource(CONTENT_HTML, {lines}, false);
};

export const StandardOutput = (module) => {
    const stdout = module.outputs.stdout;
    let outputResource = null;
    if (stdout.length === 1) {
        // If the output is a chart view it is expected to be the only
        // output element
        const out = stdout[0];
        if (out.type === 'text/html') {
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
    return outputResource;
}


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
        this.charts = json.charts;
        this.text = json.text;
        this.links = new HATEOASReferences(json.links);
        // Convert timestamps to local time
        this.timestamps = {}
        for (var ts in json.timestamps) {
            this.timestamps[ts] = utc2LocalTime(json.timestamps[ts]);
        }
        return this;
    }
}


/**
 * A notebook resource is a list of cells. Each cell corresponds to a module
 * in an underlying workflow. In addition to the workflow module each cell in
 * the notebook has an output resource. This resource is shown in the output
 * area when the notebook cell is rendered.
 */
export class Notebook {
    constructor(workflow, cells) {
        this.workflow = workflow;
        this.cells = cells;
        // Set a few shortcuts
        this.id = workflow.id;
        this.createdAt = workflow.createdAt;
        this.readOnly = workflow.readOnly;
        this.datasets = workflow.datasets;
    }
    /**
     * Create a notebook resource from a given workflow handle.
     */
    fromWorkflow(workflow) {
        // Create notebook cells from list of of workflow modules returned by
        // the API
        this.cells = [];
        for (let i = 0; i < workflow.modules.length; i++) {
            const module = new ModuleHandle().fromJson(workflow.modules[i]);
            const commandSpec = workflow.getCommandSpec(module.command);
            // Get cell output resource
            const stdout = module.outputs.stdout;
            let outputResource = null;
            if (stdout.length === 1) {
                // If the output is a chart view it is expected to be the only
                // output element
                const out = stdout[0];
                if (out.type === 'chart/view') {
                    outputResource = OutputChart(out.value.data.name, out.value.result);
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
            this.cells.push(new NotebookCell(module, commandSpec, outputResource));
        }
        return this;
    }
    /**
     * Test if a notebook is empty.
     */
    isEmpty() {
        return this.cells.length === 0;
    }
    /**
     * Shortcut to access the last cell in the notebook.
     */
    lastCell() {
        if (this.cells.length > 0) {
            return this.cells[this.cells.length - 1];
        } else {
            return null;
        }

    }
    /**
     * Replace the output in the cell that represents the workflow module with
     * the given identifier. Returns a modified copy of this notebook.
     */
    replaceOutput(moduleId, outputResource) {
        // Modified list of notebook cells
        const modifiedCells = [];
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if (cell.module.id === moduleId) {
                modifiedCells.push(
                    new NotebookCell(
                        cell.module,
                        cell.commandSpec,
                        outputResource,
                        cell.annotationObject
                ));
            } else {
                modifiedCells.push(cell);
            }
        }
        return new Notebook(this.workflow, modifiedCells);
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
        const modifiedCells = [];
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if (cell.module.id === moduleId) {
                modifiedCells.push(
                    new NotebookCell(
                        cell.module,
                        cell.commandSpec,
                        OutputFetching(cell.output),
                        cell.annotationObject
                    )
                );
            } else {
                modifiedCells.push(cell);
            }
        }
        return new Notebook(this.workflow, modifiedCells);
    }
}


/**
 * Each cell in a notebook contains a corresponding workflow module and a cell
 * output resource to kkep track of the information that is shown in the cell
 * output area.
 */
class NotebookCell {
    constructor(module, commandSpec, output, annotationObject) {
        this.id = module.id;
        this.module = module;
        this.commandSpec = commandSpec;
        this.output = output;
        if (annotationObject != null) {
            this.activeDatasetCell = annotationObject
        } else {
            this.activeDatasetCell = new NoAnnotation();
        }

    }
    /**
     * Get the value of the language property for ccode cells.
     */
    getCodeLanguage() {
        return this.commandSpec.parameters[0].language;
    }
    /**
     * Test if the command that is associated with the module contains script
     * code (e.g., Python code, SQL, Scala code). The code language can be
     * retrieved using the .getCodeLanguage() method.
     */
    isCode() {
        if (this.commandSpec.parameters.length === 1) {
            return this.commandSpec.parameters[0].datatype === 'code';
        }
        return false;
    }
    /**
     * Test if the module is in error state.
     */
    isError() {
        return isError(this.module.state);
    }
    /**
     * Test if the module is in error or canceled state.
     */
    isErrorOrCanceled() {
        return isErrorOrCanceled(this.module.state);
    }
}
