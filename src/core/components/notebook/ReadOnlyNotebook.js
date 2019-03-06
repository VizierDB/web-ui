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
import { GroupCell, ReadOnlyCell } from './cell/CellFactory';
import { GRP_SHOW } from '../../resources/Notebook';
import '../../../css/Notebook.css';

/**
 * List of cells in a read-only notebook.
 */
class ReadOnlyNotebook extends React.Component {
    static propTypes = {
        groupMode: PropTypes.number.isRequired,
        notebook: PropTypes.object.isRequired,
        project: PropTypes.object.isRequired,
        reversed: PropTypes.bool.isRequired,
        workflow: PropTypes.object.isRequired,
        onChangeGrouping: PropTypes.func.isRequired,
        onCreateBranch: PropTypes.func.isRequired,
        onNavigateDataset: PropTypes.func.isRequired,
        onOutputSelect: PropTypes.func.isRequired,
        onShowAnnotations: PropTypes.func.isRequired
    }
    render() {
        const { groupMode, notebook, project, reversed } = this.props;
        // List of rendered cells in the notebook
        const notebookCells = [];
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
            errorState = cell.isError() ? true : errorState;
            if ((groupMode !== GRP_SHOW) && (project.isGrouped(cell.module))) {
                groupedCells.push(cell);
            } else {
                // Output grouped cells first (if any)
                if (groupedCells.length > 0) {
                    notebookCells.push(GroupCell(this.props, groupedCells, errorState, i));
                    groupedCells = [];
                }
                notebookCells.push(ReadOnlyCell(this.props, cell, errorState, i));
            }
        }
        if (groupedCells.length > 0) {
            notebookCells.push(GroupCell(this.props, groupedCells, wasErrorState, notebook.cells.length));
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

export default ReadOnlyNotebook;
