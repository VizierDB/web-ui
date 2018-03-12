/**
 * Cell in a data curation workflow.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react'
import { ContentSpinner } from '../../components/util/Spinner'
import { ErrorMessage } from '../../components/util/Message';
import Dataset from './Dataset'
import ModuleOutput from './ModuleOutput'
import '../../../css/Notebook.css'


class NotebookCellOutput extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        datasets: PropTypes.array.isRequired,
        module: PropTypes.object.isRequired,
        outputDataset: PropTypes.object
    }
    constructor(props) {
        super(props)
        this.state = {activeItem: 0}
    }
    handleItemClick = (event, { index }) => {
        const { cell, datasets } = this.props
        this.setState({ activeItem: index })
        if (index > 0) {
            cell.loadDataset(datasets[index - 1])
        } else {
            cell.clearDataset()
        }
    }
    render() {
        const { cell, datasets, module, outputDataset } = this.props
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
                const index = i + 1;
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
            let outputContent = null;
            if (activeItem === 0) {
                outputContent = (
                    <ModuleOutput module={module} />
                );
            } else {
                if (outputDataset) {
                    if (outputDataset.isFetching) {
                        outputContent = <ContentSpinner />
                    } else if (outputDataset.fetchError) {
                        outputContent =
                            <ErrorMessage
                                title='Error while loading dataset'
                                message={outputDataset.fetchError}
                            />
                    } else if (outputDataset.dataset) {
                        outputContent = <Dataset cell={cell} dataset={outputDataset.dataset} />
                    }
                }
                /*const dataset = this.props.output.dataset;
                if (dataset.error !== null) {
                    outputContent = ( <ErrorMessage text={dataset.error} /> );
                } else if (dataset.loading === true) {
                    outputContent = (
                        <div className="centered-spinner">
                            <LoadContentSpinner />
                        </div>
                    )
                } else if (dataset.dataset !== null) {
                    outputContent = (
                        <div>
                            <Dataset
                                data={dataset.dataset.data}
                            />
                            <div className='centered-button'>
                                <Button
                                    size='mini'
                                    circular
                                    icon='download'
                                    onClick={(event) => {
                                        window.open(getReference('download', dataset.dataset.links))
                                    }}
                                />
                            </div>
                        </div>
                    );
                }*/
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
