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
import { Icon } from 'semantic-ui-react';
import { LargeMessageButton } from '../Button'
import NotebookCell from './NotebookCell';
import { INSERT_AFTER } from '../../resources/Notebook'

/**
 * List of cells in a read-only notebook.
 */
class Notebook extends React.Component {
    static propTypes = {
        activeNotebookCell: PropTypes.string,
        apiEngine: PropTypes.object.isRequired,
        notebook: PropTypes.object.isRequired,
        onAddFilteredCommand: PropTypes.func.isRequired,
        onCancelExec: PropTypes.func.isRequired,
        onCheckStatus: PropTypes.func.isRequired,
        onCopyCell: PropTypes.func.isRequired,
        onCreateBranch: PropTypes.func.isRequired,
        onDatasetNavigate: PropTypes.func.isRequired,
        onDeleteCell: PropTypes.func.isRequired,
        onDismissCell: PropTypes.func.isRequired,
        onFetchAnnotations: PropTypes.func.isRequired,
        onInsertCell: PropTypes.func.isRequired,
        onOutputSelect: PropTypes.func.isRequired,
        onRemoveFilteredCommand: PropTypes.func.isRequired,
        onSubmitCell: PropTypes.func.isRequired,
        onSelectNotebookCell: PropTypes.func.isRequired,
        userSettings: PropTypes.object.isRequired,
        onEditSpreadsheet: PropTypes.func.isRequired
    }
    /**
     * Append a new cell to the current notebook.
     */
    handleAppendCell = () => {
        const { notebook, onInsertCell } = this.props;
        // If the notebook is empty both parameters are null.
        if (notebook.isEmpty()) {
            onInsertCell();
        } else {
            onInsertCell(notebook.lastCell().module, INSERT_AFTER);
        }
    }
    render() {
        const {
            activeNotebookCell,
            apiEngine,
            notebook,
            onAddFilteredCommand,
            onCancelExec,
            onCheckStatus,
            onCopyCell,
            onCreateBranch,
            onDatasetNavigate,
            onDeleteCell,
            onDismissCell,
            onFetchAnnotations,
            onInsertCell,
            onOutputSelect,
            onRemoveFilteredCommand,
            onSelectNotebookCell,
            onSubmitCell,
            userSettings,
            onEditSpreadsheet
        } = this.props;
        // For empty notebooks a message is shown that contains a button to
        // add the first notebook cell.
        if (notebook.cells.length === 0) {
            return (
                <LargeMessageButton
                    message='Your notebook is empty.'
                    icon='plus'
                    css='notebook-footer'
                    caption='Start by adding a Load Dataset Cell'
                    captionIcon='arrow up'
                    onClick={this.handleAppendCell}
                />
            );
        }
        // Create a notebook cell for each workflow module
        const notebookCells = [];
        // Counter for notebook cells that contain a workflow module
        let moduleCount = 1;
        let isNewPrevious = false;
        let hasActiveCell = false;
        let datasets = [];
        for (let i = 0; i < notebook.cells.length; i++) {
            const cell = notebook.cells[i];
            let isNewNext = false;
            if (i < notebook.cells.length - 1) {
                isNewNext = notebook.cells[i + 1].isNewCell();
            }
            // The first active cell will receive the onCancel callback to
            // trigger the rendering of a cancel button.
            let onCancelCallback = null;
            if (cell.isActive()) {
                if (!hasActiveCell) {
                    onCancelCallback = onCancelExec;
                }
                hasActiveCell = true;
            }
            // In an active notebook only the last cell will have a submit
            // handler if it is a new cell.
            let submitHandler = null;
            if (notebook.hasActiveCells()) {
                if ((cell.isNewCell()) && (i === notebook.cells.length - 1)) {
                    submitHandler = onSubmitCell;
                }
            } else {
                submitHandler = onSubmitCell;
            }
            // The cell number depends on whether the cell is a new cell or
            // a cell for a workflow module.
            notebookCells.push(
                <NotebookCell
                    key={cell.id}
                    apiEngine={apiEngine}
                    cell={cell}
                    cellNumber={moduleCount}
                    datasets={datasets}
                    isActiveCell={cell.id === activeNotebookCell}
                    isNewNext={isNewNext}
                    isNewPrevious={isNewPrevious}
                    notebook={notebook}
                    onAddFilteredCommand={onAddFilteredCommand}
                    onCancelExec={onCancelCallback}
                    onCheckStatus={onCheckStatus}
                    onCopyCell={onCopyCell}
                    onCreateBranch={onCreateBranch}
                    onDatasetNavigate={onDatasetNavigate}
                    onDeleteCell={onDeleteCell}
                    onDismissCell={onDismissCell}
                    onInsertCell={onInsertCell}
                    onOutputSelect={onOutputSelect}
                    onFetchAnnotations={onFetchAnnotations}
                    onRemoveFilteredCommand={onRemoveFilteredCommand}
                    onSelect={onSelectNotebookCell}
                    onSubmitCell={submitHandler}
                    userSettings={userSettings}
                    onEditSpreadsheet={onEditSpreadsheet}
                />
            );
            if (!cell.isNewCell()) {
                moduleCount++;
                datasets = cell.module.datasets;
            }
            isNewPrevious = cell.isNewCell();
        }
        // Show a message button to append a new cell (only if the last cell
        // is not already a new cell and the workflow is not in error state
        // or read only).
        let appendCellButton = null;
        const lastCell = notebook.lastCell();
        if ((!lastCell.isNewCell()) && (!lastCell.isErrorOrCanceled()) && (!notebook.readOnly)) {
            appendCellButton = (
                <table className='cell'><tbody>
                    <tr>
                        <td className='cell-index'></td>
                        <td className='cell-button'>
                        <Icon
                            size='big'
                            link
                            name='plus'
                            onClick={this.handleAppendCell}
                            title='Append new cell'
                         />
                        </td>
                    </tr>
                </tbody></table>
            );
        }
        // Reverse the notebook cells if flag is true
        let content = null;
        if (userSettings.showNotebookReversed()) {
            notebookCells.reverse();
            content = (
                <div>
                    { appendCellButton }
                    { notebookCells }
                </div>
            );
        } else {
            content = (
                <div>
                    { notebookCells }
                    { appendCellButton }
                </div>
            );
        }
        return content;
    }
}

export default Notebook;
