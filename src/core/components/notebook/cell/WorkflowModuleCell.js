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
import { Button } from 'semantic-ui-react';
import CellCommandText from './CellCommandText';
import CellDropDownMenu from './CellDropDownMenu';
import CellOutputArea from './CellOutputArea';
import ContentSpinner from '../../ContentSpinner';
import { TextButton } from '../../Button';
import TimestampOutput from './TimestampOutput';
import { INSERT_AFTER, INSERT_BEFORE } from '../../../resources/Notebook';
import '../../../../css/App.css';
import '../../../../css/Notebook.css';


/**
 * Cell in a notebook for an existing module in a curation workflow. Displays
 * the cell index, cell command text or module input form and the cell output
 * area.
 */
class WorkflowModuleCell extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        cellNumber: PropTypes.number.isRequired,
        isActiveCell: PropTypes.bool.isRequired,
        notebook: PropTypes.object.isRequired,
        onAddFilteredCommand: PropTypes.func.isRequired,
        onCreateBranch: PropTypes.func.isRequired,
        onDatasetNavigate: PropTypes.func.isRequired,
        onInsertCell: PropTypes.func.isRequired,
        onOutputSelect: PropTypes.func.isRequired,
        onFetchAnnotations: PropTypes.func.isRequired,
        onRemoveFilteredCommand: PropTypes.func.isRequired,
        onSelect: PropTypes.func.isRequired,
        userSettings: PropTypes.object.isRequired
    }
    /**
     * Add the command that is associated with this notebook cell module
     * to the list of hidden commands.
     */
    handleAddFilteredCommand = () => {
        const { cell, onAddFilteredCommand } = this.props;
        onAddFilteredCommand(cell.commandSpec);
    }
    /**
     * Event handler when the user clicks the menu item to create a new branch
     * up until the module in this cell.
     */
    handleCreateBranch = () => {
        const { cell, onCreateBranch } = this.props;
        onCreateBranch(cell.module);
    }
    handleEditCell = () => {
        alert('Edit')
    }
    /**
     * Scroll to the given positions in the given dataset that is being
     * displayed in the output area of the cell.
     */
    handleDatasetNavigate = (dataset, offset, limit) => {
        const { cell, onDatasetNavigate } = this.props;
        onDatasetNavigate(cell.module, dataset, offset, limit);
    }
    handleInsertCell = (direction) => {
        const { cell, onInsertCell, userSettings } = this.props;
        if (userSettings.showNotebookReversed()) {
            if (direction == INSERT_AFTER) {
                onInsertCell(cell, INSERT_BEFORE);
            } else {
                onInsertCell(cell, INSERT_AFTER);
            }
        } else {
            onInsertCell(cell, direction);
        }
    }
    /**
     * Remove the command that is associated with this notebook cell module
     * from the list of hidden commands.
     */
    handleRemoveFilteredCommand = () => {
        const { cell, onRemoveFilteredCommand } = this.props;
        onRemoveFilteredCommand(cell.commandSpec);
    }
    /**
     * Set this cell as the active notebook cell. Only if the cell is inactive
     * at the moment.
     */
    handleSelect = () => {
        const { cell, isActiveCell, onSelect } = this.props;
        if ((!isActiveCell) && (!cell.isActive())) {
            onSelect(cell);
        }
    }
    render() {
        const {
            cell,
            cellNumber,
            isActiveCell,
            notebook,
            onOutputSelect,
            onFetchAnnotations,
            userSettings
        } = this.props;
        // Check if the command that is associated with the cell is filtered
        // by the user settings. If the command is filtered we either return
        // a collapsed cell or null depending on the hide filtered cells
        // property.
        const cmdSpec = cell.commandSpec;
        if (userSettings.isFiltered(cmdSpec)) {
            if (!userSettings.hideFilteredCommands()) {
                return (
                    <div className='horizontal-divider'>
                        <TextButton
                            css='code-text'
                            text={cmdSpec.name}
                            title='Show cells of this type'
                            onClick={this.handleRemoveFilteredCommand}
                        />
                    </div>
                );
            } else {
                return null;
            }
        }
        // The default action when the user double clicks on the cell command
        // depends on whether the notebook is read-only or not. For read-only
        // notebooks 'Create branch' is the default option. Otherwise it is
        // 'Edit cell'.
        let onDefaultAction = null;
        if (notebook.readOnly) {
            onDefaultAction = this.handleCreateBranch;
        } else {
            onDefaultAction = this.handleEditCell;
        }
        // If this is the active cell the cell menu is shown and the CSS style
        // is changed.
        let css = 'cell';
        if (isActiveCell) {
            css += ' active-cell';
        } else {
            css += ' inactive-cell';
        }
        const cellMenu = (
            <CellDropDownMenu
                cell={cell}
                cellNumber={cellNumber}
                isActiveCell={isActiveCell}
                notebook={notebook}
                onAddFilteredCommand={this.handleAddFilteredCommand}
                onCreateBranch={this.handleCreateBranch}
                onInsertCell={this.handleInsertCell}
                onOutputSelect={onOutputSelect}
            />
        );
        // Add style for cells that are not in success state
        let cssState = '';
        if (cell.isErrorOrCanceled()) {
            cssState = ' error-cell';
        } else if (cell.isRunning()) {
            cssState = ' running-cell';
        } else if (cell.isPending()) {
            cssState = ' pending-cell';
        }
        // The output area depends on whether the cell is running or not
        let outputArea = null;
        if (cell.isRunning()) {
            outputArea = (
                <div>
                    <div className='module-timings'>
                        <TimestampOutput label='Created at' time={cell.module.timestamps.createdAt} />
                        <TimestampOutput label='Started at' time={cell.module.timestamps.startedAt} />
                    </div>
                    <ContentSpinner text='Running ...' size='small' />
                    <div className='centered'>
                        <Button negative>Cancel</Button>
                    </div>
                </div>
            );
        } else if (cell.isPending()) {
            outputArea = (
                <div>
                    <div className='module-timings'>
                        <TimestampOutput label='Created at' time={cell.module.timestamps.createdAt} />
                    </div>
                </div>
            );
        } else {
            outputArea = (
                <CellOutputArea
                    cell={cell}
                    onNavigateDataset={this.handleDatasetNavigate}
                    onOutputSelect={onOutputSelect}
                    onFetchAnnotations={onFetchAnnotations}
                    onTextOutputClick={this.handleSelect}
                    userSettings={userSettings}
                />
            );
        }
        return (
            <table className={css + cssState}><tbody>
                <tr>
                    <td className={'cell-index' + cssState} onClick={this.handleSelect}>
                        <p className={'cell-index' + cssState}>[{cellNumber}]</p>
                        { cellMenu }
                    </td>
                    <td className={'cell-area' + cssState}>
                        <CellCommandText
                            cell={cell}
                            onClick={this.handleSelect}
                            onDoubleClick={onDefaultAction}
                        />
                        { outputArea }
                    </td>
                </tr>
            </tbody></table>
        );
    }
}

export default WorkflowModuleCell;