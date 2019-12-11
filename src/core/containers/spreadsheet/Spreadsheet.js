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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import { Dimmer, Icon, Loader } from 'semantic-ui-react';
import { insertNotebookCell, updateNotebookCellWithUpload } from '../../actions/project/Notebook';
import {
    clearAnnotations, deleteAnnotations, fetchAnnotations, showSpreadsheet,
    submitUpdate, updateAnnotations
} from '../../actions/project/Spreadsheet';
import { CloseButton } from '../../components/Button'
import AnnotationObject from '../../components/annotation/AnnotationObject';
import EditResourceNameModal from '../../components/modals/EditResourceNameModal';
import GridCell from '../../components/spreadsheet/grid/GridCell';
import HeaderCell from '../../components/spreadsheet/grid/HeaderCell';
import RowIndexCell from '../../components/spreadsheet/grid/RowIndexCell';
import SpreadsheetScrollbar from '../../components/spreadsheet/SpreadsheetScrollbar';
import { MOVE, isNotEmptyString, isNonNegativeInt } from '../../util/App';
import {
    VIZUAL, VIZUAL_OP, deleteColumn, deleteRow, insertColumn, insertRow, moveColumn,
    moveRow,  renameColumn, sortDataset, updateCell
} from '../../util/Vizual';
import '../../../css/App.css';
import '../../../css/Notebook.css';
import '../../../css/Spreadsheet.css';
import { HATEOAS_MODULE_APPEND } from '../../util/HATEOAS';

/**
 * Component to display a dataset in spreadsheet format. Spreadsheets are
 * currently displayed as Html tables.
 */
