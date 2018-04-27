/**
 * Cell in a data curation workflow.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import { CONTENT_CHART, CONTENT_DATASET, CONTENT_TEXT } from '../../../resources/Notebook';
import '../../../../css/Notebook.css'


/**
 * Dropdown that allows to select the output that is shown for a notebook cell.
 */
class OutputSelector extends React.Component {
    static propTypes = {
        module: PropTypes.object.isRequired,
        output: PropTypes.object.isRequired,
        onSelect: PropTypes.func.isRequired
    }
    render() {
        const { module, output } = this.props
        // Determine the key of the selected output to disable the
        // respective menu entry.
        let selectedKey = null;
        if (output != null) {
            if (output.isText()) {
                selectedKey = 'stdout';
            } else if (output.isDataset()) {
                selectedKey = 'ds-' + output.content.name;
            } else if (output.isChart()) {
                selectedKey = 'vw-' + output.content.name;
            }
        }
        // Create list of dropdon menu items
        const dropdownItems = [];
        dropdownItems.push(<Dropdown.Header key='console' content='Console' />);
        dropdownItems.push(
            <Dropdown.Item
                key='stdout'
                icon='laptop'
                text='Standard Output'
                disabled={selectedKey === 'stdout'}
                onClick={this.handleSelectStdout}
            />
        );
        // Show dataset options if datasets are present in output
        if (module.datasets.length > 0) {
            dropdownItems.push(<Dropdown.Divider key='div1'/>);
            dropdownItems.push(<Dropdown.Header key='dataset'content='Dataset' />);
            for (let i = 0; i < module.datasets.length; i++) {
                const ds = module.datasets[i];
                dropdownItems.push(
                    <Dropdown.Item
                        key={'ds-' + ds.name}
                        icon='table'
                        text={ds.name}
                        value={ds.name}
                        disabled={selectedKey === 'ds-' + ds.name}
                        onClick={this.handleSelectDataset}
                    />
                );
            }
        }
        // Show chart options if chart views are present in output
        if (module.views.length > 0) {
            dropdownItems.push(<Dropdown.Divider key='div2'/>);
            dropdownItems.push(<Dropdown.Header key='chart' content='Chart' />);
            for (let i = 0; i < module.views.length; i++) {
                const view = module.views[i];
                dropdownItems.push(
                    <Dropdown.Item
                        key={'vw-' + view.name}
                        icon='bar chart'
                        text={view.name}
                        value={view.name}
                        disabled={selectedKey === 'vw-' + view.name}
                        onClick={this.handleSelectChart}
                    />
                );
            }
        }
        return (
            <div className={'output-selector'}>
                <Dropdown icon='bars'>
                    <Dropdown.Menu>{dropdownItems}</Dropdown.Menu>
                </Dropdown>
            </div>
        );
    }
    /**
     * Handle event when user selects a chart view for display.
     */
    handleSelectChart = (e, { value }) => {
        const { module, onSelect } = this.props;
        onSelect(module, CONTENT_CHART, value);
    }
    /**
     * Handle event when user selects a dataset for display.
     */
    handleSelectDataset = (e, { value }) => {
        const { module, onSelect } = this.props;
        onSelect(module, CONTENT_DATASET, value);
    }
    /**
     * Handle event when user selects a standard output for display.
     */
    handleSelectStdout = () => {
        const { module, onSelect } = this.props;
        onSelect(module, CONTENT_TEXT);
    }
}

export default OutputSelector;
