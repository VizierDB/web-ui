/**
 * Menu bar for a notebook cell. Contains the module selector drop down and
 * buttons to run a module, delete the module, create an new branch, insert
 * a new cell (if appropriate).
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'
import CommandsDropDown from './CommandsDropDown'
import '../../../css/Notebook.css'


class CellMenu extends React.Component {
    static propTypes = {
        cellModuleComponent: PropTypes.object.isRequired,
        env: PropTypes.object.isRequired,
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
        const { notebookCellComponent, env, hasModule, module } = this.props
        // The list of action buttons depends on (a) if a module is selected and
        // (b) if the cell represents an existing workflow module.
        const runButton = (
            <span className='run-button'>
                <Button
                    key='run'
                    icon='play'
                    circular
                    size='small'
                    primary
                    onClick={this.handleSubmit}
                    disabled={module === null}
                />
            </span>
        )
        const optionButtons = (
            <span className='option-buttons'>
                <span className='branch-button'>
                    <Button
                        key='branch'
                        icon='fork'
                        circular
                        size='small'
                        color='green'
                        onClick={this.handleBranch}
                        disabled={!hasModule}
                    />
                </span>
                <span className='delete-button'>
                    <Button
                        key='delete'
                        icon='trash'
                        circular
                        size='small'
                        negative
                        onClick={this.handleDelete}
                        disabled={!hasModule}
                    />
                </span>
            </span>
        );
        return (
            <div className='cell-menu'>
                <CommandsDropDown
                    notebookCellComponent={notebookCellComponent}
                    env={env}
                    selectedModule={module}
                />
                { runButton }
                { optionButtons }
            </div>
        )
    }
}

export default CellMenu
