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

import React from 'react'
import PropTypes from 'prop-types'
import { Checkbox } from 'semantic-ui-react'
import '../../../../../css/ModuleForm.css';

/**
* Checkbox for boolean input
*/

class BoolInput extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        value: PropTypes.bool,
        onChange: PropTypes.func.isRequired
    }
    handleChange = (e, { checked }) => {
        const { id, onChange } = this.props
        onChange(id, checked)
    }
    render() {
        const { value } = this.props
        return (
            <span className='boolctrl'>
                <Checkbox checked={value === undefined ? false : value} onChange={this.handleChange}/>
            </span>
        );
    }
}
/*<Form.Checkbox
    checked={value}
    onChange={this.handleChange}
/>*/

export default BoolInput
