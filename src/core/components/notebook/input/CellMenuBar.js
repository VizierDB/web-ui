/**
 * Menu bar for a notebook cell. Contains the module selector drop down and
 * buttons to run a module, delete the module, create an new branch, insert
 * a new cell (if appropriate).
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'
import CommandsDropDown from './listing/CommandsDropDown'
import '../../../../css/CellMenuBar.css'


class CellMenuBar extends React.Component {
    static propTypes = {
        env: PropTypes.object.isRequired,
        module: PropTypes.object,
        selectedCommand: PropTypes.object.isRequired,
        onCreateBranch: PropTypes.func,
        onDeleteModule: PropTypes.func,
        onSelect: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired
    }
    /**
     * Callback handler when "create branch' button is clicked.
     */
    handleCreateBranch = () => {
        const { onCreateBranch } = this.props;
        onCreateBranch();
    }
    /**
     * Callback handler when user clicks 'Delete module' button.
     */
    handleDeleteModule = () => {
        const { onDeleteModule } = this.props;
        onDeleteModule();
    }
    /**
     * Callback handler to submitt the associated input form.
     */
    handleSubmit = () => {
        const { onSubmit } = this.props;
        onSubmit();
    }
    render() {
        const { env, module, selectedCommand, onSelect } = this.props
        const hasModule = (module != null);
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
                    disabled={selectedCommand === null}
                />
            </span>
        )
        let optionButtons = null;
        if (hasModule) {
            optionButtons = (
                <span className='option-buttons'>
                    <span className='branch-button'>
                        <Button
                            key='branch'
                            icon='fork'
                            circular
                            size='small'
                            color='green'
                            onClick={this.handleCreateBranch}
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
                            onClick={this.handleDeleteModule}
                            disabled={!hasModule}
                        />
                    </span>
                </span>
            );
        }
        return (
            <div className='cell-input-menu'>
                <CommandsDropDown
                    env={env}
                    selectedCommand={selectedCommand}
                    onSelect={onSelect}
                />
                { runButton }
                { optionButtons }
            </div>
        )
    }
}

export default CellMenuBar
