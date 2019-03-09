/**
 * Copyright (C) 2018-2019 New York University
 *                         University at Buffalo,
 *                         Illinois Institute of Technology.
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
import { OutputChart, OutputHtml, OutputText } from './Outputs';
import { utc2LocalTime } from '../util/Timestamp';


// Workflow and module states
const STATE_PENDING = 0;
const STATE_RUNNING = 1
const STATE_CANCELED = 2
const STATE_ERROR = 3
const STATE_SUCCESS = 4

// Relative positions when inserting a new cell
export const INSERT_AFTER = 'INSERT_AFTER';
export const INSERT_BEFORE = 'INSERT_BEFORE';


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
 *
 * Each notebook maintains a counter for for new cells to generate unique cell
 * identifier.
 */
export class Notebook {
    constructor(workflow, cells, cellCounter) {
        this.workflow = workflow;
        this.cells = cells;
        this.cellCounter = (cellCounter != null) ? cellCounter : 0;
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
            this.cells.push(
                new NotebookCell(module.id, module, commandSpec, outputResource)
            );
        }
        return this;
    }
    /**
     * Dismiss changes that were made for a given cell. If the cell is a new
     * cell it will be removed from the list of cells. If the cell represents
     * an existing workflow module all changes will be reset..
     */
    dismissChangesForCell(cellId) {
        const cellList = [];
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if (cell.id === cellId) {
                if (!cell.isNewCell()) {
                    cellList.push(cell);
                }
            } else {
                cellList.push(cell);
            }
        }
        return new Notebook(this.workflow, cellList, this.cellCounter);
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
     * Insert a new cell into the notebook. The position of the new cell is relative
     * to the given cell (either before or after). If cell is null the new cell is
     * being added to an empty notebook.
     */
    insertNewCell(cell, position) {
        const newCell = new NotebookCell('__' + this.cellCounter + '__');
        if (cell != null) {
            const cellList = [];
            for (let i = 0; i < this.cells.length; i++) {
                const c = this.cells[i];
                if (c.id === cell.id) {
                    if (position === INSERT_BEFORE) {
                        cellList.push(newCell);
                        cellList.push(c);
                    } else {
                        cellList.push(c);
                        cellList.push(newCell);
                    }
                } else {
                    cellList.push(c);
                }
            }
            return new Notebook(this.workflow, cellList, this.cellCounter + 1);
        } else {
            if (this.cells.length === 0) {
                const cell = newCell
                return new Notebook(this.workflow, [cell], this.cellCounter + 1);
            }
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
    replaceOutput(moduleId, output) {
        // Modified list of notebook cells
        const modifiedCells = [];
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            const module = cell.module;
            if ((module != null) && (module.id === moduleId)) {
                modifiedCells.push(
                    new NotebookCell(module.id, module, cell.commandSpec, output)
                );
            } else {
                modifiedCells.push(cell);
            }
        }
        return new Notebook(this.workflow, modifiedCells, this.cellCounter);
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
            const module = cell.module;
            if ((module != null) && (module.id === moduleId)) {
                modifiedCells.push(
                    new NotebookCell(
                        module.id,
                        module,
                        cell.commandSpec,
                        cell.output.setFetching()
                    )
                );
            } else {
                modifiedCells.push(cell);
            }
        }
        return new Notebook(this.workflow, modifiedCells, this.cellCounter);
    }
}


/**
 * Each cell in a notebook contains a corresponding workflow module and a cell
 * output resource to kkep track of the information that is shown in the cell
 * output area.
 */
class NotebookCell {
    constructor(id, module, commandSpec, output) {
        this.id = id;
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
     * Test if the associated workflow module is in an active state.
     */
    isActive = () => (this.isPending() || this.isRunning());
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
