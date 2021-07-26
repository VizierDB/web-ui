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
import {Loader, Menu, Dropdown, Segment} from 'semantic-ui-react';
import ReactMarkdown from 'react-markdown'
import { ApiPolling } from '../../Api';
import DatasetChart from '../../plot/DatasetChart';
import DatasetView from '../../spreadsheet/DatasetView';
import { ErrorMessage } from '../../Message';
import TimestampOutput from './TimestampOutput';
import {
    CONTENT_CHART,
    CONTENT_DATASET,
    CONTENT_TEXT,
    CONTENT_HIDE,
    CONTENT_JAVASCRIPT,
    OutputText,
    CONTENT_TIMESTAMPS, CONTENT_MULTIPLE, CONTENT_MARKDOWN, CONTENT_HTML
} from '../../../resources/Outputs';
import '../../../../css/App.css';
import '../../../../css/Notebook.css';
import {TextButton} from "../../Button";
import Divider from "semantic-ui-react/dist/commonjs/elements/Divider";
import { isCellOutputRequest } from '../../../actions/project/Notebook';
import 'toastr/build/toastr.min.css'
import toastr from 'toastr'
import gfm from 'remark-gfm'
import JavascriptCellOutput from "./JavascriptCellOutput"


/**
 * Output area for notebook cells that have a workflow module associated with
 * them.
 */
