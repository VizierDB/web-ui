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
import { pageUrl } from '../../util/App';
import DatasetReason from './DatasetReason';
import '../../../css/DatasetError.css';

/**
 * Display a list of dataset errors detected by mimir 
 */
class DatasetError extends React.Component {
    static propTypes = {
        dataset: PropTypes.object.isRequired,
        annotations: PropTypes.object.isRequired,
        onGotoError: PropTypes.func.isRequired,
        onRepairError: PropTypes.func.isRequired
    }
    /**
     * 
     */
    render() {
        const { dataset, annotations, onGotoError, onRepairError } = this.props;
        const errors = [];
        const ackedErrors = [];
        for (let i = 0; i < annotations.items.length; i++) {
            const errs = annotations.items[i];
            if(errs.value.confirmed){
            	ackedErrors.push(
	        		<DatasetReason
	            		reason={errs}
	        			onGotoError={onGotoError(dataset)}
	        			onRepairError={onRepairError(dataset)}
	            	/>
	            )
            }
            else{
	            errors.push(
	        		<DatasetReason
	            		reason={errs}
	        			onGotoError={onGotoError(dataset)}
	        			onRepairError={onRepairError(dataset)}
	            	/>
	            )
            }
        }
        return (
            <div className='dataset-errors'>
                <h3 className='dataset-errors'>
                    {'Dataset Error List: '}
                    <span className='error-highlight'>{dataset.name}</span>
                </h3>
                {errors}
                {ackedErrors}
            </div>
        );
    }
}

export default DatasetError;