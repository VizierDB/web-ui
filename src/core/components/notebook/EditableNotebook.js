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

import React from 'react';
import { PropTypes } from 'prop-types';
import { EmptyCell, GroupCell, ModuleCell, ReadOnlyCell } from './cell/CellFactory';
import { GRP_SHOW } from '../../resources/Notebook';
import '../../../css/Notebook.css';


/**
 * List of cells in an editable notebook.
 */
class EditableNotebook extends React.Component {
    static propTypes = {
        groupMode: PropTypes.number.isRequired,
        isEmptyNotebook: PropTypes.bool.isRequired,
        notebook: PropTypes.object.isRequired,
        project: PropTypes.object.isRequired,
        reversed: PropTypes.bool.isRequired,
        workflow: PropTypes.object.isRequired,
        onChangeGrouping: PropTypes.func.isRequired,
        onCreateBranch: PropTypes.func.isRequired,
        onDeleteModule: PropTypes.func.isRequired,
        onInsertModule: PropTypes.func.isRequired,
        onNavigateDataset: PropTypes.func.isRequired,
        onOutputSelect: PropTypes.func.isRequired,
        onReplaceModule: PropTypes.func.isRequired,
        onShowAnnotations: PropTypes.func.isRequired
    }
    render() {
        const { groupMode, notebook, project, reversed } = this.props;
        // List of rendered cells in the notebook. Initialize with new cell
        // placeholder at start of notebook.
        const notebookCells = [];
        notebookCells.push(EmptyCell(this.props, [], -1));
        // Keep track of the datasets that are available to each cell.
        let datasets = [];
        // Keep track of the error state of a notebook cell. All cells that
        // come after a cell with error in the notebook sequence are also in
        // error state.
        let errorState = false;
        let wasErrorState = errorState;
        // Keep a list of grouped cells. Output them when a non-grouped cell is
        // encountered in the sequence or when the end of the cell list is
        // reached.
        let groupedCells = [];
        for (let i = 0; i < notebook.cells.length; i++) {
            const cell = notebook.cells[i];
            // Update the error state if the current cell has errors. Here we
            // need to keep track of the previous error state to allow the
            // cell that caused the error to be editable.
            wasErrorState = errorState;
            errorState = cell.hasError() ? true : errorState;
            // If the cell belongs to the type of cells that are grouped we
            // simply add it to the array.
            const isGrouped = (groupMode !== GRP_SHOW) && (project.isGrouped(cell.module));
            if (isGrouped) {
                groupedCells.push(cell);
            } else {
                // We will add at least one cell to the notebook. First, we need
                // to check if there are any previously grouped cells that
                // have not been added yet.
                if (groupedCells.length > 0) {
                    notebookCells.push(GroupCell(this.props, groupedCells, wasErrorState, i));
                    groupedCells = [];
                    // Add an empty cell after the cell group (if not in error
                    // state). The index of the cell is i-1 because it appears
                    // after all the grouped cells but before the cell that we
                    // are going to add.
                    if (!errorState) {
                        notebookCells.push(EmptyCell(this.props, datasets, i - 1));
                    }
                }
                // If we are in an error state we only add read-only cells.
                if ((wasErrorState) && (errorState)) {
                    notebookCells.push(ReadOnlyCell(this.props, cell, errorState, i));
                } else {
                    notebookCells.push(ModuleCell(this.props, cell, datasets, i));
                }
            }
            // Make sure to keep track of the datasets in any case.
            datasets = cell.module.datasets;
            // Only if the cell was not added to a group and we are not in an
            // error state then we will add an empty cell following the added
            // cell.
            if ((!errorState) && (!isGrouped)) {
                notebookCells.push(EmptyCell(this.props, datasets, i));
            }
        }
        // Make sure to append any grouped cells that have not been added to the
        // notebook yey.
        if (groupedCells.length > 0) {
            notebookCells.push(GroupCell(this.props, groupedCells, wasErrorState, notebook.cells.length));
            // Add empty cell at the end.
            if (!errorState) {
                notebookCells.push(EmptyCell(this.props, datasets, notebook.cells.length));
            }
        }
        // Reverse the notebook cells if flag is true
        if (reversed) {
            notebookCells.reverse();
        }
        return (
            <div>
                {notebookCells}
            </div>
        );
    }
}

export default EditableNotebook;
