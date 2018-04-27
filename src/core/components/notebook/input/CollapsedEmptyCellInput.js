import React from 'react';
import { PropTypes } from 'prop-types';
import { Divider } from 'semantic-ui-react'
import { IconButton, LargeMessageButton } from '../../../components/Button'
import '../../../../css/Notebook.css'


/**
 * Collapsed input area for an empty notebook cell. Content depends on whether
 * the notebook is empty of not. For empty notebooks a message is shown,
 * otherwise a simple divider with expand button.
 */
class CollapsedEmptyCellInput extends React.Component {
    static propTypes = {
        isEmptyNotebook: PropTypes.bool.isRequired,
        onExpand: PropTypes.func.isRequired
    }
    render() {
        const { isEmptyNotebook, onExpand } = this.props;
        if (isEmptyNotebook) {
            return (
                <LargeMessageButton
                    message='Your notebook is empty. Start by adding a new cell.'
                    icon='plus'
                    css='notebook-footer'
                    onClick={onExpand}
                />
            );
        } else {
            return (
                <Divider horizontal>
                    <IconButton
                        name='plus-square-o'
                        onClick={onExpand}
                    />
                </Divider>
            );
        }
    }
}

export default CollapsedEmptyCellInput;
