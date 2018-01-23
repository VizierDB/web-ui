/**
 * Component to display and interact with the spreadsheet view of a dataset.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Icon, Input, Popup, Table } from 'semantic-ui-react'
import { clearSpreadsheetOperationError, updateSpreadsheet } from '../../actions/spreadsheet/Spreadsheet'
import { ContentSpinner } from '../../components/util/Spinner'
import { ErrorMessage } from '../../components/util/Message';
import ColumnDropDown from '../../components/spreadsheet/ColumnDropDown'
import ColumnNameModal from '../../components/spreadsheet/ColumnNameModal'
import DeleteModal from '../../components/spreadsheet/DeleteModal'
import MoveModal from '../../components/spreadsheet/MoveModal'
import RowDropDown from '../../components/spreadsheet/RowDropDown'
import SpreadsheetDownload from '../../components/spreadsheet/SpreadsheetDownload'
import {
    DELETE_COLUMN, DELETE_ROW, INSERT_COLUMN, MOVE_COLUMN, MOVE_ROW,
    RENAME_COLUMN, UPDATE_CELL,
    deleteColumn, deleteRow, insertColumn, insertRow, moveColumn, moveRow,
    renameColumn, updateCell
} from '../../util/Vizual'
import '../../../css/App.css'
import '../../../css/Spreadsheet.css'


const isRenameColumn = (action, index) => {
    if (action) {
        if ((action.type === RENAME_COLUMN) && (action.columnIndex === index)) {
            return true
        }
    }
    return false
}

const isUpdateCell = (action, colIndex, rowIndex) => {
    if (action) {
        if (action.type === UPDATE_CELL) {
            if ((action.columnIndex === colIndex) && (action.rowIndex === rowIndex)) {
                return true
            }
        }
    }
    return false
}


/**
 * Component to display a dataset in spreadsheet format. Spreadsheets are
 * currently displayed as Html tables.
 */
