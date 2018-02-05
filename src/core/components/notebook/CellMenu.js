/**
 * Menu bar for a notebook cell. Contains the module selector drop down and
 * buttons to run a module, delete the module, create an new branch, insert
 * a new cell (if appropriate).
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown, Icon } from 'semantic-ui-react'
import CommandsDropDown from './CommandsDropDown'
import '../../../css/Notebook.css'


class CellMenu extends React.Component {
    static propTypes = {
        cellModuleComponent: PropTypes.object.isRequired,
        engine: PropTypes.object.isRequired,
        hasModule: PropTypes.bool.isRequired,
        module: PropTypes.object,
        notebookCellComponent: PropTypes.object.isRequired,
    }
    /**
     * Signal the enclosing notebook cell to display the create branch dialog.
     */
    handleBranch = () => {
        const { notebookCellComponent } = this.props
        notebookCellComponent.setBranchAction()
    }
    /**
     * Signal the enclosing notebook cell to display the delete module dialog.
     */
    handleDelete = () => {
        const { notebookCellComponent } = this.props
        notebookCellComponent.setDeleteAction()
    }
    /**
     * Call the submit method of the module form in the cell module component.
     */
    handleSubmit = () => {
        const { cellModuleComponent } = this.props
        cellModuleComponent.handleSubmit()
    }
    render() {
        const { notebookCellComponent, engine, hasModule, module } = this.props
        // The list of action buttons depends on (a) if a module is selected and
        // (b) if the cell represents an existing workflow module.
        let runButton = null
        if (module) {
            runButton = (
                <span key='play' className='play-button'>
                    <Icon
                        name='play'
                        color='blue'
                        link
                        onClick={this.handleSubmit}
                    />
                </span>
            )
        } else {
            runButton = (
                <span key='play' className='play-button'>
                    <Icon
                        name='play'
                        color='grey'
                    />
                </span>
            )
        }
        let options = [];
        if (hasModule) {
            let actionButtons = []
            actionButtons.push(
                <Dropdown.Item
                    key='branch'
                    content='Create branch'
                    icon='fork'
                    onClick={this.handleBranch}
                />
            )
            actionButtons.push(
                <Dropdown.Item
                    key='delete'
                    content='Delete Module'
                    icon='trash'
                    onClick={this.handleDelete}
                />
            )
            options.push(<span key='seperator' className='menu-separator' />)
            options.push(
                <span key='dropdown' className='command-dropdown'>
                    <Dropdown text='Options' floating>
                        <Dropdown.Menu>
                            { actionButtons }
                        </Dropdown.Menu>
                    </Dropdown>
                </span>
            )
        }
        /*<Icon name='trash' link color='red' onClick={() => (alert('Delete'))}/>
        <Icon name='fork' link color='green' onClick={() => (alert('Branch'))}/>*/
        return (
            <div className='cell-menu'>
                { runButton }
                <CommandsDropDown
                    notebookCellComponent={notebookCellComponent}
                    engine={engine}
                    selectedModule={module}
                />
                { options }
            </div>
        )
    }
}

export default CellMenu
