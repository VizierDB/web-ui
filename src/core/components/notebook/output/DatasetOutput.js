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
import GridCell from '../../spreadsheet/grid/GridCell';
import HeaderCell from '../../spreadsheet/grid/HeaderCell';
import RowIndexCell from '../../spreadsheet/grid/RowIndexCell';
import SpreadsheetScrollbar from '../../spreadsheet/SpreadsheetScrollbar'
import '../../../../css/Notebook.css'
import '../../../../css/Spreadsheet.css'


/**
 * Display a dataset in spreadsheet format with minimal functionality for the
 * user to interact with the data. This is a static view on a historic
 * dataset that was generated as output of a workflow module.
 */
class DatasetOutput extends React.Component {
    static propTypes = {
        activeCell: PropTypes.object.isRequired,
        dataset: PropTypes.object.isRequired,
        onNavigate: PropTypes.func.isRequired,
        onSelectCell: PropTypes.func.isRequired
    }
    render() {
        const { activeCell, dataset, onNavigate, onSelectCell } = this.props;
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
        const rows = [];
        for (let ridx = 0; ridx < dataset.rows.length; ridx++) {
            const row = dataset.rows[ridx];
            const cells = [<RowIndexCell key={row.id} value={row.index} />];
            for (let cidx = 0; cidx < columns.length; cidx++) {
                const column = columns[cidx];
                cells.push(
                    <GridCell
                        key={'C' + column.id + 'R' + row.id}
                        column={column}
                        columnIndex={cidx}
                        hasAnnotations={dataset.hasAnnotations(column.id, row.id)}
                        isActive={activeCell.isActive(column.id, row.id)}
                        rowId={row.id}
                        rowIndex={ridx}
                        value={row.values[cidx]}
                        onClick={onSelectCell}
                    />
                );
            }
            rows.push(<tr key={row.id}>{cells}</tr>);
        }
        return (
            <div className='dataset'>
                <table className='spreadsheet'>
                    <thead>{header}</thead>
                    <tbody>{rows}</tbody>
                </table>
                <div className='navbar-container'>
                    <SpreadsheetScrollbar
                        dataset={dataset}
                        onNavigate={onNavigate}
                    />
                </div>
            </div>
        );
    }
}

export default DatasetOutput;
