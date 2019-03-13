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
import { Dimmer, Loader } from 'semantic-ui-react';
import { ApiPolling } from '../../Api';
import DatasetChart from '../../plot/DatasetChart';
import DatasetView from '../../spreadsheet/DatasetView';
import { ErrorMessage } from '../../Message';
import TimestampOutput from './TimestampOutput';
import { CONTENT_TEXT, OutputText } from '../../../resources/Outputs';
import '../../../../css/App.css';
import '../../../../css/Notebook.css';



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
        userSettings: PropTypes.object.isRequired
    };
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
    render() {
        const {
            cell,
            onCancelExec,
            onCheckStatus,
            onNavigateDataset,
            onSelectCell,
            userSettings
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
        // For cells that are in success or an error state the output depends
        // on the type of the output resource handle.
        // messages
        let outputContent = null;
        if (output.isChart()) {
            outputContent = (
                <div className='output-content'>
                    <DatasetChart
                        identifier={output.name}
                        dataset={output.dataset}
                        onSelectCell={onSelectCell}
                    />
                </div>
            );
        } else if (output.isDataset()) {
            const dataset = output.dataset;
            outputContent = (
                <div className='output-content'>
                    <DatasetView
                        dataset={dataset}
                        onNavigate={onNavigateDataset}
                        onFetchAnnotations={this.handleFetchAnnotations}
                        onSelectCell={onSelectCell}
                        userSettings={userSettings}
                    />
                </div>
            );
        } else if (output.isError()) {
            const fetchError = output.error;
            outputContent = <ErrorMessage
                title={fetchError.title}
                message={fetchError.message}
                onDismiss={this.handleOutputDismiss}
            />;
        } else if ((output.isHidden()) && (!cell.isCanceled())) {
            outputContent = (
                <pre className='plain-text' onClick={onSelectCell} />
            );
        } else if (output.isHtml()) {
            const Response = createReactClass({
                render: function() {
                	return (
                        <div
                            className='output-content-html'
                            dangerouslySetInnerHTML={{__html: output.lines}}
                        />
                    )
                }
            });
        	outputContent = (
                <div className='output-content'>
                    <span className='output-content-header'>
                        {output.name}
                    </span>
                    <Response />
                </div>
            );
        } else if ((output.isText()) && (!cell.isCanceled())) {
            outputContent = (
                <pre className='plain-text' onClick={onSelectCell}>
                    {output.lines.join('\n')}
                </pre>
            );
        } else if (output.isTimestamps()) {
            // Depending on whether the module completed successfully or not
            // the label for the finished at timestamp changes.
            let finishedType = '';
            if (cell.isErrorOrCanceled()) {
                finishedType = 'Canceled at';
            } else {
                finishedType = 'Finished at';
            }
            outputContent = (
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
        // If the cell is in error state and it has output written to standard
        // error then we show those lines in an error box. We only show the
        // error messages if the displayed output is console (i.e., either
        // text or html)
        if ((cell.isError()) && ((output.isHtml()) || (output.isText()))) {
            const stderr = cell.module.outputs.stderr;
            if (stderr.length > 0) {
                const errorOut = new OutputText(stderr);
                outputContent = (
                    <div>
                        { outputContent }
                        <div className='output-error'>
                            <pre className='error-text' onClick={onSelectCell}>
                                {errorOut.lines.join('\n')}
                            </pre>
                        </div>
                    </div>
                );
            }
        }
        // Show spinner while fetching the output
        return  (
            <div className='output-area'>
                <Dimmer.Dimmable dimmed={output.isFetching}>
                    <Loader active={output.isFetching}/>
                    {outputContent}
                </Dimmer.Dimmable>
            </div>
        );
    }
}

export default CellOutputArea;
