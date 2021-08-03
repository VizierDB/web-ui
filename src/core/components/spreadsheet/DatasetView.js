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
import ImageCell from './grid/ImageCell';
import RowIndexCell from './grid/RowIndexCell';
import SpreadsheetDropDown from './menu/SpreadsheetDropDown';
import SpreadsheetScrollbar from './SpreadsheetScrollbar';
import ColumnView from './ColumnView';
import HeaderCell from './grid/HeaderCell'; 

import '../../../css/App.css'
import '../../../css/Notebook.css'
import '../../../css/Spreadsheet.css'
import 'toastr/build/toastr.min.css'

import {Button, Icon, Popup, Label, Loader} from 'semantic-ui-react'
import Headers from "./Headers";
import toastr from 'toastr'

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
        onRecommendAction: PropTypes.func
    }
    constructor(props) {
        super(props);
        this.state = {column: -1, row: -1,  typeView: 1};
    }

    componentDidMount() {
        this.setState({
            column: -1,
            row:-1,
            typeView: 1
        })
    }

    static getDerivedStateFromProps = (props, state) => {
        if(!props.dataset.isProfiled()){
            return null;
        } else {
            return null;
        }
    }
    /**
     * If the dataset changes we need to reset the active cell coordinates in
     * the component state.
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        // Only try to update the state if there currently are valid active
        // cell coordinates in the component state.
        const { dataset } = this.props;
        if (prevProps.dataset.id !== dataset.id) {
            this.setState({column: -1, row: -1, typeView:1});
        }else if (dataset.isProfiled() && !prevProps.dataset.isProfiled()){
            toastr.options = {
                positionClass : 'toast-top-full-width',
                hideDuration: 300,
                timeOut: 5000
            }
            setTimeout(() => toastr.success(`Detailed and Column views are now available for the ${dataset.name} dataset.`), 300)
        }else if(!dataset.isProfiled() && prevProps.dataset.isProfiled()){
            this.setState({typeView:1})
        }
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
        if(value!==1){
            if(!this.props.dataset.isProfiled()){
                this.handleRequestProfiler(true)
            }
        }
        this.setState({typeView: value});
    };
    /**
     * request profiled properties from the server
     */
    handleRequestProfiler = (profile) => {
        if(profile){
            const {dataset, onNavigate, userSettings} = this.props;
            onNavigate(dataset, dataset.offset, userSettings.cellRowLimit(), profile)
        }
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
        let header = [<RowIndexCell key={-1} rowId={"-1"} rowIndex={-1} value={' '} />];
        for (let cidx = 0; cidx < columns.length; cidx++) {
            const column = columns[cidx];
            header.push(
                <HeaderCell
                    key={column.id}
                    column={column}
                    columnIndex={cidx}
                    summaryPlot={this.state.typeView === 2}
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
                if (column.type != "image/png") {
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
                } else {
                    cells.push(
                        <ImageCell
                            value={row.values[cidx]}
                        />
                    )
                }
            }
            rows.push(<tr key={row.id}>{cells}</tr>);
        }

        const returnContent = this.state.typeView !== 3
        ?
        <div className='spreadsheet-container'>
            <div className='spreadsheet-table-container'>
                <table className='spreadsheet'>
                {
                    // Grid header
                    this.state.typeView === 1
                        ?
                        <Headers dataset={dataset} isLoadingPlot={false} />
                        :
                        <Headers dataset={dataset} isLoadingPlot={true} />
                }
                <tbody>{rows}</tbody>
                </table>
            </div>
            <SpreadsheetScrollbar
                dataset={dataset}
                onNavigate={onNavigate}
                cellLimit={userSettings.cellRowLimit()}
            />
        </div>
        : dataset.isProfiled() ? <ColumnView dataset={dataset}/> : <Loader active inline='centered'  content='Loading'  />
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
