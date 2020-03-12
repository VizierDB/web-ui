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
import createReactClass from 'create-react-class';
import { PropTypes } from 'prop-types';
import {Loader, Menu, Dropdown} from 'semantic-ui-react';
import ReactMarkdown from 'react-markdown'
import { ApiPolling } from '../../Api';
import DatasetChart from '../../plot/DatasetChart';
import DatasetView from '../../spreadsheet/DatasetView';
import { ErrorMessage } from '../../Message';
import TimestampOutput from './TimestampOutput';
import {CONTENT_CHART, CONTENT_DATASET, CONTENT_TEXT, OutputText} from '../../../resources/Outputs';
import '../../../../css/App.css';
import '../../../../css/Notebook.css';
import {TextButton} from "../../Button";



/**
 * Output area for notebook cells that have a workflow module associated with
 * them.
 */
class CellOutputArea extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        onCancelExec: PropTypes.func,
        onCheckStatus: PropTypes.func,
        onFetchAnnotations: PropTypes.func.isRequired,
        onNavigateDataset: PropTypes.func.isRequired,
        onOutputSelect: PropTypes.func.isRequired,
        onSelectCell: PropTypes.func.isRequired,
        userSettings: PropTypes.object.isRequired,
        onEditSpreadsheet: PropTypes.func.isRequired
    };
    static TAB_CONSOLE = 'console';
    static TAB_TIMING = 'timing';
    static TAB_DATASETS = 'datasets';
    static TAB_CHARTS = 'charts';
    state = {
        activeTab: null,
        resourceName:null,
        isFetching: false,
        cellDefaultConsoleOutput: null,
        hide: false
    };
    /**
     * Toggle cell fetching state or update the default output
     */
    static getDerivedStateFromProps(nextProps, prevState) {
        const newOutput = nextProps.cell.output;
        let newState = {};
        // ensure that an empty CONTENT_TEXT response is not cached as the default
        if(prevState.cellDefaultConsoleOutput !== null
            && typeof prevState.cellDefaultConsoleOutput.lines !== "undefined"
            && prevState.cellDefaultConsoleOutput.lines.length === 0){
            newState = {
                ...newState,
                cellDefaultConsoleOutput : newOutput
            }
        }
        if(prevState.isFetching &&
            (newOutput.isDataset() && newOutput.dataset.name === prevState.resourceName) ||
            (newOutput.isChart() && newOutput.name === prevState.resourceName)){
            newState = {
                ...newState,
                isFetching: false
            }
        }
        return newState
    }
    /**
     * Update the cell output state from cell type
     */
    componentDidMount() {
        const { cell } = this.props;
        // select default tab
        let activeTab = CellOutputArea.TAB_CONSOLE;
        if (['load','query'].includes(cell.module.command.commandId)){
            activeTab = CellOutputArea.TAB_DATASETS;
        }else if((['chart'].includes(cell.module.command.commandId))){
            activeTab = CellOutputArea.TAB_CHARTS ;
        }

        let resourceName = null;
        if(activeTab === CellOutputArea.TAB_DATASETS && cell.output.isDataset()){
            resourceName = cell.output.dataset.name
        }else if(activeTab === CellOutputArea.TAB_CHARTS && cell.output.isChart()){
            resourceName = cell.output.name
        }
        this.setState({
            activeTab: activeTab,
            resourceName: resourceName,
            // cache the default console output to avoid fetching again
            cellDefaultConsoleOutput: cell.output
        });
    }
    /**
     * Discard a displayed annotation (by clearing the selected cell
     * annotations).
     */
    handleDiscardAnnotation = () => {
        this.handleSelectCell(-1, -1);
    }
    /**
     * Show console output when user dismisses an error message.
     */
    handleOutputDismiss = () => {
        const { cell, onOutputSelect } = this.props;
        onOutputSelect(cell.module, CONTENT_TEXT);
    }
    /**
     * Show spreadsteeh cell annotations when the user clicks on a table cell.
     */
    handleFetchAnnotations = (columnId, rowId) => {
        const { cell, onFetchAnnotations } = this.props;
        const { output, module } = cell;
        const dataset = output.dataset;
        onFetchAnnotations(module, dataset, columnId, rowId);
    }
    /**
     * Download the output in the console as a text file
     */
    handleConsoleDownload = () => {
        const {cell} = this.props;
        const element = document.createElement("a");
        const file = new Blob([JSON.stringify(cell.module.outputs.stdout[0].value, null, 4)], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = cell.id;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    };
    /**
     * Fetches outputs from the API
     */
    fetchData = () => {
        const { cell, onOutputSelect } = this.props;
        const { activeTab, resourceName } = this.state;
        if(resourceName !== null){
            switch(activeTab){
                case CellOutputArea.TAB_DATASETS: onOutputSelect(cell.module, CONTENT_DATASET, resourceName);
                case CellOutputArea.TAB_CHARTS: onOutputSelect(cell.module, CONTENT_CHART, resourceName);
            }
        }
    };
    /**
     * Tracks tab menu selection
     */
    handleItemClick = (e, activeTab, resourceName = null, isFetching = false) => {
        this.setState({
            isFetching: isFetching,
            resourceName: resourceName,
            activeTab: activeTab,
            hide: false
        },() => this.fetchData());
    };
    /**
     * Hide cell output
     */
    handleOutputHide = () => {
        this.setState({
            hide: true,
            activeTab: null,
            resourceName: null
        })
    }
    /**
     * Return Output content depending on Cell menu selection
     */
    getOutputContent = () => {
        const { cell, onSelectCell, onNavigateDataset, userSettings, onEditSpreadsheet } = this.props;
        const { activeTab, cellDefaultConsoleOutput } = this.state
        if(activeTab === CellOutputArea.TAB_TIMING){
            // Depending on whether the module completed successfully or not
            // the label for the finished at timestamp changes.
            let finishedType = '';
            if (cell.isErrorOrCanceled()) {
                finishedType = 'Canceled at';
            } else {
                finishedType = 'Finished at';
            }
            let timingContent = (
                <div className='module-timings' onClick={onSelectCell}>
                    <p className='output-info-headline'>
                        <span className='output-info-headline'>
                            Module timings
                        </span>
                    </p>
                    <TimestampOutput label='Created at' time={cell.module.timestamps.createdAt} />
                    <TimestampOutput label='Started at' time={cell.module.timestamps.startedAt} />
                    <TimestampOutput label={finishedType} time={cell.module.timestamps.finishedAt} />
                </div>
            );
            return timingContent
        }
        // For cells that are in success or an error state the output depends
        // on the type of the output resource handle.
        // messages
        let outputContent = null;
        if (activeTab === CellOutputArea.TAB_CONSOLE){
            let output = cellDefaultConsoleOutput ; // use default cached output response
            if (output.isError()) {
                const fetchError = output.error;
                outputContent = <ErrorMessage
                    title={fetchError.title}
                    message={fetchError.message}
                    onDismiss={this.handleOutputDismiss}
                />;
            } else if ((output.isHidden()) && (!cell.isCanceled())) {
                outputContent = (
                    <pre className='plain-text' onClick={onSelectCell}/>
                );
            } else if (output.isMultiple()) {
                // todo: read objects in output array
            } else {
                const {stdout} = cell.module.outputs;
                if (stdout !== null && stdout.length > 0) {
                    const out = stdout[0]
                    if (out["type"] === "text/html") {
                        const Response = createReactClass({
                            render: function () {
                                return (
                                    <div
                                        className='output-content-html'
                                        dangerouslySetInnerHTML={{__html: out["value"]}}
                                    />
                                )
                            }
                        });
                        outputContent = (
                            <div className='output-content'>
                            <span className='output-content-header'>
                                {stdout["name"]}
                            </span>
                                <Response/>
                            </div>
                        );
                    } else if (out["type"] === "text/markdown") {
                        outputContent = (
                            <div className='output-content'>
                                <span className='output-content-header'>
                                    {out["name"]}
                                </span>
                                <ReactMarkdown
                                    source={out["value"]}/>
                            </div>
                        );
                    } else if ((out["type"] === "text/plain") && (!cell.isCanceled())) {
                        outputContent = (
                            <pre className='plain-text' onClick={onSelectCell}>
                            {out["value"]}
                        </pre>
                        )
                    }
                }
                // If the cell is in error state and it has output written to standard
                // error then we show those lines in an error box. We only show the
                // error messages if the displayed output is console (i.e., either
                // text or html)
                if ((cell.isError())) {
                    const stderr = cell.module.outputs.stderr;
                    if (stderr.length > 0) {
                        const errorOut = new OutputText(stderr);
                        outputContent = (
                            <div>
                                {outputContent}
                                <div className='output-error'>
                                <pre className='error-text' onClick={onSelectCell}>
                                    {errorOut.lines.join('\n')}
                                </pre>
                                </div>
                            </div>
                        );
                    }
                }
            }
        }else if (activeTab === CellOutputArea.TAB_DATASETS) {
            if (cell.output.isDataset()) {
                const dataset = cell.output.dataset;
                outputContent = (
                    <div className='output-content'>
                        <DatasetView
                            dataset={dataset}
                            onNavigate={onNavigateDataset}
                            onFetchAnnotations={this.handleFetchAnnotations}
                            onSelectCell={onSelectCell}
                            userSettings={userSettings}
                            onEditSpreadsheet={onEditSpreadsheet}
                            moduleId={cell.id}
                        />
                    </div>
                );
            }
        }else if (activeTab === CellOutputArea.TAB_CHARTS){
            if (cell.output.isChart()) {
                outputContent = (
                    <div className='output-content'>
                        <DatasetChart
                            identifier={cell.output.name}
                            dataset={cell.output.dataset}
                            onSelectCell={onSelectCell}
                        />
                    </div>
                );
            }
        }
        outputContent = (
            <div className="cell-command-area">
                {outputContent}
                <div className='horizontal-divider'>
                    <TextButton
                        text={'download'}
                        title='Download console output'
                        onClick={this.handleConsoleDownload}
                    />
                </div>
            </div>);
        return outputContent;
    };
    render() {
        const {
            cell,
            onCancelExec,
            onCheckStatus,
        } = this.props;
        const { output } = cell;
        // The output content depends on the status of the cell. For running and
        // pending cells only timestamps (and a cancel button) is displayed.
        // If there has been an error we do not show the cancel button in order
        // to avoid continuous polling.
        let cancelButton = null;
        if (onCancelExec != null) {
            if (!output.isError()) {
                cancelButton = (
                    <ApiPolling
                        interval={1000}
                        onCancel={onCancelExec}
                        onFetch={onCheckStatus}
                        resource={cell}
                        text={cell.isRunning() ? 'Running ...' : 'Pending ...'}
                    />
                );
            } else {
                const fetchError = output.error;
                cancelButton =(
                    <div className='output-error'>
                        <ErrorMessage
                            title={fetchError.title}
                            message={fetchError.message}
                        />
                    </div>
                );
            }
        }
        if (cell.isRunning()) {
            return (
                <div>
                    <div className='module-timings'>
                        <TimestampOutput label='Created at' time={cell.module.timestamps.createdAt} />
                        <TimestampOutput label='Started at' time={cell.module.timestamps.startedAt} />
                    </div>
                    { cancelButton }
                </div>
            );
        } else if (cell.isPending()) {
            return (
                <div>
                    <div className='module-timings'>
                        <TimestampOutput label='Created at' time={cell.module.timestamps.createdAt} />
                    </div>
                    { cancelButton }
                </div>
            );
        }
        let datasetList = [];
        if (cell.module.datasets.length > 0) {
            for (let i = 0; i < cell.module.datasets.length; i++) {
                const ds = cell.module.datasets[i];
                datasetList.push(
                    <Dropdown.Item
                        key={'ds-' + ds.name}
                        icon='table'
                        text={ds.name}
                        title={ds.name}
                        disabled={this.state.resourceName===ds.name && cell.output.isDataset()}
                        onClick={() => this.handleItemClick({}, CellOutputArea.TAB_DATASETS, ds.name, true)}
                    />
                );
            }
        }
        let chartList = [];
        if (cell.module.charts.length > 0) {
            for (let i = 0; i < cell.module.charts.length; i++) {
                const chart = cell.module.charts[i];
                chartList.push(
                    <Dropdown.Item
                        key={'vw-' + chart.name}
                        icon='bar chart'
                        text={chart.name}
                        title={chart.name}
                        disabled={this.state.resourceName===chart.name && cell.output.isChart()}
                        onClick={() => this.handleItemClick({}, CellOutputArea.TAB_CHARTS, chart.name, true)}
                    />
                );
            }
        }

        const { activeTab, isFetching } = this.state;
        const menu = <Menu>
            <Menu.Item
                icon='hide'
                key='hide'
                text='Hide'
                title='Hide output for this cell'
                disabled={this.state.hide}
                onClick={this.handleOutputHide} />
            <Menu.Item
                name={CellOutputArea.TAB_CONSOLE}
                active={activeTab === CellOutputArea.TAB_CONSOLE}
                content='Console'
                disabled={this.state.activeTab===CellOutputArea.TAB_CONSOLE}
                onClick={(e, {name}) => this.handleItemClick(e, name)}
            />
            <Menu.Item
                name={CellOutputArea.TAB_TIMING}
                active={activeTab === CellOutputArea.TAB_TIMING}
                content='Timing'
                disabled={this.state.activeTab===CellOutputArea.TAB_TIMING}
                onClick={(e, {name}) => this.handleItemClick(e, name)}
            />
            <Dropdown disabled={datasetList.length===0} pointing text = 'Datasets' className = 'link item'>
                <Dropdown.Menu>{ datasetList }</Dropdown.Menu>
            </Dropdown>
            <Dropdown disabled={chartList.length===0} pointing text = 'Charts' className = 'link item'>
                <Dropdown.Menu>{ chartList }</Dropdown.Menu>
            </Dropdown>
        </Menu>;
        // Show spinner while fetching the output
        return  (
            <div className='output-area'>
                { menu }
                <div className='output-loading'>
                    <Loader active={ isFetching } inline indeterminate/>
                </div>
                { this.getOutputContent() }
            </div>
        );
    }
}

export default CellOutputArea;