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
import { ArtifactDescriptor } from './Artifact';
import { HATEOASReferences } from '../util/HATEOAS';
import {
    OutputChart,
    OutputHtml,
    OutputText,
    OutputMarkdown,
    OutputDataset,
    OutputMultiple,
    OutputJavascript,
    CONTENT_TEXT
} from './Outputs';
import { DatasetHandle } from './Dataset';
import { utc2LocalTime } from '../util/Timestamp';

// Workflow and module states
const STATE_PENDING = 0;
const STATE_RUNNING = 1
const STATE_CANCELED = 2
const STATE_ERROR = 3
const STATE_SUCCESS = 4
const STATE_FROZEN = 5

// Relative positions when inserting a new cell
export const INSERT_AFTER = 'INSERT_AFTER';
export const INSERT_BEFORE = 'INSERT_BEFORE';


/**
 * New cells have a string identifier that contains  unique counter value. Here
 * we assume that modules fetched from the API contain identifier that do not
 * match this pattern (i.e., do not start and end with underlines). As an
 * alternative we could use unique UUID's here.
 */
export const getNewCellId = (id) => ('__' + id + '__');


/**
 * Workflow module handle.
 */
class ModuleHandle {
    fromJson(json, datasets) {
        this.id = json.id;
        this.state = json.state;
        this.command = json.command;
        this.outputs = json.outputs;
        this.datasets = [];
        for (let i = 0; i < json.datasets.length; i++) {
            const { id, name } = json.datasets[i];
            const ds = datasets[id];
            this.datasets.push(
                new DatasetDescriptor(id, name, ds.columns, ds.links)
            );
        }
        this.artifacts = [];
        for (let i = 0; i < json.artifacts.length; i++) {
            const { id, name, objType, category } = json.artifacts[i];
            this.artifacts.push(
                new ArtifactDescriptor(id, name, objType, category, json.links)
            );
        }
        this.charts = json.charts;
        this.text = json.text;
        this.links = new HATEOASReferences(json.links);
        // Convert timestamps to local time
        this.timestamps = {}
        for (var ts in json.timestamps) {
            this.timestamps[ts] = utc2LocalTime(json.timestamps[ts]);
        }
        this.locked = json.locked;
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
            const module = new ModuleHandle().fromJson(
                workflow.modules[i],
                workflow.datasets
            );
            this.cells.push(
                new NotebookCell(
                    module.id,
                    module,
                    workflow.getCommandSpec(module.command),
                    getModuleDefaultOutput(module)
                )
            );
        }
        return this;
    }
    /**
     * Dismiss changes that were made for a given cell. If the cell is a new
     * cell it will be removed from the list of cells. If the cell represents
     * an existing workflow module all changes will be reset.
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
     * Insert a new cell or set an existing cell into edit mode. There are three
     * options here: (1) if cell is null or undefined a new cell is being added
     * to an empty notebook, (2) if cell is defined and position is null or
     * undefined the given cell is being edited, or (3) if cell and position
     * are defined a new cell is inserted at a position relative to the given
     * cell (either before or after).
     */
    editCell(cell, position) {
        if (cell != null) {
            const cellList = [];
            for (let i = 0; i < this.cells.length; i++) {
                const c = this.cells[i];
                if (c.id === cell.id) {
                    // Depending on whether position is defined or not we either
                    // add a new cell (as defined by position) or set the given
                    // cell into edit mode.
                    if (position != null) {
                        const newCell = new NotebookCell(
                            getNewCellId(this.cellCounter)
                        );
                        if (position === INSERT_BEFORE) {
                            cellList.push(newCell);
                            cellList.push(c);
                        } else {
                            cellList.push(c);
                            cellList.push(newCell);
                        }
                    } else {
                        cellList.push(
                            new NotebookCell(
                                c.id,
                                c.module,
                                c.commandSpec,
                                c.output,
                                true
                        ));
                    }
                } else {
                    cellList.push(c);
                }
            }
            return new Notebook(this.workflow, cellList, this.cellCounter + 1);
        } else {
            // I\f the notebook is empty a new cell is added.
            if (this.cells.length === 0) {
                return new Notebook(
                    this.workflow,
                    [new NotebookCell(getNewCellId(this.cellCounter))],
                    this.cellCounter + 1
                );
            }
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
     * Test if the associated workflow has modules that are in an active state.
     */
    hasActiveCells = () => ((this.workflow.state === STATE_PENDING) || (this.workflow.state === STATE_RUNNING));
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
                    new NotebookCell(
                        module.id,
                        module,
                        cell.commandSpec,
                        output
                    )
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
    /**
     * Update the notebook whenever a new version of the associated workflow
     * is received. Replaces the respective modules in notebook cells with
     * their updated counterparts. Returns a new notebook object.
     */
    updateWorkflow(workflow, modifiedCellId, useDefaultOutputs=false) {
        // We iterate over the notebook cells and workflow modules until a
        // difference in the corresponding module ids is encoutered. At that
        // point we append the remaining workflow modules.
        // Any new cell that is encountered before the first difference will
        // also be included in the notebook.
        const modifiedCells = [];
        const size = Math.min(this.cells.length, workflow.modules.length);
        let index = 0;
        while (index < size) {
            const cell = this.cells[index];
            if ((cell.isNewCell()) && (cell.id !== modifiedCellId)) {
                modifiedCells.push(cell);
            } else {
                const module = new ModuleHandle().fromJson(
                    workflow.modules[index],
                    workflow.datasets
                );
                if (cell.id === module.id) {
                    // This is a cell that existed in the previous workflow. If
                    // the modified module identifier is given then we need to
                    // set the cell output to its default value unless we want
                    // to maintain the output states of the notebook cells
                    let outputResource = outputSelector(cell, module, useDefaultOutputs)
                    modifiedCells.push(
                        new NotebookCell(
                            module.id,
                            module,
                            cell.commandSpec,
                            outputResource
                        )
                    );
                    index++;
                } else {
                    // Here is were the differences between the notebook and the
                    // new workflow version starts. All modules from here on
                    // will have new identifier. We append them to the modified
                    // cell list below
                    break;
                }
            }
        }
        // Append all workflow modules that have not been appended yet
        for (let i = index; i < workflow.modules.length; i++) {
            const module = new ModuleHandle().fromJson(
                workflow.modules[i],
                workflow.datasets
            );
            modifiedCells.push(
                new NotebookCell(
                    module.id,
                    module,
                    workflow.getCommandSpec(module.command),
                    getModuleDefaultOutput(module)
                )
            );
        }
        return new Notebook(workflow, modifiedCells, this.cellCounter);
    }
}


/**
 * Each cell in a notebook contains a corresponding workflow module and a cell
 * output resource to keep track of the information that is shown in the cell
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
    /**
     * Test if this cell is in the frozen state.
     */
    isFrozen() {
        if (this.module != null) {
            return this.module.state === STATE_FROZEN
        } else {
            return false
        }
    }
}


