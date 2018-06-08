/**
 * Dropdown menu for a notebook. The menu allow the user to reverse the order
 * of notebook cells and to switch the group mode for VizUAL cells.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import { GRP_COLLAPSE, GRP_HIDE, GRP_SHOW } from '../../../resources/Notebook';

class NotebookMenuDropdown extends React.Component {
    static propTypes = {
        groupMode: PropTypes.number.isRequired,
        onChangeGrouping: PropTypes.func.isRequired,
        onReverse: PropTypes.func.isRequired
    }
    /**
     * Handle click on a 'Change grouping' menu item.
     */
    handleChangeGrouping = (e, { value }) => {
        const { onChangeGrouping } = this.props;
        onChangeGrouping(value);
    }
    render() {
        const { groupMode, onReverse } = this.props;
        return (
            <Dropdown item text='Notebook'>
                <Dropdown.Menu>
                    <Dropdown.Header content='Notebook Cells' />
                    <Dropdown.Item
                        key='reverse'
                        icon='sort'
                        text='Reverse Order'
                        onClick={onReverse}
                    />
                    <Dropdown.Divider />
                    <Dropdown.Header content='VizUAL Commands' />
                    <Dropdown.Item
                        key='show'
                        icon='eye'
                        text='Show'
                        disabled={groupMode === GRP_SHOW}
                        value={GRP_SHOW}
                        onClick={this.handleChangeGrouping}
                    />
                    <Dropdown.Item
                        key='collapse'
                        icon='compress'
                        text='Collapse'
                        disabled={groupMode === GRP_COLLAPSE}
                        value={GRP_COLLAPSE}
                        onClick={this.handleChangeGrouping}
                    />
                    <Dropdown.Item
                        key='hide'
                        icon='hide'
                        text='Hide'
                        disabled={groupMode === GRP_HIDE}
                        value={GRP_HIDE}
                        onClick={this.handleChangeGrouping}
                    />
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

export default NotebookMenuDropdown;
