/**
 * Cell in a data curation workflow.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react'
import { ContentSpinner } from '../../components/util/Spinner'
import { ErrorMessage } from '../../components/util/Message';
import Dataset from './Dataset'
import DatasetChart from '../plot/DatasetChart'
import ModuleOutput from './ModuleOutput'
import '../../../css/Notebook.css'


class NotebookCellOutput extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        datasets: PropTypes.array.isRequired,
        module: PropTypes.object.isRequired,
        outputResource: PropTypes.object
    }
    constructor(props) {
        super(props)
        // Check if the only output item is a chart view. If not display
        // module output text.
        this.state = {activeItem: 0}
    }
    handleItemClick = (event, { index }) => {
        const { cell, datasets, module } = this.props
        this.setState({ activeItem: index })
        if (index > datasets.length) {
            cell.loadDatasetChart(module.views[index - datasets.length - 1])
        } else if (index > 0) {
            cell.loadDataset(datasets[index - 1])
        } else {
            cell.clearDataset()
        }
    }
    render() {
        const { cell, datasets, module, outputResource } = this.props
        const { activeItem } = this.state
        let content = null
        if (module.stderr.length > 0) {
            // In case of an error simply show the output lines that have been
            // written to standard output and error during module execution.
            content = <ModuleOutput module={module} />
        } else {
            // Show a menu that allows the user to switch between module output
            // and viewing one of the available datasets
            const menuItems = [<Menu.Item
                key={0}
                name={'Output'}
                icon={'content'}
                index={0}
                active={activeItem === 0}
                onClick={this.handleItemClick} />
            ];
            for (let i = 0; i < datasets.length; i++) {
                const dataset = datasets[i];
                const index = menuItems.length;
                menuItems.push(
                    <Menu.Item
                        key={index}
                        name={dataset.name}
                        icon={'table'}
                        index={index}
                        active={activeItem === index}
                        onClick={this.handleItemClick}
                    />
                );
            }
            const views = module.views
            if (views.length > 0) {
                for (let i = 0; i < views.length; i++) {
                    const view = views[i];
                    const index = menuItems.length;
                    menuItems.push(
                        <Menu.Item
                            key={index}
                            name={view.name}
                            icon={'bar chart'}
                            index={index}
                            active={activeItem === index}
                            onClick={this.handleItemClick}
                        />
                    );
                }
            }
            let outputContent = null;
            if (activeItem === 0) {
                    outputContent = (
                        <ModuleOutput module={module} />
                    );
            } else {
                if (outputResource) {
                    if (outputResource.isFetching) {
                        outputContent = <ContentSpinner />
                    } else if (outputResource.fetchError) {
                        outputContent =
                            <ErrorMessage
                                title='Error while fetching data'
                                message={outputResource.fetchError}
                            />
                    } else if (outputResource.resource) {
                        if (outputResource.isDataset()) {
                            const dataset = outputResource.resource
                            outputContent = <Dataset cell={cell} dataset={dataset} />
                        } else if (outputResource.isChartView()) {
                            const view = outputResource.resource
                            outputContent = <DatasetChart
                                rows={view.rows}
                                schema={view.schema} />
                        }
                    }
                }
            }
            content = (
                <div>
                    <Menu pointing secondary size='mini'>
                        { menuItems }
                    </Menu>
                    { outputContent }
                </div>
            )
        }
        return (
            <div className={'notebook-cell-output'}>
                { content }
            </div>
        );
    }
}

export default NotebookCellOutput;
