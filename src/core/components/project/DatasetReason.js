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
//import DatasetRepair from './DatasetRepair';
import { Icon } from 'semantic-ui-react';
import '../../../css/DatasetCaveat.css'

/**
 * Display a list of dataset errors detected by mimir
 */
class DatasetReason extends React.Component {
    static propTypes = {
        reason: PropTypes.object.isRequired,
        onGotoError: PropTypes.func.isRequired,
        onRepairError: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {expanded: false }
    }

    handleExpand = () => {
    	const { expanded } = this.state;
    	this.setState({expanded:!expanded})
    }

    handleGotoError = (event) => {
    	const { onGotoError, reason } = this.props;
    	onGotoError(reason.value);
    }

    buildReasonElement = (elkey, elvalue) => {
    	if(Array.isArray(elvalue)){
    		let elements = []
    		for(let i = 0; i<elvalue.length; i++){
    			elements.push(this.buildReasonElement(elkey+'.'+i,elvalue[i]))
    		}
    		return elements;
    	}
    	else if(elvalue instanceof Object){
    		let elements = []
    		for (let [ek, ev] of Object.entries(elvalue)) {
    			elements.push(this.buildReasonElement(elkey+'.'+ek,ev))
    		}
    		return elements;
    	}
    	else{
    		return (<div className='dataset-reason-element'><td className='dataset-reason-key'><h4>{elkey}: </h4></td><td>{elvalue}</td></div>);
    	}
    }
    /**
     *
     */
    render() {
    	const { reason/*, onRepairError*/ } = this.props;
        const { key, family, message, confirmed } = reason;
        //const { expanded } = this.state;
        const reasonElements = [];//this.buildReasonElement('reason',value);
        reasonElements.unshift(<div className='dataset-reason-element'><td className='dataset-reason-key'><h4>family: </h4></td><td>{family}</td></div>)
        reasonElements.unshift(<div className='dataset-reason-element'><td className='dataset-reason-key'><h4>key: </h4></td><td>{key}</td></div>)

        let tableContent = null

        /*if(expanded){
        	tableContent = (<div>
        						<table>{reasonElements}</table>
        						<DatasetRepair
	        	                	reason={reason}
	        	                	onRepairError={onRepairError}
	        	                />
        					</div> )
        }*/

        let gotoErrorIcon = null
        if(key && Array.isArray(key) && key.length !== 0 ){
        	gotoErrorIcon = (<Icon name='external alternate' size='small' />)
        }
        let errorIcon = (<Icon name='warning sign' size='large' color='yellow' />)
        if(confirmed){
        	errorIcon = (<Icon name='check circle' size='large' color='green' />)
        }

        return (
        	<div className='dataset-reason' >
                <table><tr>
                	<td className='dataset-reason-icon'>
                		<div onClick={this.handleExpand}>{errorIcon}</div>
                	</td>
                	<td className='dataset-reason-english'><div onClick={this.handleExpand}>{message}</div></td>
                	<td className='dataset-reason-goto'><div onClick={this.handleGotoError}>{gotoErrorIcon}</div></td>
                </tr></table>
                {tableContent}
            </div>
        );
    }
}

export default DatasetReason;
