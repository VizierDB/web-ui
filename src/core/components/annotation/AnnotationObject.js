import React from 'react';
import { PropTypes } from 'prop-types';
import { Button, Grid, Input, List, Loader, Modal, Message } from 'semantic-ui-react';
import { IconButton } from '../Button'
import '../../../css/Annotation.css';
import '../../../css/App.css';

class AnnotationObject extends React.Component {
    static propTypes = {
        annotation: PropTypes.object.isRequired,
        onDiscard: PropTypes.func.isRequired,
        onSubmit: PropTypes.func
    }
    constructor(props) {
        super(props);
        this.state = {value: ''};
    }
    /**
     * Handle changes in the form control element by updating the internal state.
     */
    handleChange = (event) => {
        this.setState({value: event.target.value});
    }
    /**
     * Detect RETURN key press to submit form.
     */
    handleKeyDown = (event) => {
        if (event.keyCode === 13) {
            this.handleSubmit();
        }
    }
    handleSubmit = () => {
        const { annotation, onSubmit } = this.props;
        const { value } = this.state;
        if (value.trim() !== '') {
            onSubmit(annotation, value);
        }
        this.setState({value: ''});
    }
    render() {
        const { annotation, onDiscard, onSubmit } = this.props;
        if (annotation.content != null) {
            let content = null;
            if (annotation.content.isFetching()) {
                content = (<Loader active inline='centered' />);
            } else if (annotation.content.isError()) {
                content = (
                    <Message negative
                      header={annotation.content.title}
                      content={annotation.content.message}
                    />
                );
            } else {
                if (annotation.content.items.length > 0) {
                    const listItems = [];
                    for (let i = 0; i < annotation.content.items.length; i++) {
                        const anno = annotation.content.items[i];
                        let icon = null;
                        let title = null;
                        if (anno.key === 'mimir:uncertain') {
                            icon = 'warning sign';
                            title = 'Mimir';
                        } else {
                            icon = 'talk outline';
                            title = 'Comment';
                        }
                        listItems.push(
                            <List.Item key={i}>
                              <List.Icon name={icon} size='large' verticalAlign='middle' />
                              <List.Content>
                                <List.Header>{title}</List.Header>
                                <List.Description>{anno.value}</List.Description>
                              </List.Content>
                            </List.Item>
                        );
                    }
                    content = (
                        <List divided relaxed>
                            { listItems }
                        </List>
                    );
                } else {
                    content = (
                        <p className='info-text'>
                            There are currently no annotations for this cell
                        </p>
                    );
                }
            }
            let inputForm = null;
            if (onSubmit != null) {
                inputForm = (
                    <Modal.Actions>
                        <Input
                            fluid
                            label='Comment'
                            action={<Button
                                color='green'
                                icon='plus'
                                onClick={this.handleSubmit}
                            />}
                            placeholder='Add a new comment...'
                            value={this.state.value}
                            onChange={this.handleChange}
                            onKeyDown={this.handleKeyDown}
                        />
                    </Modal.Actions>
                );
            }
            return (
                <Modal open={true} dimmer={'inverted'} size={'small'}>
                    <Modal.Header>
                        <Grid columns={2}>
                            <Grid.Row>
                                <Grid.Column>
                                    Cell Annotations
                                </Grid.Column>
                                <Grid.Column>
                                    <div className='header-button'>
                                        <IconButton name="close" onClick={onDiscard}/>
                                    </div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Modal.Header>
                    <Modal.Content>
                        { content }
                    </Modal.Content>
                    {inputForm}
                </Modal>
            );
        } else {
            return null;
        }
    }
}

export default AnnotationObject;
