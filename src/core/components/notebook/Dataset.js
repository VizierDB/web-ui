/**
 * Display a dataset in spreadsheet format with minimal functionality for the
 * user to interact with the data. This is a static view on a historic
 * dataset that was generated as output of a workflow module.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'semantic-ui-react'
import SpreadsheetNavbar from '../spreadsheet/SpreadsheetNavbar'
import '../../../css/Spreadsheet.css'


class Dataset extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        dataset: PropTypes.object.isRequired
    }
    render() {
        const { dataset, cell } = this.props
        // Table headline containing column names.
        let columns = [];
        columns.push(
            <Table.HeaderCell className='spreadsheet-header' key="ROW-ID">
                #
            </Table.HeaderCell>
        )
        for (let i = 0; i < dataset.columns.length; i++) {
            const col = dataset.columns[i]
            columns.push(
                <Table.HeaderCell className='spreadsheet-header' key={col.id}>
                    {col.name}
                </Table.HeaderCell>
            )
        }
        // Table body
        let rows = [];
        for (let iRow = 0; iRow < dataset.rows.length; iRow++) {
            const row = dataset.rows[iRow];
            const cells = [];
            cells.push(
                <Table.Cell key={'ROW-ID' + iRow} className='row-number'>
                    {row.index}
                </Table.Cell>
            );
            const values = row.values;
            for (let iCol = 0; iCol < values.length; iCol++) {
                const val = values[iCol];
                if (val !== null) {
                    cells.push(<Table.Cell key={'R' + iRow + 'C' + iCol}>
                        {val}
                    </Table.Cell>);
                } else {
                    cells.push(<Table.Cell key={'R' + iRow + 'C' + iCol} />);
                }
            };
            rows.push(<Table.Row key={iRow}>{cells}</Table.Row>);
        }
        return (
            <div className='spreadsheet'>
                <Table celled  striped>
                  <Table.Header>
                    <Table.Row>
                      {columns}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {rows}
                  </Table.Body>
                </Table>
                <SpreadsheetNavbar dataset={dataset} container={cell}/>
            </div>
        );
    }
}

export default Dataset
