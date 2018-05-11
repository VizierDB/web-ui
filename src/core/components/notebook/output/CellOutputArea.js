import React from 'react';
import { PropTypes } from 'prop-types';
import { Dimmer, Loader } from 'semantic-ui-react';
import AnnotationObject from '../../annotation/AnnotationObject';
import { IconButton } from '../..//Button';
import { ErrorMessage } from '../../Message';
import DatasetChart from '../../plot/DatasetChart';
import DatasetOutput from './DatasetOutput';
import TextOutput from './TextOutput';
import OutputSelector from './OutputSelector';
import { CONTENT_TEXT, OutputText } from '../../../resources/Notebook';

import '../../../../css/App.css';
import '../../../../css/Notebook.css';


/**
 * Output are for notebook cells that have a workflow module associated with
 * them. The output area is a two column layout. The left column contains the
 * output selector and the right column shows the selected output.
 */
class CellOutputArea extends React.Component {
    static propTypes = {
        activeDatasetCell: PropTypes.object.isRequired,
        module: PropTypes.object.isRequired,
        output: PropTypes.object.isRequired,
        onOutputSelect: PropTypes.func.isRequired,
        onNavigateDataset: PropTypes.func.isRequired,
        onSelectCell: PropTypes.func.isRequired
    };
    /**
     * Discard a displayed annotation.
     */
    handleDiscardAnnotation = () => {
        const { module, output, onSelectCell } = this.props;
        onSelectCell(module, output.content.dataset, -1, -1);
    }
    /**
     * Simulate user selecting console output when dismissing an error message
     * or an ouput resource.
     */
    handleOutputDismiss = () => {
        const { module, onOutputSelect } = this.props;
        onOutputSelect(module, CONTENT_TEXT);
    }
    /**
     * Submit navigate dataset request (should only happen when displaying a
     * dataset in the output area).
     */
    handleNavigateDataset = (url) => {
        const { module, output, onNavigateDataset} = this.props;
        onNavigateDataset(url, module, output.content.name);
    }
    handleSelectCell = (columnId, rowId) => {
        const { module, output, onSelectCell } = this.props;
        const dataset = output.content.dataset;
        if (dataset.hasAnnotations(columnId, rowId)) {
            onSelectCell(module, dataset, columnId, rowId);
        } else {
            onSelectCell(module, dataset, -1, -1);
        }
    }
    render() {
        const { activeDatasetCell, module, output, onOutputSelect } = this.props;
        // Only show an output selector if there are datasets or views, no
        // errors, and fetching is not in progress.
        let outputSelector = null;
        const hasError = (module.stderr.length > 0);
        const hasOutputObjects = ((module.datasets.length > 0) || (module.views.length > 0));
        if ((!hasError) && (output.isFetching !== true) && (hasOutputObjects)) {
            outputSelector = (
                <OutputSelector
                    module={module}
                    output={output}
                    onSelect={onOutputSelect}
                />
            );
        }
        // The output content depends on the state of the output resource
        // handle. First, we distinguish between successful output or error
        // messages
        let outputContent = null;
        if (module.stderr.length > 0) {
            const lines = OutputText(module.stderr).content.lines;
            outputContent = <TextOutput isError={true} lines={lines} />;
        } else {
            if (output.isError()) {
                const fetchError = output.content;
                outputContent = <ErrorMessage
                    title={fetchError.title}
                    message={fetchError.message}
                    onDismiss={this.handleOutputDismiss}
                />;
            } else {
                // Show a 'home' button to switch to standard output
                let homeButton = null;
                if ((!output.isFetching) && (!output.isText())) {
                    homeButton = (
                        <IconButton
                            name='laptop'
                            onClick={this.handleOutputDismiss}
                        />
                    );
                }
                if (output.isText()) {
                    outputContent = <TextOutput isError={false} lines={output.content.lines} />;
                } else if (output.isChart()) {
                    outputContent = (
                        <div className='output-content'>
                            <span className='output-content-header'>
                                {output.content.name}
                            </span>
                            { homeButton}
                            <DatasetChart dataset={output.content.dataset} />
                        </div>
                    );
                } else if (output.isDataset()) {
                    outputContent = (
                        <div className='output-content'>
                            <span className='output-content-header'>
                                {output.content.name}
                            </span>
                            { homeButton}
                            <AnnotationObject
                                annotation={activeDatasetCell}
                                onDiscard={this.handleDiscardAnnotation}
                            />
                            <DatasetOutput
                                activeCell={activeDatasetCell}
                                dataset={output.content.dataset}
                                onNavigate={this.handleNavigateDataset}
                                onSelectCell={this.handleSelectCell}
                            />
                        </div>
                    );
                }
                // Show spinner while fetching the output
                outputContent =  (
                    <Dimmer.Dimmable dimmed={output.isFetching}>
                        <Loader active={output.isFetching}/>
                        {outputContent}
                    </Dimmer.Dimmable>
                );
            }
        }
        // Return two column layout
        return (
            <table className='cell-area'><tbody>
                <tr>
                    <td className='output-selector'>{outputSelector}</td>
                    <td>
                        <div className={'notebook-cell-output'}>{outputContent}</div>
                    </td>
                </tr>
            </tbody></table>
        )
    }
}

export default CellOutputArea;
