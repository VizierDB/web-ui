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

import React from 'react'
import PropTypes from 'prop-types'
import GridCell from './grid/GridCell';
import HeaderCell from './grid/HeaderCell';
import RowIndexCell from './grid/RowIndexCell';
import SpreadsheetDropDown from './menu/SpreadsheetDropDown';
import SpreadsheetScrollbar from './SpreadsheetScrollbar';
import '../../../css/App.css'
import '../../../css/Notebook.css'
import '../../../css/Spreadsheet.css'


/**
 * Display a dataset in spreadsheet format with minimal functionality for the
 * user to interact with the data. This is a static view on a historic
 * dataset that was generated as output of a workflow module.
 */
class DatasetView extends React.Component {
    static propTypes = {
        dataset: PropTypes.object.isRequired,
        onFetchAnnotations: PropTypes.func.isRequired,
        onNavigate: PropTypes.func.isRequired,
        userSettings: PropTypes.object.isRequired
    }
    constructor(props) {
        super(props);
        this.state = {column: -1, row: -1};
    }
    /**
     * If the dataset changes we need to reset the active cell coordinates in
     * the component state.
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        // Only try to update the state if there currently are valid active
        // cell coordinates in the component state.
        const { column, row } = this.state;
        if ((column !== -1) && (row !== -1)) {
            if (prevProps.dataset.id !== this.props.dataset.id) {
                this.setState({column: -1, row: -1});
            }
        }
    }
    /**
     * Update the reference to the active cell in the component state.
     */
    handleSelectCell = (columnId, rowId) => {
        this.setState({column: columnId, row: rowId});
    }
    render() {
        const { dataset, onNavigate, userSettings } = this.props;
        const activeCell = this.state;
        // Content header
        const contentHeader = (
            <div className='output-header'>
                <span className='header-name'>{dataset.name}</span>
                <span> (</span>
                <span className='number-highlight'>{dataset.rowCount}</span>
                <span className='right-padding-md'> rows)</span>
                <SpreadsheetDropDown dataset={dataset} />
            </div>
        );
        const columns = dataset.columns;
        // Grid header
        let header = [<RowIndexCell key={-1} value=' ' />];
        for (let cidx = 0; cidx < columns.length; cidx++) {
            const column = columns[cidx];
            header.push(
                <HeaderCell
                    key={column.id}
                    column={column}
                    columnIndex={cidx}
                />
            );
        }
        header = (<tr>{header}</tr>);
        // Grid rows
        const offset = dataset.offset;
        const rows = [];
        for (let ridx = 0; ridx < dataset.rows.length; ridx++) {
            const row = dataset.rows[ridx];
            const cells = [<RowIndexCell key={row.id} value={ridx + offset} />];
            for (let cidx = 0; cidx < columns.length; cidx++) {
                const column = columns[cidx];
                const isActive = (activeCell.column === column.id) && (activeCell.row === row.id);
                cells.push(
                    <GridCell
                        key={'C' + column.id + 'R' + row.id}
                        column={column}
                        columnIndex={cidx}
                        hasAnnotations={dataset.hasAnnotations(column.id, row.id)}
                        isActive={isActive}
                        rowId={row.id}
                        rowIndex={ridx}
                        value={row.values[cidx]}
                        onClick={() => (this.handleSelectCell(column.id, row.id))}
                    />
                );
            }
            rows.push(<tr key={row.id}>{cells}</tr>);
        }
        return (
            <div>
                { contentHeader }
                <div className='spreadsheet-container'>
                    <div className='spreadsheet-table-container'>
                    <table className='spreadsheet'>
                        <thead>{header}</thead>
                        <tbody>{rows}</tbody>
                    </table>
                    </div>
                    <SpreadsheetScrollbar
                        dataset={dataset}
                        onNavigate={onNavigate}
                        userSettings={userSettings}
                    />
                </div>
            </div>
        );
    }
}

export default DatasetView;
