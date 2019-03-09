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

import { DatasetDescriptor } from './Dataset';
import { HATEOASReferences } from '../util/HATEOAS';
import { utc2LocalTime } from '../util/Timestamp';


// -----------------------------------------------------------------------------
// Cell Output
// -----------------------------------------------------------------------------

// Output cell resource type identifier
export const CONTENT_CHART = 'CONTENT_CHART';
export const CONTENT_DATASET = 'CONTENT_DATASET';
export const CONTENT_ERROR = 'CONTENT_ERROR';
export const CONTENT_HTML = 'CONTENT_HTML';
export const CONTENT_HIDE = 'CONTENT_HIDE';
export const CONTENT_TEXT = 'CONTENT_TEXT';
export const CONTENT_TIMESTAMPS = 'CONTENT_TIMESTAMPS';

/**
 * Output resource content. Contains functionality to determine content type
 * and whether the content is currently being fetched from the server.
 */
class OutputResource {
    constructor(type, isFetching) {
        this.type = type;
        this.isFetching = (isFetching != null) ? isFetching : false;
    }
    isChart = () => (this.type === CONTENT_CHART);
    isDataset = () => (this.type === CONTENT_DATASET);
    isError = () => (this.type === CONTENT_ERROR);
    isHidden = () => (this.type === CONTENT_HIDE);
    isHtml = () => (this.type === CONTENT_HTML);
    isText = () => (this.type === CONTENT_TEXT);
    isTimestamps = () => (this.type === CONTENT_TIMESTAMPS);
}

// Extended output resources for the different types of output.


/**
 * Output resource for showing a chart plotted for a given dataset in a
 * notebook cell.
 */
export class OutputChart extends OutputResource {
    constructor(name, dataset, isFetching) {
        super(CONTENT_CHART, isFetching);
        this.name = name;
        this.dataset = dataset;
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputChart(this.name, this.dataset, true);
    }
}


/**
 * Output resource for showing dataset rows in a notebook cell
 */
export class OutputDataset extends OutputResource {
    constructor(dataset, isFetching) {
        super(CONTENT_DATASET, isFetching);
        this.dataset = dataset;
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputDataset(this.dataset, true);
    }
}


/**
 * Output resource for showing an error message resulting from a content
 * fetch error.
 */
export class OutputError extends OutputResource {
    constructor(error, isFetching) {
        super(CONTENT_ERROR, isFetching);
        this.error = error;
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputError(this.error, true);
    }
}


/**
 * Output resource when hiding output for a notebook cell.
 */
export class OutputHidden extends OutputResource {
    constructor(isFetching) {
        super(CONTENT_HIDE, isFetching);
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputHidden(true);
    }
}


/**
 * Output resource for showing content of the module standard output as HTML
 * in the output area of a notebook cell.
 */
export class OutputHtml extends OutputResource {
    constructor(outputObjects, isFetching) {
        super(CONTENT_HTML, isFetching);
        this.lines  = [];
        for (let j = 0; j < outputObjects.length; j++) {
            const out = outputObjects[j];
            if (out.type != null) {
                if (out.type === 'text/html') {
                    this.lines.push(out.value);
                }
            } else {
                this.lines.push(out);
            }
        }
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputHtml(this.lines, true);
    }
}


/**
 * Output resource for showing content of the module standard output as plain
 * text in the output area of a notebook cell.
 */
export class OutputText extends OutputResource {
    constructor(outputObjects, isFetching) {
        super(CONTENT_TEXT, isFetching);
        this.lines  = [];
        for (let j = 0; j < outputObjects.length; j++) {
            const out = outputObjects[j];
            if (out.type != null) {
                if (out.type === 'text/plain') {
                    this.lines.push(out.value);
                }
            } else {
                this.lines.push(out);
            }
        }
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputText(this.lines, true);
    }
}


/**
 * Output resource for showing the timestamps for different stages of module
 * execution in the output area of a notebook cell.
 */
export class OutputTimestamps extends OutputResource {
    constructor(createdAt, startedAt, finishedAt) {
        super(CONTENT_TIMESTAMPS);
        this.createdAt = createdAt;
        this.startedAt = startedAt;
        this.finishedAt = finishedAt;
    }
    /**
     * Return a copy of the resource where the isFetching flag is true.
     */
    setFetching() {
        return new OutputTimestamps(
            this.createdAt,
            this.startedAt,
            this.finishedAt,
            true
        );
    }
}