class CellOutputArea extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        datasets: PropTypes.object.isRequired,
        onCancelExec: PropTypes.func,
        onCheckStatus: PropTypes.func,
        onFetchAnnotations: PropTypes.func.isRequired,
        onNavigateDataset: PropTypes.func.isRequired,
        onOutputSelect: PropTypes.func.isRequired,
        onSelectCell: PropTypes.func.isRequired,
        userSettings: PropTypes.object.isRequired,
        onEditSpreadsheet: PropTypes.func.isRequired,
        onRecommendAction: PropTypes.func.isRequired,
        apiEngine: PropTypes.object.isRequired
    };
    state = {
        activeTab: null,
        resourceName: null,
        isFetching: false,
        hide: false
    };
    /**
     * Toggle cell fetching state or update the default output
     */
    static getDerivedStateFromProps(nextProps, prevState){
        const newOutput = nextProps.cell.output;
        const datasets = nextProps.datasets;
        if(prevState.isFetching && prevState.activeTab === newOutput.type){
            if(prevState.activeTab === CONTENT_CHART || prevState.activeTab === CONTENT_DATASET){
                if (prevState.resourceName === newOutput.dataset.name || prevState.resourceName === newOutput.name
                 || (prevState.activeTab === CONTENT_DATASET && prevState.resourceName.toLowerCase() === datasets[newOutput.dataset.id].name.toLowerCase())){ // forward compatibility
                    return {
                        isFetching: false
                    }
                }
            } else if(prevState.activeTab === CONTENT_TEXT ||
                prevState.activeTab === CONTENT_MULTIPLE ||
                prevState.activeTab === CONTENT_HIDE ||
                prevState.activeTab === CONTENT_TIMESTAMPS){
                return {
                    isFetching: false
                }
            }
        }
        return {}
    }
    /**
     * Update the cell output state from cell type
     */
    componentDidMount() {
        this.setState({
            activeTab: CONTENT_TEXT,
            resourceName: 'All',
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
        onOutputSelect(cell.module, this.state.activeTab, this.state.resourceName);
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
        const {resourceName} = this.state;
        const element = document.createElement("a");
        const {outputs} = this.getConsoleOutputs(cell.module.outputs.stdout);
        const file = new Blob([JSON.stringify(outputs[resourceName],null,2)], {type: 'text/plain'});
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
        onOutputSelect(cell.module, activeTab, resourceName)
    };
    /**
     * Tracks tab menu selection
     */
    handleItemClick = (e, activeTab, resourceName = null, isFetching = false) => {
        this.setState({
            isFetching: isFetching,
            resourceName: resourceName,
            activeTab: activeTab,
            hide: activeTab === CONTENT_HIDE
        },() => this.fetchData());
    };
    /**
     * Copy embed code to clipboard
     */
    handleCopyEmbedClick = (e) => {
    	const { cell } = this.props;
    	const code = '<iframe width="400" height="400" frameBorder="0" scrolling="no" src="'+window.location+'/?cell-output='+cell.id+'"></iframe>';
    	var input = document.createElement('textarea');
        input.innerHTML = code;
        document.body.appendChild(input);
        input.select();
        var result = document.execCommand('copy');
        document.body.removeChild(input);
        toastr.options = {
            positionClass : 'toast-top-full-width',
            hideDuration: 300,
            timeOut: 5000
        }
        if(result){
    		console.log('copied embed code of output for cell ' +cell.id+' to clipboard')
    		setTimeout(() => toastr.success(`Embed code copied!`), 300)
    	}
        else {
    	    console.log('error copying embed code of output for cell ' +cell.id+' to clipboard')
    	    setTimeout(() => toastr.error(`Embed code copy failed!`), 300)
    	}
    };
    /**
     * Copy embed code to clipboard
     */
    handleCopyURLClick = (e) => {
    	const { cell } = this.props;
    	const code = window.location+'/?cell-output='+cell.id;
    	var input = document.createElement('textarea');
        input.innerHTML = code;
        document.body.appendChild(input);
        input.select();
        var result = document.execCommand('copy');
        document.body.removeChild(input);
        toastr.options = {
            positionClass : 'toast-top-full-width',
            hideDuration: 300,
            timeOut: 5000
        }
        if(result){
    	    console.log('copied url of output for cell ' +cell.id+' to clipboard')
    	    setTimeout(() => toastr.success(`Output URL copied!`), 300)
    	}
        else{
    		console.log('error copying url of output for cell ' +cell.id+' to clipboard')
    		setTimeout(() => toastr.success(`Output URL copy failed!`), 300)
    	}
    };
    /**
     * use cell module output to create console outputs
     */
    getConsoleOutputs = (stdout) => {
        let outputs = {};
        let renders = {};
        const {cell, onSelectCell} = this.props;
        if(stdout.hasOwnProperty('isMultiple') && !stdout.isMultiple()){
            switch (stdout.type) {
                case CONTENT_TEXT: outputs['text/plain']  = stdout.lines.join("\n"); break;
                case CONTENT_HTML: outputs['text/html']  = stdout.lines.join("\n"); break;
                case CONTENT_MARKDOWN: outputs['text/markdown']  = stdout.lines.join("\n"); break;
                case CONTENT_MARKDOWN: outputs['text/markdown']  = stdout.lines.join("\n"); break;
                case CONTENT_JAVASCRIPT: outputs['text/javascript'] = stdout.lines[0]; break;
                default: outputs['text/plain']  = stdout.lines.join("\n"); break;
            }
        }else{
            outputs = cell.output.outputs;
        }
        for (let out in outputs){
            if (out === "text/html"){
                const Response = createReactClass({
                    render: function () {
                        return (
                            <div
                                className='output-content-html'
                                dangerouslySetInnerHTML={{__html: outputs[out]}}
                            />
                        )
                    }
                });
                renders[out] = (
                    <div className='output-content'>
                        <Response/>
                    </div>
                );
            } else if (out === "text/markdown"){
                renders[out] = (
                    <div className='output-content'>
                        <ReactMarkdown
                            plugins={[gfm]} 
    	                    source={outputs[out]}/>
                    </div>
                );
            } else if (out === "text/plain"){
                renders[out] = (
                    <pre className='plain-text' onClick={onSelectCell}>
                            {outputs[out]}
                        </pre>
                )
            } else if (out === "dataset/view"){
                renders[out] = this.getDatasetView(cell.id, outputs[out])
            } else if (out === "chart/view"){
                renders[out] = this.getChartView(outputs[out].data.name, outputs[out].result)
            } else if (out === "text/javascript"){
                renders[out] = 
                    <JavascriptCellOutput html={outputs[out].value.html}
                                          code={outputs[out].value.code}
                                          deps={outputs[out].value.js_deps}
                                          css={outputs[out].value.css_deps}/>
                
            }  else {
                renders[out] = (
                    <pre className='plain-text' onClick={onSelectCell}>
                            {JSON.stringify(outputs[out],null,2)}
                        </pre>
                )
            }
        }
        return {outputs, renders}
    };
    /**
     * Returns a dataset view
     */
    getDatasetView = (id, dataset) => {
        const {onSelectCell, datasets, onNavigateDataset, userSettings, onEditSpreadsheet, onRecommendAction, apiEngine} = this.props;
        try {
            dataset.name = datasets[dataset.id].name;
        }catch (TypeError) {
            // prevent breakage
        }
        return (
            <div className='output-content'>
                <DatasetView
                    dataset={dataset}
                    onNavigate={onNavigateDataset}
                    onFetchAnnotations={this.handleFetchAnnotations}
                    onSelectCell={onSelectCell}
                    userSettings={userSettings}
                    onEditSpreadsheet={onEditSpreadsheet}
                    moduleId={id}
                    downloadLimit={apiEngine.serviceProperties.maxDownloadRowLimit}
                    onRecommendAction={onRecommendAction}
                />
            </div>
        )
    };
    /**
     * Returns a chart view
     */
    getChartView = (name, dataset) => {
        const {onSelectCell} = this.props;
        return <div className='output-content'>
            <DatasetChart
                identifier={name}
                dataset={dataset}
                onSelectCell={onSelectCell}
            />
        </div>
    };
    /**
     * Return Output content depending on Cell menu selection
     */
    getOutputContent = () => {
        const { cell, onSelectCell } = this.props;
        const { resourceName } = this.state;
        let output = cell.output;
        // For cells that are in success or an error state the output depends
        // on the type of the output resource handle.
        // messages
        if (output.isHidden() && !cell.isCanceled()){
            return (
                <pre className='plain-text' onClick={onSelectCell}/>
            );
        }
        if (output.isTimestamps()){
            // Depending on whether the module completed successfully or not
            // the label for the finished at timestamp changes.
            let finishedType = '';
            if (cell.isErrorOrCanceled()) {
                finishedType = 'Canceled at';
            } else {
                finishedType = 'Finished at';
            }
            return (
                <div className='module-timings' onClick={onSelectCell}>
                    <p className='output-info-headline'>
                        <span className='output-info-headline'>
                            Module timings
                        </span>
                    </p>
                    <TimestampOutput label='Created at' time={output.createdAt} />
                    <TimestampOutput label='Started at' time={output.startedAt} />
                    <TimestampOutput label={finishedType} time={output.finishedAt} />
                </div>
            );
        }
        if (output.isDataset()) {
            return this.getDatasetView(cell.id, output.dataset);
        }
        if (output.isChart()) {
            return this.getChartView(output.name, output.dataset);
        }
        if (output.isError()) {
            const fetchError = output.error;
            return <ErrorMessage
                title={fetchError.title}
                message={fetchError.message}
                onDismiss={this.handleOutputDismiss}
            />;
        }
        // If the cell is in error state and it has output written to standard
        // error then we show those lines in an error box. We only show the
        // error messages if the displayed output is console (i.e., either
        // text or html)
        if ((cell.isError())) {
            const {stderr} = cell.module.outputs;
            if (stderr.length > 0) {
                const errorOut = new OutputText(stderr);
                return(
                    <div>
                        <div className='output-error'>
                            <pre className='error-text' onClick={onSelectCell}>
                                {errorOut.lines.join('\n')}
                            </pre>
                        </div>
                    </div>
                );
            }
        }
        const {renders} = this.getConsoleOutputs(output);
        let outputContent = null;
        for( let out in renders ) {
            if((resourceName===out || resourceName==='All') && !cell.isCanceled()){
                outputContent = <div>
                    { outputContent }
                    { outputContent !== null && <Divider horizontal /> }
                    { renders[out] }
                </div>
            }
        }
        // add download link
        return (
            <div className="cell-command-area">
                {outputContent}
                {resourceName !== 'All' && <div className='horizontal-divider'>
                    <TextButton
                        text={'download'}
                        title='Download console output'
                        onClick={this.handleConsoleDownload}
                    />
                </div>}
            </div>);
    };

    render() {
        const {
            cell,
            onCancelExec,
            onCheckStatus,
            isActive
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
                        interval={2000}
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
        } else if (cell.isPending() || isActive) {
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
                        onClick={() => this.handleItemClick({}, CONTENT_DATASET, ds.name, true)}
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
                        onClick={() => this.handleItemClick({}, CONTENT_CHART, chart.name, true)}
                    />
                );
            }
        }
        let consoleItems = cell.module.outputs.stdout.map(x => x.type).filter((v, i, a) => a.indexOf(v) === i);
        let consoleList = [];
        consoleItems.unshift('All')
        for (let type = 0; type < consoleItems.length; type++){
            consoleList.push(
                <Dropdown.Item
                    key={'cl-' + consoleItems[type]}
                    icon='circle'
                    text={consoleItems[type]}
                    title={consoleItems[type]}
                    disabled={this.state.resourceName === consoleItems[type] && this.state.activeTab === CONTENT_TEXT}
                    onClick={() => this.handleItemClick({}, CONTENT_TEXT, consoleItems[type], false)}
                />
            )
        }

        const { activeTab, isFetching } = this.state;
        const cellOutput = isCellOutputRequest();
        let menu = null;
        if(cellOutput){
        	menu = null;
        }
        else{
        	menu = (
	        	<Menu>
		            <Menu.Item
		                icon='hide'
		                title='Hide output for this cell'
		                disabled={this.state.hide}
		                onClick={(e) => this.handleItemClick(e, CONTENT_HIDE, null, true)} />
		            <Dropdown disabled={consoleList.length===0} pointing text = 'Console' className = 'link item'>
		                <Dropdown.Menu>{ consoleList }</Dropdown.Menu>
		            </Dropdown>
		            <Menu.Item
		                name={CONTENT_TIMESTAMPS}
		                active={activeTab === CONTENT_TIMESTAMPS}
		                content='Timing'
		                disabled={this.state.activeTab===CONTENT_TIMESTAMPS}
		                onClick={(e) => this.handleItemClick(e, CONTENT_TIMESTAMPS, null, true)}
		            />
		            <Dropdown disabled={ datasetList.length===0 } pointing text = 'Datasets' className = 'link item'>
		                <Dropdown.Menu>{ datasetList }</Dropdown.Menu>
		            </Dropdown>
		            <Dropdown disabled={chartList.length===0} pointing text = 'Charts' className = 'link item'>
		                <Dropdown.Menu>{ chartList }</Dropdown.Menu>
		            </Dropdown>
		            <div className='cell-output-links'>
		                <Menu.Item
			                icon='copy'
			                title='Copy Embed Code'
			                disabled={false}
			                onClick={(e) => this.handleCopyEmbedClick(e)} />
			            <Menu.Item 
			                icon='linkify'
			                title='Copy Output URL'
			                disabled={false}
			                onClick={(e) => this.handleCopyURLClick(e)} />
			        </div>
		        </Menu>
	        );
        }
        // Show spinner while fetching the output
        return  (
            <div className='output-area'>
                { menu }
                <div className='output-loading'>
                    <Loader active={ isFetching } inline indeterminate/>
                </div>
                {!this.state.hide && <Segment style={{overflow: 'auto', maxHeight: 2000 }}>
                    { !isFetching && this.getOutputContent() }
                </Segment>}
            </div>
        );
    }
}

export default CellOutputArea;