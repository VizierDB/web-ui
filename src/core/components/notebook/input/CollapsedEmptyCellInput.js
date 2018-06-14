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
