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
import { LargeMessageButton } from '../../components/Button'
import WorkflowModuleCell from './cell/WorkflowModuleCell';


/**
 * List of cells in a read-only notebook.
 */
class Notebook extends React.Component {
    static propTypes = {
        activeNotebookCell: PropTypes.string,
        notebook: PropTypes.object.isRequired,
        onAddFilteredCommand: PropTypes.func.isRequired,
        onCreateBranch: PropTypes.func.isRequired,
        onDatasetNavigate: PropTypes.func.isRequired,
        onFetchAnnotations: PropTypes.func.isRequired,
        onOutputSelect: PropTypes.func.isRequired,
        onRemoveFilteredCommand: PropTypes.func.isRequired,
        onSelectNotebookCell: PropTypes.func.isRequired,
        userSettings: PropTypes.object.isRequired
    }
    render() {
        const {
            activeNotebookCell,
            notebook,
            onAddFilteredCommand,
            onCreateBranch,
            onDatasetNavigate,
            onOutputSelect,
            onFetchAnnotations,
            onSelectNotebookCell,
            onRemoveFilteredCommand,
            userSettings
        } = this.props;
        // For empty notebooks a message is shown that contains a button to
        // add the first notebook cell.
        if (notebook.cells.length === 0) {
            return (
                <LargeMessageButton
                    message='Your notebook is empty. Start by adding a new cell.'
                    icon='plus'
                    css='notebook-footer'
                    onClick={() => (alert('Add your first cell'))}
                />
            );
        }
        // Create a notebook cell for each workflow module
        const notebookCells = [];
        for (let i = 0; i < notebook.cells.length; i++) {
            const cell = notebook.cells[i];
            notebookCells.push(
                <WorkflowModuleCell
                    key={cell.id}
                    cell={cell}
                    cellNumber={i+1}
                    isActiveCell={cell.id === activeNotebookCell}
                    notebook={notebook}
                    onAddFilteredCommand={onAddFilteredCommand}
                    onCreateBranch={onCreateBranch}
                    onDatasetNavigate={onDatasetNavigate}
                    onOutputSelect={onOutputSelect}
                    onFetchAnnotations={onFetchAnnotations}
                    onRemoveFilteredCommand={onRemoveFilteredCommand}
                    onSelect={onSelectNotebookCell}
                    userSettings={userSettings}
                />
            );
        }
        // Show a message button to append a new cell (only if the last cell
        // is not already a new cell and the workflow is not in error state).
        let appendCellButton = null;
        const lastCell = notebook.lastCell();
        if ((!lastCell.isNewCell()) && (!lastCell.isErrorOrCanceled())) {
            appendCellButton = (
                <div className='spinner-padding-md'>
                    <Icon
                        size='big'
                        link
                        name='plus'
                        onClick={() => (alert('Append'))}
                        title='Append new cell'
                     />
                </div>
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
