/**
 * A group of control elements. Allows user to insert a set of tuples.
 * TODO: The current implementation is biased towards SCHAME_MATCHING lens
 * and should be made more generic. Checking of valid arguments is also not
 * implementd yet.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'semantic-ui-react'


class ControlGroup extends React.Component {
    static propTypes = {
        handler: PropTypes.object.isRequired,
        id: PropTypes.string.isRequired,
        children: PropTypes.array.isRequired,
        values: PropTypes.array.isRequired
    }
    constructor(props) {
        super(props)
        this.state = {formValues: {}, tuples: props.values}
    }
    handleChange = (e, {name, value}) => {
        const { formValues } = this.state
        formValues[name] = value
        this.setState({formValues: formValues})
    }
    handleAdd = () => {
        const { id, handler } = this.props
        const { formValues, tuples } = this.state
        tuples.push({...formValues})
        this.setState(tuples: tuples)
        handler.setFormValue(id, tuples)
    }
    handleRemove = (e, { value }) => {
        const { id, handler } = this.props
        const { tuples } = this.state
        const modifiedTuples = []
        for (let i = 0; i < tuples.length; i++) {
            if (i !== value) {
                modifiedTuples.push(tuples[i])
            }
        }
        this.setState({tuples: modifiedTuples})
        handler.setFormValue(id, modifiedTuples)
    }
    render() {
        const { children } = this.props
        const { tuples } = this.state
        const formLabels = []
        const formControls = []
        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            formLabels.push(
                <Form.Field key={i} width={3}>
                    <label>
                        {child.name}
                    </label>
                </Form.Field>
            )
            if (child.values) {
                const listing = [];
                for (let i = 0; i < child.values.length; i++) {
                    const val = child.values[i];
                    listing.push({
                        key: val,
                        text: val,
                        value: val
                    })
                }
                formControls.push(
                    <Form.Select
                        key={i}
                        name={child.id}
                        options={listing}
                        onChange={this.handleChange}
                        width={3}
                    />
                )
            } else {
                formControls.push(
                    <Form.Input
                        key={i}
                        name={child.id}
                        placeholder={child.name}
                        onChange={this.handleChange}
                        width={3}
                    />
                )
            }
        }
        formLabels.push(
            <Form.Field key={children.length} width={1}>
            </Form.Field>
        )
        formControls.push(
            <Form.Field key={children.length} width={1}>
                <Button icon='plus' positive onClick={this.handleAdd}/>
            </Form.Field>
        )
        const formTuples = []
        for (let i = 0; i < tuples.length; i++) {
            const tuple = tuples[i]
            const row = []
            for (let j = 0; j < children.length; j++) {
                row.push(
                    <Form.Field key={i + '#' + j} width={3}>
                        {tuple[children[j].id]}
                    </Form.Field>
                )
            }
            row.push(
                <Form.Field key={i + '#' + children.length} width={1}>
                    <Button icon='trash' value={i} negative onClick={this.handleRemove}/>
                </Form.Field>
            )
            formTuples.push(<Form.Group key={i} inline >{row}</Form.Group>)
        }
        /*<Form.Group inline >
            <Form.Field width={2}><label>{'COL1'}</label></Form.Field>
            <Form.Field width={2}><label>{'COL2'}</label></Form.Field>
        </Form.Group>
        <Form.Group inline >
            <Form.Field width={2}>{'COL1'}</Form.Field>
            <Form.Field width={2}>{'COL2'}</Form.Field>
        </Form.Group>*/
        return (
            <div className='form-groups'>
                <Form.Group inline >{formLabels}</Form.Group>
                { formTuples }
                <Form.Group inline >{formControls}</Form.Group>
            </div>
        )
    }
}

export default ControlGroup
