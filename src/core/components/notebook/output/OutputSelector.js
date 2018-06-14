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
        let selectorIcon = 'desktop';
        if (output != null) {
            if (output.isText()) {
                selectedKey = 'stdout';
            } else if (output.isDataset()) {
                selectedKey = 'ds-' + output.content.name;
                selectorIcon = 'table';
            } else if (output.isChart()) {
                selectedKey = 'vw-' + output.content.name;
                selectorIcon = 'bar chart';
            }
        }
        // Create list of dropdon menu items
        const dropdownItems = [];
        dropdownItems.push(<Dropdown.Header key='console' content='Console' />);
        dropdownItems.push(
            <Dropdown.Item
                key='stdout'
                icon='desktop'
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
                <Dropdown icon={selectorIcon} title='Select output'>
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
