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

import React, { Suspense } from 'react'
import PropTypes from 'prop-types'
import GridCell from './grid/GridCell';
import HeaderCell from './grid/HeaderCell';
import RowIndexCell from './grid/RowIndexCell';
import SpreadsheetDropDown from './menu/SpreadsheetDropDown';
import SpreadsheetScrollbar from './SpreadsheetScrollbar';
import ColumnView from './ColumnView';

import '../../../css/App.css'
import '../../../css/Notebook.css'
import '../../../css/Spreadsheet.css'
import { Button, Icon, Popup, Label } from 'semantic-ui-react'
//import { each } from 'lodash';
const SummaryPlotHeader = React.lazy(() => import('./SummaryPlotHeader')); // Lazy-loaded

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
        onSelectCell: PropTypes.func.isRequired,
        userSettings: PropTypes.object.isRequired,
        onEditSpreadsheet: PropTypes.func.isRequired,
        downloadLimit: PropTypes.number.isRequired,
        onRecommendAction: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        this.state = {column: -1, row: -1,  profiledData: null, typeView: 1};
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
        // TODO: Get a sample of the dataset. Currently, just the data that is showed in the table/spreadsheet
        // is used to compute the plots.
        // const asyncRequest = this.profile(this.props.dataset).then(
        //     result => {
        //       this.setState({profiledData: result});
        //     }
        //   ).catch(e => {
        //     console.log('There has been a problem with your fetch operation: ' + e.message);
        //   });
    }
    /**
     * Update the reference to the active cell in the component state.
     */
    handleSelectCell = (columnId, rowId) => {
        this.setState({column: columnId, row: rowId});
    }
    /**
     * Update the reference to the active cell in the component state.
     */
    updateTypeView = (value) => {
        this.setState({typeView: value});
    }
    
    render() {
        const { dataset, onFetchAnnotations, onNavigate, onSelectCell, userSettings, onEditSpreadsheet, moduleId, downloadLimit, onRecommendAction } = this.props;
        const activeCell = this.state;
        // Content header
        const contentHeader = (
            <div className='output-header' onClick={onSelectCell}>
                <span className='header-name'>{dataset.name}</span>
                <span> (</span>
                <span className='number-highlight'>{dataset.rowCount}</span>
                <span className='right-padding-md'> rows)</span>
                <SpreadsheetDropDown 
                	dataset={dataset}
                    onEditSpreadsheet={onEditSpreadsheet}
                    moduleId={moduleId}
                    downloadLimit={downloadLimit}
                    onRecommendAction={onRecommendAction}
                />
            </div>
        );

        const columns = dataset.columns;
        // Grid header
        let header = [<RowIndexCell key={-1} rowIndex={-1} value={' '} />];
        for (let cidx = 0; cidx < columns.length; cidx++) {
            const column = columns[cidx];
            header.push(
                <HeaderCell
                    key={column.id}
                    column={column}
                    columnIndex={cidx}
                    summaryPlot={this.state.typeView === 2 ? true : false}
                />
            );
        }
        header = (<tr>{header}</tr>);
        // Grid rows
        const offset = dataset.offset;
        const rows = [];
        for (let ridx = 0; ridx < dataset.rows.length; ridx++) {
            const row = dataset.rows[ridx];
            const cells = [<RowIndexCell key={row.id} rowId={row.id} rowIndex={ridx + offset} value={ridx + offset} />];
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
                        onFetchAnnotations={onFetchAnnotations}
                    />
                );
            }
            rows.push(<tr key={row.id}>{cells}</tr>);
        }

        const returnContent = this.state.typeView !== 3
        ?
        <div className='spreadsheet-container'>
            <div className='spreadsheet-table-container'>
                <table className='spreadsheet'>
                {
                    this.state.typeView === 1
                    ?
                    <thead>{header}</thead>
                    :
                    <Suspense fallback={<thead>{header}</thead>}>
                        <SummaryPlotHeader dataset={dataset}/>
                    </Suspense>
                }
                <tbody>{rows}</tbody>
                </table>
            </div>
            <SpreadsheetScrollbar
                dataset={dataset}
                onNavigate={onNavigate}
                userSettings={userSettings}
            />
        </div>
        :
        <ColumnView dataset={dataset}/>;
        return (
            <div>
                { contentHeader }
                <Button.Group floated='right' size='mini' style={{marginTop:'-20px'}}>
                    <Label basic  pointing='right' size='mini'>
                        Views
                    </Label>
                    <Popup content='Compact view' trigger={
                    <Button icon onClick={() => (this.updateTypeView(1))}>
                        <Icon name='compress' />
                    </Button>} />
                    <Popup content='Detail view' trigger={
                    <Button icon onClick={() => (this.updateTypeView(2))}>
                        <Icon name='chart bar outline' />
                    </Button>} />
                    <Popup content='Column view' trigger={
                    <Button icon onClick={() => (this.updateTypeView(3))}>
                        <Icon name='columns' />
                    </Button>} />
                </Button.Group>
                <br/>
                {returnContent}
            </div>
        );
    }
}

export default DatasetView;
