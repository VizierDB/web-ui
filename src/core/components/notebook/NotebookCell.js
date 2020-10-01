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
import CellCommandArea from './input/CellCommandArea';
import CellDropDownMenu from './CellDropDownMenu';
import CellOutputArea from './output/CellOutputArea';
import { TextButton } from '../Button';
import { INSERT_AFTER, INSERT_BEFORE } from '../../resources/Notebook';
import '../../../css/App.css';
import '../../../css/Notebook.css';
import ProgressContext from  '../ProgressContext'


/**
 * Cell in a notebook. The cell may either represent an existing module in a
 * workflow or a new notebook cell. For cells that contain a workflow module
 * the redered components include the cell index, an optional cell menu,
 * the cell command area and the cell output area.
 *
 * Depending on whether the associated notebook cell is in edit mode or not
 * the command area will display the command text or a command input form.
 *
 * For new cells a cell index '*' is shown together with the module input
 * form. There is no output area for new cells.
 *
 * The notebook cell does not receive a onSubmitCell callback if the notebook is
 * active and the cell is not a cell that is appended after the active cell.
 * In this case modification of the underlying workflow is not possible and
 * submissions should be blocked.
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
        onCancelExec: PropTypes.func,
        onCheckStatus: PropTypes.func,
        onCopyCell: PropTypes.func.isRequired,
        onCreateBranch: PropTypes.func.isRequired,
        onDatasetNavigate: PropTypes.func.isRequired,
        onDeleteCell: PropTypes.func.isRequired,
        onDismissCell: PropTypes.func.isRequired,
        onInsertCell: PropTypes.func.isRequired,
        onOutputSelect: PropTypes.func.isRequired,
        onFetchAnnotations: PropTypes.func.isRequired,
        onRemoveFilteredCommand: PropTypes.func.isRequired,
        onSelect: PropTypes.func.isRequired,
        onSubmitCell: PropTypes.func,
        userSettings: PropTypes.object.isRequired,
        onEditSpreadsheet: PropTypes.func.isRequired,
        onRecommendAction: PropTypes.func.isRequired,
        onResetRecommendations: PropTypes.func.isRequired
    }
    handleUpdateProgress = p => {
        this.setState({moduleProgress: p})
    };

    state = {
        moduleProgress: 0,
        onUpdateProgress: this.onUpdateProgress
    };
    /**
     * Add the command that is associated with this notebook cell module
     * to the list of hidden commands.
     */
    handleAddFilteredCommand = () => {
        const { cell, onAddFilteredCommand } = this.props;
        onAddFilteredCommand(cell.commandSpec);
    }
    /**
     * Copy the associated cell to the clipboard in the user settings.
     */
    handleCopyCell = () => {
        const { cell, onCopyCell } = this.props;
        onCopyCell(cell);
    }
    /**
     * Event handler when the user clicks the menu item to create a new branch
     * up until the module in this cell.
     */
    handleCreateBranch = () => {
        const { cell, onCreateBranch } = this.props;
        onCreateBranch(cell.module);
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
     * Delete the associated cell from the notebook.
     */
    handleDeleteCell = () => {
        const { cell, onDeleteCell } = this.props;
        onDeleteCell(cell);
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
    handleSelectCell = () => {
        const { cell, isActiveCell, onSelect } = this.props;
        if ((!isActiveCell) && (!cell.isActive())) {
            onSelect(cell);
        }
    }
    /**
     * Handle new cell recommendations
     */
    handleRecommendAction = (packageId, commandId) => {
        const { cell, onRecommendAction } = this.props;
        onRecommendAction(packageId, commandId, cell);
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
            onCancelExec,
            onCheckStatus,
            onDismissCell,
            onFetchAnnotations,
            onOutputSelect,
            onSubmitCell,
            userSettings,
            onEditSpreadsheet,
            onResetRecommendations
        } = this.props;
        // The main components of a notebook cell are the cell index, the cell
        // dropdown menu, the cell command text or input form and the cell
        // output area.
        let cellIndex = null;
        let cellMenu = null;
        let outputArea = null;
        // For a cell that contains a new workflow module only the module input
        // for is being displayed.
        if (cell.isNewCell()) {
            cellIndex = '*';
        } else {
            // Check if the command that is associated with the cell is filtered
            // by the user settings. If the command is filtered we either return
            // a collapsed cell or null depending on the hide filtered cells
            // property. If a cell is active it is shown always for the user to
            // know which (and how many) cells are still executing.
            const cmdSpec = cell.commandSpec;
            if ((!cell.isActive()) && (userSettings.isFiltered(cmdSpec))) {
                let errorcss = '';
                let errorIcon = null;
                if (cell.isErrorOrCanceled()) {
                    errorcss = ' collapsed-error-cell';
                    if (cell.isCanceled()) {
                        errorIcon = (<Icon name='cancel' color='red' title='Canceled'/>);
                    } else if (cell.isError()) {
                        errorIcon = (<Icon name='warning circle' color='red' title='Error' />);
                    }

                }
                if (!userSettings.hideFilteredCommands()) {
                    return (
                        <div className={'horizontal-divider' + errorcss} >
                            { errorIcon }
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
            cellIndex = cellNumber;
            // The isNewNext and isNewPrevious flags need to be swapped if the
            // notebook is currently being shown in reverse order
            let isNewNextFlag = isNewNext;
            let isNewPreviousFlag = isNewPrevious;
            if (userSettings.showNotebookReversed()) {
                isNewNextFlag = isNewPrevious;
                isNewPreviousFlag = isNewNext
            }
            cellMenu = (
                <CellDropDownMenu
                    cell={cell}
                    cellNumber={cellNumber}
                    isActiveCell={isActiveCell}
                    isNewNext={isNewNextFlag}
                    isNewPrevious={isNewPreviousFlag}
                    notebook={notebook}
                    onAddFilteredCommand={this.handleAddFilteredCommand}
                    onCopyCell={this.handleCopyCell}
                    onCreateBranch={this.handleCreateBranch}
                    onDeleteCell={this.handleDeleteCell}
                    onInsertCell={this.handleInsertCell}
                    onSelectCell={this.handleSelectCell}
                />
            );
            outputArea = (
                <CellOutputArea
                    cell={cell}
                    datasets={notebook.datasets}
                    onCancelExec={onCancelExec}
                    onCheckStatus={onCheckStatus}
                    onFetchAnnotations={onFetchAnnotations}
                    onNavigateDataset={this.handleDatasetNavigate}
                    onOutputSelect={onOutputSelect}
                    onSelectCell={this.handleSelectCell}
                    userSettings={userSettings}
                    onEditSpreadsheet={onEditSpreadsheet}
                    onRecommendAction={this.handleRecommendAction}
                    apiEngine={apiEngine}
                />
            );
        }
        const commandText = (
            <CellCommandArea
                apiEngine={apiEngine}
                datasets={datasets}
                cell={cell}
                isActiveCell={(isActiveCell) && (!notebook.readOnly)}
                onClick={this.handleSelectCell}
                onDismiss={onDismissCell}
                onSelectCell={this.handleSelectCell}
                onSubmit={onSubmitCell}
                userSettings={userSettings}
                onResetRecommendations={onResetRecommendations}
                onUpdateProgress={this.handleUpdateProgress}
            />
        );
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
            <ProgressContext.Provider value={this.state}>
                <table className={css + cssState}><tbody>
                <tr>
                    <td className={'cell-index' + cssState} onClick={this.handleSelectCell}>
                        <p className={'cell-index' + cssState}>[{cellIndex}]</p>
                        { cellMenu }
                    </td>
                    <td className={'cell-area' + cssState}>
                        { commandText }
                        { outputArea }
                    </td>
                </tr>
                </tbody></table>
            </ProgressContext.Provider>
        );
    }
}

export default NotebookCell;
