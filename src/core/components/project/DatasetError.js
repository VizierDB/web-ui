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
import { Icon } from 'semantic-ui-react';
import { pageUrl } from '../../util/App'
import '../../../css/DatasetError.css'

/**
 * Display a list of dataset errors detected by mimir 
 */
class DatasetError extends React.Component {
    static propTypes = {
        dataset: PropTypes.object.isRequired,
        annotations: PropTypes.object.isRequired
    }
    /**
     * 
     */
    render() {
        const { dataset, annotations } = this.props;
        const rows = [];
        for (let i = 0; i < annotations.length; i++) {
            const errs = annotations[i];
            //dispatch(fetchAnnotations(dataset, "", ""));
        	
            const link = dataset.links.self+'/annotations';
            let icon = 'error';
            
            rows.push(
                <tr key={errs.row}>
                    <td><Icon name={icon} /></td>
                    <td className='error-statement'>
                        <a className={'error-link'} href={link}>json</a>
                    </td>
                    <td className='error-row'>{errs}</td>
                </tr>
            )
        }
        return (
            <div className='dataset-errors'>
                <h1 className='dataset-errors'>
                    {'Dataset Error'}
                    <span className='error-highlight'>{dataset.name}</span>
                </h1>
                <table><tbody>{rows}</tbody></table>
            </div>
        );
    }
}

export default DatasetError;