class Spreadsheet extends React.Component {
    static propTypes = {
        dataset: PropTypes.object,
        error: PropTypes.object,
        isBusy: PropTypes.bool.isRequired,
        opError: PropTypes.object,
        workflow: PropTypes.object
    }
    constructor(props) {
        super(props);
        this.state = {action: null, inputValue: ''};
    }
    /**
     * Cancel a requested user action by setting the action object to null.
     */
    cancelAction = () => {
        this.setState({action: null, inputValue: ''})
    }
    /**
     * Dismiss an error message shown as result of a previous update operation
     */
    clearUpdateError = () => {
        const { dispatch } = this.props
        dispatch(clearSpreadsheetOperationError())
    }
    /**
     * Request deletion of a column. Will display a confirmation dialog for the
     * user. If the user confirms, call submitDeleteColumn to dispatch the
     * delete operation.
     */
    deleteColumn(columnIndex) {
        this.setState({action: {type: DELETE_COLUMN, columnIndex}})
    }
    /**
     * Request deletion of a spreadsheet row. Will display the confirm dialog
     * for the user to confirm the action. Call submitDeleteRow to dispatch the
     * operation after user confirmation.
     */
    deleteRow(rowIndex) {
        this.setState({action: {type: DELETE_ROW, rowIndex}})
    }
    /**
     * Handle change in cell input control.
     */
    handleChange = (event) => {
        this.setState({inputValue: event.target.value})
    }
    /**
     * Handle key down events. Detect ESC and RETURN to either hide an input
     * control (via cancelAction) or to call the respective submit method.
     */
    handleKeyDown = (event) => {
        const { action } = this.state
        if (event.keyCode === 13) {
            if (action.type === RENAME_COLUMN) {
                this.submitRenameColumn()
            } else if (action.type === UPDATE_CELL) {
                this.submitUpdateCell()
            }
        } else if (event.keyCode === 27) {
            this.cancelAction()
        }
    }
    /**
     * Request insertion of a new column. Will display a modal dialog that lets
     * the user enter a name for the new column. After entering the new name
     * call submitInsertColumn to dispatch the operation.
     */
    insertColumn(position) {
        this.setState({action: {type: INSERT_COLUMN, position}})
    }
    /**
     * Dispatch the insert row operation directly. This is the only operation
     * that does not require any additional user input.
     */
    insertRow(position) {
        const { dispatch, dataset, workflow } = this.props
        dispatch(
            updateSpreadsheet(
                workflow.links.append,
                insertRow(dataset.name, position),
                dataset.name
            )
        )
    }
    /**
     * Request a column move. Will display a modal that allows the user to enter
     * the target position. Call submitMoveColumn to dispatch the operation with
     * the user-provided target position.
     */
    moveColumn(columnIndex) {
        this.setState({action: {type: MOVE_COLUMN, columnIndex}})
    }
    /**
     * Request a column move. Will display a modal that allows the user to enter
     * the target position. Call submitMoveRow to dispatch the operation with
     * the user-provided target position.
     */
    moveRow(rowIndex) {
        this.setState({action: {type: MOVE_ROW, rowIndex}})
    }
    /**
     * Request a column rename operation. Will display an input control that
     * allows the user to enter the new column name. Call submitRenameColumn
     * with to dispatch the operation after the user entered the new name.
     */
    renameColumn(columnIndex) {
        const { dataset } = this.props
        this.setState({
            action: {type: RENAME_COLUMN, columnIndex},
            inputValue: dataset.columns[columnIndex].name
        })
    }
    /**
     * Request an update cell operation. Will display an input control that
     * allows the user to enter the new cell value. Call submitUpdateCell to
     * dispatch the operation after user entered new cell value.
     */
    updateCell(columnIndex, rowIndex) {
        const { dataset } = this.props
        this.setState({
            action: {type: UPDATE_CELL, columnIndex, rowIndex},
            inputValue: dataset.rows[rowIndex].values[columnIndex]
        })
    }
    /**
     * Show data as Html table. The implementation currently relies on the fact
     * that the cells in the array that is being returned from the API are
     * ordered by row and column (and that there are no missing cells).
     */
    render() {
        const { dataset, error, isBusy, opError } = this.props
        const { action } = this.state
        let content = null;
        if (isBusy) {
            content = (
                <div className='spinner-padding'>
                    <ContentSpinner />
                </div>
            )
        } else if (error) {
            content = (<ErrorMessage
                title={error.title}
                message={error.message}
            />)
        } else if (dataset) {
            // Columns
            let columns = []
            columns.push(
                <Table.HeaderCell className='spreadsheet-header' key="ROW-ID" >
                    #
                </Table.HeaderCell>
            )
            for (let i = 0; i < dataset.columns.length; i++) {
                const col = dataset.columns[i]
                let colCell = null
                if (isRenameColumn(action, i)) {
                    if ((action.type === RENAME_COLUMN) && (action.columnIndex === i)) {
                        colCell = (
                            <Table.HeaderCell className='spreadsheet-header' key={col.id}>
                                <Input
                                    autoFocus
                                    className='spreadsheet-control'
                                    value={this.state.inputValue}
                                    onChange={this.handleChange}
                                    onKeyDown={this.handleKeyDown}

                                />
                            </Table.HeaderCell>
                        )
                    } else {
                        colCell = (
                            <Table.HeaderCell className='spreadsheet-header' key={col.id}>
                                {col.name}
                                <ColumnDropDown columnIndex={i} spreadsheet={this}/>
                            </Table.HeaderCell>
                        )
                    }
                } else {
                    colCell = (
                        <Table.HeaderCell className='spreadsheet-header' key={col.id}>
                            {col.name}
                            <ColumnDropDown columnIndex={i} spreadsheet={this}/>
                        </Table.HeaderCell>
                    )
                }
                columns.push(colCell)
            }
            // Rows
            let rows = []
            for (let i = 0; i < dataset.rows.length; i++) {
                const row = dataset.rows[i]
                let cells = []
                cells.push(
                    <Table.Cell key={'ROW-ID' + i} className='row-number'>
                        {i}
                        <RowDropDown rowIndex={i} spreadsheet={this}/>
                    </Table.Cell>
                );
                for (let j = 0; j < row.values.length; j++) {
                    let cell = null
                    const col = dataset.columns[j]
                    const cellKey = 'ROW-ID' + i + 'COL' + j
                    if (isUpdateCell(action, j, i)) {
                        cell = (
                            <Table.Cell key={cellKey} >
                                <Input
                                    autoFocus
                                    className='spreadsheet-control'
                                    value={this.state.inputValue}
                                    onChange={this.handleChange}
                                    onKeyDown={this.handleKeyDown}
                                />
                            </Table.Cell>
                        )
                    } else {
                        let annotation = null
                        if (dataset.hasCellAnnotation(col.id, row.id)) {
                            let anno = dataset.getCellAnnotation(col.id, row.id)
                            annotation = (
                                <span className='anno-right'>
                                    <Popup
                                        key={cellKey}
                                        trigger={
                                            <Icon
                                                name='info circle'
                                                color='blue'
                                            />
                                        }
                                        header={anno.title}
                                        content={anno.text}
                                    />
                                </span>
                            )
                        }
                        cell = (
                            <Table.Cell key={cellKey} onClick={() => (this.updateCell(j, i))}>
                                {row.values[j]}
                                {annotation}
                            </Table.Cell>
                        )
                    }
                    cells.push(cell);
                }
                rows.push(<Table.Row key={i}>{cells}</Table.Row>);
            }
            /**
             * Depending on the user action we might dispay a modal form to
             * gather input parameter for the action.
             */
            let modal = null;
            if (action) {
                if (action.type === DELETE_COLUMN) {
                    modal = (
                        <DeleteModal
                            name={dataset.columns[action.columnIndex].name}
                            type='Column'
                            spreadsheet={this}
                            onSubmit={this.submitDeleteColumn}
                        />
                    )
                } else if (action.type === DELETE_ROW) {
                    modal = (
                        <DeleteModal
                            name={'#' + action.rowIndex}
                            type='Row'
                            spreadsheet={this}
                            onSubmit={this.submitDeleteRow}
                        />
                    )
                } else if (action.type === INSERT_COLUMN) {
                    modal = (
                        <ColumnNameModal
                            spreadsheet={this}
                            onSubmit={this.submitInsertColumn}
                        />
                    )
                } else if (action.type === MOVE_COLUMN) {
                    modal = (
                        <MoveModal
                            name={dataset.columns[action.columnIndex].name}
                            maxValue={dataset.columns.length}
                            type='Column'
                            spreadsheet={this}
                            onSubmit={this.submitMoveColumn}
                        />
                    )
                } else if (action.type === MOVE_ROW) {
                    modal = (
                        <MoveModal
                            name={'#' + action.rowIndex}
                            maxValue={dataset.rows.length}
                            type='Row'
                            spreadsheet={this}
                            onSubmit={this.submitMoveRow}
                        />
                    )
                }
            }
            // Show an additional error message before the spreadsheet if a
            // previous update operation returned an error
            let operationError = null
            if (opError) {
                operationError = content = (<ErrorMessage
                    title={opError.title}
                    message={opError.message}
                    handleDismiss={this.clearUpdateError}
                />)
            }
            content = (
                <div>
                    { operationError }
                    <Table celled striped size='small'>
                        <Table.Header>
                            <Table.Row>
                                {columns}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {rows}
                        </Table.Body>
                    </Table>
                    { modal }
                    <SpreadsheetDownload
                        downloadUrl={dataset.links.download}
                    />
                </div>
            );
        }
        return content;
    }
    /**
     * Dispatch the delete column operation after user confirms the action.
     */
    submitDeleteColumn = () => {
        const { dispatch, dataset, workflow } = this.props
        const { action } = this.state
        dispatch(
            updateSpreadsheet(
                workflow.links.append,
                deleteColumn(dataset.name, action.columnIndex),
                dataset.name
            )
        )
        this.cancelAction()
    }
    /**
     * Dispatch the delete row operation after user confirms the action.
     */
    submitDeleteRow = () => {
        const { dispatch, dataset, workflow } = this.props
        const { action } = this.state
        dispatch(
            updateSpreadsheet(
                workflow.links.append,
                deleteRow(dataset.name, action.rowIndex),
                dataset.name
            )
        )
        this.cancelAction()
    }
    /**
     * Dispatch insert column operation. Expects a user-defined name for the new
     * column. The name, however, can be empty. Leading anf trailing whitespaces
     * will be removed.
     */
    submitInsertColumn = (name) => {
        const { dispatch, dataset, workflow } = this.props
        const { action } = this.state
        dispatch(
            updateSpreadsheet(
                workflow.links.append,
                insertColumn(dataset.name, name, action.position),
                dataset.name
            )
        )
        this.cancelAction()
    }
    /**
     * Dispatch the move column operation using the user-provided target
     * position. Assumes that the given poisition is a valid value.
     */
    submitMoveColumn = (position) => {
        const { dispatch, dataset, workflow } = this.props
        const { action } = this.state
        dispatch(
            updateSpreadsheet(
                workflow.links.append,
                moveColumn(dataset.name, action.columnIndex, position),
                dataset.name
            )
        )
        this.cancelAction()
    }
    /**
     * Dispatch the move row operation using the user-provided target
     * position. Assumes that the given poisition is a valid value.
     */
    submitMoveRow = (position) => {
        const { dispatch, dataset, workflow } = this.props
        const { action } = this.state
        dispatch(
            updateSpreadsheet(
                workflow.links.append,
                moveRow(dataset.name, action.rowIndex, position),
                dataset.name
            )
        )
        this.cancelAction()
    }
    /**
     * Dispatch a rename column operation with a user-entered new column name.
     */
    submitRenameColumn = () => {
        const { dispatch, dataset, workflow } = this.props
        const { action, inputValue } = this.state
        dispatch(
            updateSpreadsheet(
                workflow.links.append,
                renameColumn(dataset.name, action.columnIndex, inputValue.trim()),
                dataset.name
            )
        )
        this.cancelAction()
    }
    /**
     * Dispatch a update cell operation with a user-entered new cell value.
     */
    submitUpdateCell = () => {
        const { dispatch, dataset, workflow } = this.props
        const { action, inputValue } = this.state
        dispatch(
            updateSpreadsheet(
                workflow.links.append,
                updateCell(
                    dataset.name,
                    action.columnIndex,
                    action.rowIndex,
                    inputValue
                ),
                dataset.name
            )
        )
        this.cancelAction()
    }
}


const mapStateToProps = state => {

    return {
        dataset: state.spreadsheet.dataset,
        error: state.spreadsheet.error,
        isBusy: state.spreadsheet.isBusy,
        opError: state.spreadsheet.opError,
        workflow: state.workflow.workflow
    }
}

export default connect(mapStateToProps)(Spreadsheet)