class Spreadsheet extends React.Component {
    static propTypes = {
        annotations: PropTypes.object,
        dataset: PropTypes.object,
        isUpdating: PropTypes.bool.isRequired,
        project: PropTypes.object.isRequired,
        serviceApi: PropTypes.object.isRequired,
        notebook: PropTypes.object.isRequired,
        userSettings: PropTypes.object.isRequired
    }
    constructor(props) {
        super(props);
        // Keep the id and coordinates of the active cell in the local state.
        this.state = {
            activeColumnId: -1,
            activeRowId: -1,
            activeColumnIndex: -1,
            activeRowIndex: -1,
            modal: null,
            modalValue: null,
            originalCellValue: null,
            showNotebookCell: false,
            updatedCellValue: null,
            updatingColumnId: -1,
            updatingRowId: -1,
            updatingValue: null
        }
    }
    componentWillReceiveProps(newProps) {
        // Clear the active cell if a different dataset is being shown
        let clearCell = false;
        const currentDataset = this.props.dataset;
        const newDataset = newProps.dataset;
        if (currentDataset != null) {
            if (newDataset != null) {
                clearCell = (currentDataset.name !== newDataset.name);
            } else {
                clearCell = true;
            }
        } else {
            clearCell = true;
        }
        if (clearCell === true) {
            this.clearActiveCell();
        }
    }
    /**
     * Append a module to the current workflow.
     */
    appendModule = (command, data) => {
        const { dispatch, dataset, serviceApi, notebook } = this.props;
        // Create data object for request.
        const reqData = {type: command.type, id: command.id, arguments: data};
        notebook.workflow
        // Hide notebook cell
        this.toggleNotebookCell();
        // Dispatch update request. If the current dataset is being renamed or
        // deleted we need to switch to notebook view
        if (
            (command.type === VIZUAL_OP) &&
            ((command.id === VIZUAL.DROP_DATASET) || (command.id === VIZUAL.RENAME_DATASET))
        ) {
            dispatch(insertNotebookCell(notebook.workflow.links.get(HATEOAS_MODULE_APPEND), reqData));
        } else if ((command.type === VIZUAL_OP) && (command.id === VIZUAL.LOAD)) {
            const name = data.name;
            dispatch(
                updateNotebookCellWithUpload(
                    notebook.workflow.links.get(HATEOAS_MODULE_APPEND),
                    reqData,
                    (url, data) => (submitUpdate(notebook.workflow, {name: name, offset:0}, data)),
                    serviceApi.links.upload
                )
            );
        } else {
            dispatch(submitUpdate(notebook.workflow, dataset, reqData))
        }
    }
    /**
     * Set the current active cell to undefined state.
     */
    clearActiveCell = () => {
        // Submit any changes to the current active cell
        this.submitPendingUpdate();
        this.setState({
            activeColumnId: -1,
            activeRowId: -1,
            activeColumnIndex: -1,
            activeRowIndex: -1,
            originalCellValue: null,
            updatedCellValue: null
        });
    }
    deleteUserAnnotation = (annotation, annoId) => {
        const { dispatch, dataset } = this.props;
        const { column, row } = annotation;
        dispatch(deleteAnnotations(dataset, column, row, annoId));
    }
    /**
     * Dismiss an open cell annotations modal.
     */
    dismissAnnotationModal = () => {
        const { dispatch } = this.props;
        dispatch(clearAnnotations());
    }
    /**
     * Dismiss any open modals.
     */
    dismissModal = () => (this.setState({modal: null, modalValue: null}))
    /**
     * Keep track of the value of the active cell.
     */
    handleCellUpdate = (value) => {
        this.setState({updatedCellValue: value})
    }
    /**
     * Move the active grid cell.
     */
    handleMoveCell = (direction) => {
        const {
            activeColumnId, activeRowId, activeColumnIndex, activeRowIndex
        } = this.state;
        // Do nothing if the active cell is not a grid cell.
        if ((activeColumnId === -1) || (activeRowId === -1)) {
            return;
        }
        const { dataset } = this.props;
        // Get the index of the first and last row in the dataset
        const minRowIndex = dataset.rows[0].index;
        const maxRowIndex = dataset.rows[dataset.rows.length - 1].index;
        const columns = dataset.columns;
        let colIdx = activeColumnIndex;
        let rowIdx = activeRowIndex;
        if (direction === MOVE.UP) {
            rowIdx -= 1;
            if (rowIdx < minRowIndex) {
                rowIdx = maxRowIndex;
            }
        } else if (direction === MOVE.DOWN) {
            rowIdx += 1;
            if (rowIdx > maxRowIndex) {
                rowIdx = minRowIndex;
            }
        } else if (direction === MOVE.RIGHT) {
            colIdx += 1;
            if (colIdx >= columns.length) {
                colIdx = 0;
                rowIdx += 1;
                if (rowIdx > maxRowIndex) {
                    rowIdx = minRowIndex;
                }
            }
        } else if (direction === MOVE.LEFT) {
            colIdx -= 1;
            if (colIdx < 0) {
                colIdx = columns.length - 1;
                rowIdx -= 1;
                if (rowIdx < minRowIndex) {
                    rowIdx = maxRowIndex;
                }
            }
        }
        // Update the active cell information
        this.handleSelectCell(columns[colIdx].id, dataset.rowAtIndex(rowIdx).id, colIdx, rowIdx);
    }
    /**
     * Move the active header cell. Only supports moving left or right.
     */
    handleMoveHeader = (direction) => {
        const { activeColumnId, activeRowId, activeColumnIndex } = this.state;
        // Do nothing if the active cell is not a header cell.
        if ((activeColumnId === -1) || (activeRowId !== -1)) {
            return;
        }
        const { dataset } = this.props;
        const columns = dataset.columns;
        let colIdx = activeColumnIndex;
        if (direction === MOVE.RIGHT) {
            colIdx += 1;
            if (colIdx >= columns.length) {
                colIdx = 0;
            }
        } else if (direction === MOVE.LEFT) {
            colIdx -= 1;
            if (colIdx < 0) {
                colIdx = columns.length - 1;
            }
        }
        // Update the active cell information
        this.handleSelectCell(columns[colIdx].id, -1, colIdx, -1);
    }
    /**
     * Navigate to a different block of the underlying dataset.
     */
    handleNavigate = (dataseti, offset, limit) => {
        // Clear active cell. Will submit any changes that were made to the
        // value of the current active cell.
    	this.clearActiveCell();
        // Dispatch navitation request
        const { dispatch, dataset } = this.props;
        let url = dataset.links.getDatasetUrl(offset, limit);
        dispatch(showSpreadsheet(dataset, url));
    }
    /**
     * Set the coordinates of the selected cell.
     */
    handleSelectCell = (columnId, rowId, columnIndex, rowIndex) => {
        // Ignore event while updating
        const { isUpdating, notebook } = this.props;
        if ((isUpdating)  || (notebook.workflow.readOnly)) {
            return;
        }
        // Submit any changes to the current active cell
        this.submitPendingUpdate();
        // Get the current value of the selected sell
        let value = null;
        if (columnIndex !== -1) {
            const { dataset } = this.props;
            if (rowIndex !== -1) {
                value = dataset.rowAtIndex(rowIndex).values[columnIndex];
            } else {
                value = dataset.columns[columnIndex].name;
            }
        }
        this.setState({
            activeColumnId: columnId,
            activeRowId: rowId,
            activeColumnIndex: columnIndex,
            activeRowIndex: rowIndex,
            originalCellValue: value,
            updatedCellValue: value
        });
    }
    handleSubmitModal = (value) => {
        const { dataset } = this.props;
        const { modal, modalValue } = this.state;
        this.dismissModal();
        if (modal === VIZUAL.INSERT_COLUMN) {
            return this.submitVizualCommand(
                insertColumn(dataset.name, value, modalValue)
            );
        } else if (modal === VIZUAL.MOVE_COLUMN) {
            return this.submitVizualCommand(
                moveColumn(dataset.name, modalValue, value)
            );
        } else if (modal === VIZUAL.MOVE_ROW) {
            return this.submitVizualCommand(
                moveRow(dataset.name, modalValue, value)
            );
        }
    }
    /**
     * Handle a VizUAL action triggered by one of the context menues. The third
     * argument (para) is optional (e.g., used to specify the sort order).
     */
    handleVizualAction = (cmdId, identifier, para) => {
        const { dataset } = this.props;
        switch (cmdId) {
            case VIZUAL.INSERT_COLUMN:
            case VIZUAL.MOVE_COLUMN:
            case VIZUAL.MOVE_ROW:
                this.setState({modal: cmdId, modalValue: identifier});
                return;
            case VIZUAL.DELETE_COLUMN:
                return this.submitVizualCommand(
                    deleteColumn(dataset.name, identifier)
                );
            case VIZUAL.DELETE_ROW:
                return this.submitVizualCommand(
                    deleteRow(dataset.name, identifier)
                );
            case VIZUAL.INSERT_ROW:
                return this.submitVizualCommand(
                    insertRow(dataset.name, identifier)
                );
            case VIZUAL.SORT:
            return this.submitVizualCommand(
                sortDataset(dataset.name, identifier, para)
            );
            default:
                return;
        }
    }
    toggleNotebookCell = () => {
        const { showNotebookCell } = this.state;
        this.setState({showNotebookCell: !showNotebookCell});
    }
    /**
     * Render the spreadsheet as a Html table.
     */
    render() {
        const {
            annotations,
            dataset,
            isUpdating,
            notebook,
            userSettings
        } = this.props;
        const {
            activeColumnId,
            activeRowId,
            showNotebookCell,
            updatingColumnId,
            updatingRowId,
            updatingValue
        } = this.state;
        const columns = dataset.columns;
        //
        // Grid header
        //
        let header = [
            <RowIndexCell
                key={-1}
                value=' '
                onClick={this.clearActiveCell}
            />
        ];
        for (let cidx = 0; cidx < columns.length; cidx++) {
            const column = columns[cidx];
            const isActive = (activeColumnId === column.id) && (activeRowId === -1);
            const isBlocked = ((isUpdating) && (updatingColumnId === column.id) && (updatingRowId === -1));
            let columnName = null;
            if (isBlocked) {
                columnName = updatingValue;
            } else {
                columnName = column.name;
            }
            header.push(
                <HeaderCell
                    key={column.id}
                    column={column}
                    columnIndex={cidx}
                    disabled={isUpdating || notebook.workflow.readOnly}
                    isActive={(!isUpdating) && (isActive)}
                    isUpdating={isBlocked}
                    value={columnName}
                    onAction={this.handleVizualAction}
                    onClick={this.handleSelectCell}
                    onMove={this.handleMoveHeader}
                    onUpdate={this.handleCellUpdate}
                />
            );
        }
        header = (<tr>{header}</tr>);
        //
        // Grid rows
        //
        const rows = [];
        for (let ridx = 0; ridx < dataset.rows.length; ridx++) {
            const row = dataset.rows[ridx];
            const cells = [
                <RowIndexCell
                    key={row.id}
                    disabled={isUpdating || notebook.workflow.readOnly}
                    rowIndex={row.index}
                    value={row.index}
                    onAction={this.handleVizualAction}
                    onClick={this.clearActiveCell}
                />
            ];
            for (let cidx = 0; cidx < columns.length; cidx++) {
                const column = columns[cidx];
                const isActive = (activeColumnId === column.id) && (activeRowId === row.id);
                const isBlocked = ((isUpdating) && (updatingColumnId === column.id) && (updatingRowId === row.id));
                let value = null;
                if (isBlocked) {
                    value = updatingValue;
                } else {
                    value = row.values[cidx];
                }
                cells.push(
                    <GridCell
                        key={'C' + column.id + 'R' + row.id}
                        column={column}
                        columnIndex={cidx}
                        hasAnnotations={dataset.hasAnnotations(column.id, row.id)}
                        isActive={(!isUpdating) && (isActive)}
                        isUpdating={isBlocked}
                        rowId={row.id}
                        rowIndex={ridx}
                        value={value}
                        onClick={this.handleSelectCell}
                        onMove={this.handleMoveCell}
                        onUpdate={this.handleCellUpdate}
                    />
                );
            }
            rows.push(<tr key={row.id}>{cells}</tr>);
        }
        let showAnnoHandler = null;
        if ((activeColumnId >= 0) && (activeRowId !== -1)) {
            showAnnoHandler = this.showAnnotationModal;
        }
        // Show a notebook cell to append at the end of the current workflow.
        let notebookCell = null;
        if (showNotebookCell) {
            notebookCell = (
                <div className='notebook-cell-xp-new'>
                    <table className='cell-area'><tbody>
                        <tr>
                            <td className='cell-index'>
                                <CloseButton
                                    name='minus-square-o'
                                    onClick={this.toggleNotebookCell}
                                />
                            </td>
                            <td className='cell-cmd'>
                                <div className='cell-form'>
                                    
                                </div>
                            </td>
                        </tr>
                    </tbody></table>
                </div>
            );
        }

        let annoButtonCss = null;
        if (showAnnoHandler != null) {
            annoButtonCss = 'icon-button';
        }
        let notebookCellButton = null;
        if (!notebook.workflow.readOnly) {
            let cellIcon = 'plus square outline';
            if (showNotebookCell) {
                cellIcon = 'minus square outline';
            }
            notebookCellButton = (
                <span className='left-padding-md'>
                    <Icon
                        className='icon-button'
                        title='Add notebook cell'
                        name={cellIcon}
                        onClick={this.toggleNotebookCell}
                    />
                </span>
            );
        }
        return (
            <div className='spreadsheet-container'>
                <h1 className='dataset-name'>
                    {dataset.name}
                    <span className='left-padding-lg'>
                        <Icon
                            className={annoButtonCss}
                            name='comment alternate outline'
                            title='Show annotations'
                            disabled={showAnnoHandler === null}
                            onClick={showAnnoHandler}
                        />
                    </span>
                    { notebookCellButton }
                </h1>
                <AnnotationObject
                    annotation={annotations}
                    onDelete={this.deleteUserAnnotation}
                    onDiscard={this.dismissAnnotationModal}
                    onSubmit={this.submitUserAnnotation}
                />
                <Dimmer.Dimmable dimmed={isUpdating}>
                    <Loader active={isUpdating}/>
                    { notebookCell }
                    <div className='spreadsheet-container'>
	                    <div className='spreadsheet-table-container'>
	                    <table className='spreadsheet'>
	                        <thead>{header}</thead>
	                        <tbody>{rows}</tbody>
	                    </table>
	                    </div>
	                    <SpreadsheetScrollbar
		                    dataset={dataset}
		                    onNavigate={this.handleNavigate}
	                    	userSettings={userSettings}
		                />
	                </div>
                </Dimmer.Dimmable>
                {this.showModal()}
            </div>
        );
    }
    /**
     * Show the annotations modal for the current active cell.
     */
    showAnnotationModal = () => {
        const { dispatch, dataset } = this.props;
        const { activeColumnId, activeRowId } = this.state;
        dispatch(fetchAnnotations(dataset, activeColumnId, activeRowId));
    }
    /**
     * Show modal if the internal state .modal value is set.
     */
    showModal = () => {
        const { modal, modalValue } = this.state;
        let content = null;
        if (modal != null) {
            let valueValidFunc = null;
            let modalTitle = null;
            let modalPrompt = null;
            if (modal === VIZUAL.INSERT_COLUMN) {
                valueValidFunc = isNotEmptyString;
                modalTitle = 'Insert Column';
                modalPrompt = 'Name of new column';
            } else if (modal === VIZUAL.MOVE_COLUMN) {
                const { dataset } = this.props;
                const columns = dataset.columns;
                let column = null;
                for (let i = 0; i < columns.length; i++) {
                    if (columns[i].id === modalValue) {
                        column = columns[i];
                        break;
                    }
                }
                valueValidFunc = isNonNegativeInt;
                modalTitle = 'Move Column';
                modalPrompt = 'Target position for column ' + column.name;
            } else if (modal === VIZUAL.MOVE_ROW) {
                valueValidFunc = isNonNegativeInt;
                modalTitle = 'Move Row';
                modalPrompt = 'Target position for row ' + modalValue;
            }
            return (
                <EditResourceNameModal
                    open={true}
                    isValid={valueValidFunc}
                    title={modalTitle}
                    prompt={modalPrompt}
                    value={''}
                    onCancel={this.dismissModal}
                    onSubmit={this.handleSubmitModal}
                />
            );
        }
        return content;
    }
    submitPendingUpdate = () => {
        const {
            activeColumnId,
            activeRowId,
            originalCellValue,
            updatedCellValue,
        } = this.state;
        if (activeColumnId !== -1) {
            const { dispatch, dataset, notebook } = this.props;
            let workflow = null;
            if(dataset.workflow){
            	workflow = dataset.workflow;
            }
            else {
            	workflow = notebook.workflow;
            }
            let moduleIndex = null;
            if(dataset.moduleId){
            	if(dataset.moduleIndex){
            		//there is a pending vizual insert so we want to insert after that (+1)
                	moduleIndex = dataset.moduleIndex+1;
                }
                else {
                	const findModuleById = (imodule) => imodule.id == dataset.moduleId;
                	moduleIndex = workflow.modules.findIndex( findModuleById)+1;
                }
            	const lastModule = ( moduleIndex == workflow.modules.length );
            	if(lastModule){
            		//we are on the last module so we can just append
            		moduleIndex = null;
            	}
            }
            if (originalCellValue !== updatedCellValue) {
                this.setState({
                    updatingColumnId: activeColumnId,
                    updatingRowId: activeRowId,
                    updatingValue: updatedCellValue
                })
                let cmd = null;
                if (activeRowId !== -1) {
                    cmd = updateCell(
                        dataset.name,
                        activeColumnId,
                        activeRowId,
                        updatedCellValue
                    );
                } else {
                    cmd = renameColumn(
                        dataset.name,
                        activeColumnId,
                        updatedCellValue
                    );
                }
                dispatch(submitUpdate(workflow, dataset, cmd, moduleIndex));
            }
        }
    }
    submitUserAnnotation = (annotation, key, value) => {
        const { dispatch, dataset } = this.props;
        const { column, row } = annotation;
        dispatch(updateAnnotations(dataset, column, row, key, value));
    }
    submitVizualCommand = (cmd) => {
        const { dispatch, dataset, notebook } = this.props;
        let workflow = null;
        if(dataset.workflow){
        	workflow = dataset.workflow;
        }
        else {
        	workflow = notebook.workflow;
        }
        let moduleIndex = null;
        if(dataset.moduleId){
        	if(dataset.moduleIndex){
            	moduleIndex = dataset.moduleIndex+1;
            }
            else {
            	const findModuleById = (imodule) => imodule.id == dataset.moduleId;
            	moduleIndex = workflow.modules.findIndex( findModuleById)+1;
            }
        }
        // Clear any active cells without submitting potential changes
        this.setState({
            activeColumnId: -1,
            activeRowId: -1,
            activeColumnIndex: -1,
            activeRowIndex: -1,
            originalCellValue: null,
            updatedCellValue: null,
            updatingColumnId: -1,
            updatingRowId: -1,
            updatingValue: null
        });
        dispatch(submitUpdate(workflow, dataset, cmd, moduleIndex));
    }
}


const mapStateToProps = state => {
    return {
        annotations: state.spreadsheet.annotations,
        dataset: state.spreadsheet.dataset,
        isUpdating: state.spreadsheet.isUpdating,
        opError: state.spreadsheet.opError,
        project: state.projectPage.project,
        serviceApi: state.serviceApi,
        notebook: state.notebookPage.notebook,
        userSettings: state.app.userSettings
    }
}

export default withRouter(connect(mapStateToProps)(Spreadsheet))
