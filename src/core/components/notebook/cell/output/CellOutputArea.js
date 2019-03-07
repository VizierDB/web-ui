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
import { Dimmer, Icon, Loader } from 'semantic-ui-react';
import DatasetChart from '../../../plot/DatasetChart';
import DatasetView from '../../../spreadsheet/DatasetView';
import { ErrorMessage } from '../../../Message';
import TimestampOutput from './TimestampOutput';
import { CONTENT_TEXT } from '../../../../resources/Notebook';
import '../../../../../css/App.css';
import '../../../../../css/Notebook.css';



/**
 * Output area for notebook cells that have a workflow module associated with
 * them.
 */
class CellOutputArea extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        onNavigateDataset: PropTypes.func.isRequired,
        onOutputSelect: PropTypes.func.isRequired,
        onFetchAnnotations: PropTypes.func.isRequired,
        onTextOutputClick: PropTypes.func.isRequired,
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
            onNavigateDataset,
            onTextOutputClick,
            userSettings
        } = this.props;
        const { output } = cell;
        // The output content depends on the state of the output resource
        // handle. First, we distinguish between successful output or error
        // messages
        let outputContent = null;
        if (output.isChart()) {
            outputContent = (
                <div className='output-content'>
                    <DatasetChart
                        identifier={output.name}
                        dataset={output.dataset}
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
        } else if (output.isText()) {
            outputContent = (
                <pre className='plain-text' onClick={onTextOutputClick}>
                    {output.lines.join('\n')}
                </pre>
            );
        } else if (output.isTimestamps()) {
            outputContent = (
                <div>
                    <p className='output-info-headline'><Icon color='blue' name='info circle' />Module execution times</p>
                    <TimestampOutput label='Created at' time={output.createdAt} />
                    <TimestampOutput label='Started at' time={output.startedAt} />
                    <TimestampOutput label='Finished at' time={output.finishedAt} />
                </div>
            );
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
