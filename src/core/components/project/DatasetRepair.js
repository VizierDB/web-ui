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
import { Icon, Dropdown, Form } from 'semantic-ui-react';
import { showSpreadsheet } from '../../actions/spreadsheet/Spreadsheet';
import '../../../css/DatasetError.css'

/**
 * Display a list of dataset errors detected by mimir 
 */
class DatasetRepair extends React.Component {
    static propTypes = {
        reason: PropTypes.object.isRequired,
        onRepairError: PropTypes.func.isRequired
    }
    
    constructor(props) {
        super(props);
        this.state = {expanded: false, repairValue: '' }
    }
    
    handleExpand = () => {
    	const { expanded } = this.state;
    	this.setState({expanded:!expanded})
    }
    
    handleRepairError = (acknowledge) => (event) => {
    	const { onRepairError, reason } = this.props;
    	const { repairValue } = this.state;
    	onRepairError(reason.value, repairValue, acknowledge);
    }
    
    handleRepairChange = (e, { value }) => {
    	this.setState({repairValue:value})
    }
    
    buildRepairElement = (elkey, elvalue) => {
    	if(elkey === 'reason' && elvalue.repair.selector === 'list'){
    		let elements = []
    		if(Array.isArray(elvalue.args )){
    			for(let i = 0; i<elvalue.args.length; i++){
        			elements.push(''+elvalue.args[i])
        		}
    		}
    		return ( <Dropdown
			            value={elements[0]}
			            selection
			            fluid
			            scrolling
			            options={elements}
			            onChange={this.handleRepairChange}
			        /> );
    	}
    	else if(elkey === 'reason' && elvalue.repair.selector === 'by_type'){
        	return ( <Form.Input
	                    placeholder={'repair'}
			            fluid
			            value={''}
			            onChange={this.handleRepairChange}
			        /> );
    	}
    }
    /**
     * 
     */
    render() {
    	const { reason } = this.props;
        const { id, key, value } = reason;
        const { expanded } = this.state;
        const reasonElements = this.buildRepairElement('reason',value);
        
        
        let repairErrorIcon = (<Icon name='check' size='small' color='green' />)
        
        
        return (
        	<div className='dataset-repair' >
                <table><tr>
                	<td className='dataset-reason-icon'>
                		<div>Repair:</div>
                	</td>
                	<td className='dataset-reason-english'><div>{reasonElements}</div></td>
                	<td className='dataset-reason-goto'><div onClick={this.handleRepairError(false)}>{repairErrorIcon}</div></td>
                </tr></table> 
            </div>
        );
    }
}

export default DatasetReason;

