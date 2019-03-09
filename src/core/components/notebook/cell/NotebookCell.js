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
import CellCommandText from './CellCommandText';
import CellDropDownMenu from './CellDropDownMenu';
import CellOutputArea from './CellOutputArea';
import ModuleInputArea from '../input/ModuleInputArea';
import { TextButton } from '../../Button';
import { INSERT_AFTER, INSERT_BEFORE } from '../../../resources/Notebook';
import '../../../../css/App.css';
import '../../../../css/Notebook.css';


/**
 * Cell in a notebook. The cell may either represent an existing module in a
 * workflow or a new notebook cell. For cells that contain a workflow module
 * the redered components include the cell index, an optional cell menu,
 * the cell command text or the module input form and the cell output area.
 *
 * For new cells an empty cell index is shown together with the module input
 * form.
 */
class NotebookCell extends React.Component {
    static propTypes = {
        apiEngine: PropTypes.object.isRequired,
        cell: PropTypes.object.isRequired,
        cellNumber: PropTypes.number.isRequired,
        datasets: PropTypes.array.isRequired,
        isActiveCell: PropTypes.bool.isRequired,
        isNewNext: PropTypes.bool.isRequired,
        isNewPrevious: PropTypes.bool.isRequired,
        notebook: PropTypes.object.isRequired,
        onAddFilteredCommand: PropTypes.func.isRequired,
        onCreateBranch: PropTypes.func.isRequired,
        onDatasetNavigate: PropTypes.func.isRequired,
        onDismissCell: PropTypes.func.isRequired,
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
    /**
     * Submit action to insert a new notebook cell relative to this cell.
     *
     * We need to adjust the given position based on the current setting for
     * notebook cell order.
     */
    handleInsertCell = (direction) => {
        const { cell, onInsertCell, userSettings } = this.props;
        if (userSettings.showNotebookReversed()) {
            if (direction === INSERT_AFTER) {
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
            apiEngine,
            cell,
            cellNumber,
            datasets,
            isActiveCell,
            isNewNext,
            isNewPrevious,
            notebook,
            onDismissCell,
            onOutputSelect,
            onFetchAnnotations,
            userSettings
        } = this.props;
        // The main components of a notebook cell are the cell index, the cell
        // dropdown menu, the cell command text or input form and the cell
        // output area.
        let cellIndex = null;
        let cellMenu = null;
        let commandText = null;
        let outputArea = null;
        // For a cell that contains a new workflow module only the module input
        // for is being displayed.
        if (cell.isNewCell()) {
            cellIndex = ' ';
            commandText = (
                <ModuleInputArea
                    apiEngine={apiEngine}
                    datasets={datasets}
                    cell={cell}
                    onDismiss={onDismissCell}
                    onSubmit={() => (alert('Submit'))}
                />);
        } else {
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
            cellIndex = cellNumber;
            cellMenu = (
                <CellDropDownMenu
                    cell={cell}
                    cellNumber={cellNumber}
                    isActiveCell={isActiveCell}
                    isNewNext={isNewNext}
                    isNewPrevious={isNewPrevious}
                    notebook={notebook}
                    onAddFilteredCommand={this.handleAddFilteredCommand}
                    onCreateBranch={this.handleCreateBranch}
                    onInsertCell={this.handleInsertCell}
                    onOutputSelect={onOutputSelect}
                />
            );
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
            commandText = (
                <CellCommandText
                    cell={cell}
                    onClick={this.handleSelect}
                    onDoubleClick={onDefaultAction}
                />
            );
        }
        // The CSS class depends on whether the cell is active or not and
        // on the cell status
        const css = (isActiveCell) ? 'cell active-cell' : 'cell inactive-cell';
        // Add style for cells that are not in success state
        let cssState = '';
        if (cell.isErrorOrCanceled()) {
            cssState = ' error-cell';
        } else if (cell.isRunning()) {
            cssState = ' running-cell';
        } else if (cell.isPending()) {
            cssState = ' pending-cell';
        }
        return (
            <table className={css + cssState}><tbody>
                <tr>
                    <td className={'cell-index' + cssState} onClick={this.handleSelect}>
                        <p className={'cell-index' + cssState}>[{cellIndex}]</p>
                        { cellMenu }
                    </td>
                    <td className={'cell-area' + cssState}>
                        { commandText }
                        { outputArea }
                    </td>
                </tr>
            </tbody></table>
        );
    }
}

export default NotebookCell;