// -----------------------------------------------------------------------------
// Helper Methods
// -----------------------------------------------------------------------------
/**
 * Selects the output between the module and cell. useDefaultOutputs =true uses module outputs.
 * the choice between using cell and module outputs during re-rendering helps retain notebook state.
 * the API returns an empty CONTEXT_TEXT (lines=[]) output when processing cells, hence these should
 * be ignored and module output displayed at the end of the execution
 */
const outputSelector = (cell, module, useDefaultOutputs) => {
    let outputResource = cell.output;
    if(useDefaultOutputs || (cell.output.type===CONTENT_TEXT && (!cell.output.lines || cell.output.lines.length===0))){
        outputResource = getModuleDefaultOutput(module);
    }
    return outputResource;
}


/**
 * Get the default output resource for a given module.
 */
const getModuleDefaultOutput = (module) => {
    // Get cell output resource
    const stdout = module.outputs.stdout;
    let outputResource;
    if (stdout.length === 1) {
        // If the output is a chart view it is expected to be the only
        // output element
        const out = stdout[0];
        if (out.type === 'chart/view') {
            outputResource = new OutputChart(out.value.data.name, out.value.result);
        } else if (out.type === 'dataset/view') {
            outputResource = new OutputDataset(new DatasetHandle(out.value.id, out.value.name).fromJson(out.value), false);
        } else if (out.type === 'text/html') {
            outputResource = new OutputHtml(stdout);
        } else if (out.type === 'text/markdown') {
            outputResource = new OutputMarkdown(stdout);
        } else if (out.type === 'text/javascript') {
            outputResource = new OutputJavascript(stdout);
        } else  {
            outputResource = new OutputText(stdout);
        }
    } else if (stdout.length > 1) {
        outputResource = new OutputMultiple(stdout);
    } else { // Make sure that there is some output
        outputResource = new OutputText([]);
    }
    return outputResource;
}