// Shortcut to show text output for all lines in standard output. Depending on
// whether the output is plai/text of html a different output resource is
// returned.
export const StandardOutput = (module) => {
    const stdout = module.outputs.stdout;
    let outputResource = null;
    if (stdout.length === 1) {
        // If the output is a chart view it is expected to be the only
        // output element
        const out = stdout[0];
        if (out.type === 'text/html') {
            outputResource = new OutputHtml(stdout);
        } else  {
            outputResource = new OutputText(stdout);
        }
    } else {
        outputResource = new OutputText(stdout);
    }
    // Make sure that there is some output
    if (outputResource === null) {
        outputResource = new OutputText([]);
    }
    return outputResource;
}


// -----------------------------------------------------------------------------
// Notebook
// -----------------------------------------------------------------------------

// Workflow and module states
const STATE_PENDING = 0;
const STATE_RUNNING = 1
const STATE_CANCELED = 2
const STATE_ERROR = 3
const STATE_SUCCESS = 4


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
                    outputResource = new OutputChart(out.value.data.name, out.value.result);
                } else if (out.type === 'text/html') {
                    outputResource = new OutputHtml(stdout);
                } else  {
                    outputResource = new OutputText(stdout);
                }
            } else {
                outputResource = new OutputText(stdout);
            }
            // Make sure that there is some output
            if (outputResource === null) {
                outputResource = new OutputText([]);
            }
            this.cells.push(new NotebookCell(module, commandSpec, outputResource));
        }
        return this;
    }
    /**
     * Get a descriptor for the dataset with the given name in the given module.
     */
    getDatasetForModule(module, name) {
        // Find the dataset name to identifier mapping in the dataset list in
        // the module state
        const datasetId = module.datasets.find((ds) => (ds.name === name)).id;
        // Create a new descriptor from the dataset that has the given dataset
        // name
        const ds = this.datasets[datasetId];
        return new DatasetDescriptor(datasetId, name, ds.columns, ds.links);
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
    replaceOutput(moduleId, output) {
        // Modified list of notebook cells
        const modifiedCells = [];
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if (cell.module.id === moduleId) {
                modifiedCells.push(
                    new NotebookCell(cell.module, cell.commandSpec, output));
            } else {
                modifiedCells.push(cell);
            }
        }
        return new Notebook(this.workflow, modifiedCells);
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
                        cell.output.setFetching()
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
    constructor(module, commandSpec, output) {
        this.id = module.id;
        this.module = module;
        this.commandSpec = commandSpec;
        this.output = output;
    }
    /**
     * Get the value of the language property for ccode cells.
     */
    getCodeLanguage() {
        return this.commandSpec.parameters[0].language;
    }
    /**
     * Test if the state of the associated module is canceled.
     */
    isCanceled() {
        if (this.module != null) {
            return this.module.state === STATE_CANCELED;
        } else {
            return false;
        }
    }
    /**
     * Test if the command that is associated with the module contains script
     * code (e.g., Python code, SQL, Scala code). The code language can be
     * retrieved using the .getCodeLanguage() method.
     */
    isCodeCell() {
        if (this.commandSpec.parameters.length === 1) {
            return this.commandSpec.parameters[0].datatype === 'code';
        }
        return false;
    }
    /**
     * Test if the associated workflow module is in error state.
     */
    isError() {
        if (this.module != null) {
            return this.module.state === STATE_ERROR
        } else {
            return false;
        }
    }
    /**
     * Test if the associated workflow module is in error or canceled state.
     */
    isErrorOrCanceled = () => (this.isCanceled() || this.isError());
    /**
     * Test if this object represents a new cell in the notebook. A new cell
     * does not have a workflow module associated with it.
     */
    isNewCell = () => (this.module == null);
    /**
     * Test if the associated workflow module is in pending state.
     */
    isPending() {
        if (this.module != null) {
            return this.module.state === STATE_PENDING
        } else {
            return false;
        }
    }
    /**
     * Test if the associated workflow module is in running state.
     */
    isRunning() {
        if (this.module != null) {
            return this.module.state === STATE_RUNNING
        } else {
            return false;
        }
    }
    /**
     * Test if the associated workflow module is in success state.
     */
    isSuccess() {
        if (this.module != null) {
            return this.module.state === STATE_SUCCESS
        } else {
            return false;
        }
    }
}
