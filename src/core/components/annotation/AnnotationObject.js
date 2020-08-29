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
import { Button, Dropdown, Grid, Icon, Input, List, Loader, Modal, Message } from 'semantic-ui-react';
import { IconButton } from '../Button'
import '../../../css/Annotation.css';
import '../../../css/App.css';

class AnnotationObject extends React.Component {
    static propTypes = {
        annotation: PropTypes.object.isRequired,
        onDelete: PropTypes.func,
        onDiscard: PropTypes.func.isRequired,
        onSubmit: PropTypes.func
    }
    constructor(props) {
        super(props);
        this.keys = [
            { key: 'user:comment', text: 'Comment', value: 'user:comment' },
            { key: 'user:issue', text: 'Issue', value: 'user:issue' },
        ];
        this.state = {key: 'user:comment', value: '', selectedAnnotation: -1};
    }
    handleDelete = () => {
        const { annotation, onDelete } = this.props;
        const { selectedAnnotation } = this.state;
        onDelete(annotation, selectedAnnotation);
        // Make sure to clear the selected item
        this.setState({selectedAnnotation: -1});
    }
    /**
     * Handle changes in the form control element by updating the internal state.
     */
    handleChange = (event) => {
        this.setState({value: event.target.value});
    }
    /**
     * Clear the selected items and text input when closing the modal.
     */
    handleClose = () => {
        const { onDiscard } = this.props;
        this.setState({key: 'user:comment', value: '', selectedAnnotation: -1});
        onDiscard()
    }
    /**
     * Detect RETURN key press to submit form.
     */
    handleKeyDown = (event) => {
        if (event.keyCode === 13) {
            this.handleSubmit();
        }
    }
    handleSelectAnnotation = (e, { id }) => {
        const { selectedAnnotation } = this.state;
        if (selectedAnnotation === id) {
            this.setState({selectedAnnotation: -1});
        } else {
            this.setState({selectedAnnotation: id});
        }
    }
    handleSelectKey = (e, { value }) => {
        this.setState({key: value});
    }
    handleSubmit = () => {
        const { annotation, onSubmit } = this.props;
        const { key, value } = this.state;
        if (value.trim() !== '') {
            onSubmit(annotation, key, value);
        }
        this.setState({value: '', selectedAnnotation: -1});
    }
    render() {
        const { annotation, onDelete, onSubmit } = this.props;
        const { selectedAnnotation } = this.state;
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
                    const rows = [];
                    for (let i = 0; i < annotation.content.items.length; i++) {
                        const anno = annotation.content.items[i];
                        let color = null;
                        let icon = null;
                        let title = null;
                        if (anno.key === 'mimir:uncertain') {
                            icon = 'warning sign';
                            title = 'Mimir';
                            color = 'yellow';
                            anno.value = anno.message;
                        } else if (anno.key === 'user:issue') {
                            icon = 'info circle';
                            title = 'Issue';
                        } else {
                            icon = 'comment alternate outline';
                            title = 'Comment';
                            anno.value = anno.message;
                        }
                        let cssSuffix = '';
                        if ((anno.key === 'mimir:uncertain') || (onSubmit == null)) {
                            cssSuffix = ' disabled';
                        }
                        let annoIcon = null;
                        if ((onDelete != null) && (anno.key !== 'mimir:uncertain') && (anno.id === selectedAnnotation)) {
                            annoIcon = (
                                <Icon
                                    name='trash'
                                    size='large'
                                    onClick={this.handleDelete}
                                />
                            );
                            cssSuffix = ' delete';
                        } else {
                            annoIcon = (<Icon name={icon} size='large' color={color}/>);
                        }
                        rows.push(
                            <tr key={i}>
                                <td className={'list-icon' + cssSuffix}>
                                    { annoIcon }
                                </td>
                                <td className={'list-text' + cssSuffix}>
                                    <List relaxed>
                                        <List.Item id={anno.id} onClick={this.handleSelectAnnotation}>
                                          <List.Content>
                                            <List.Header>{title}</List.Header>
                                            <List.Description>
                                                {anno.value}
                                                </List.Description>
                                          </List.Content>
                                        </List.Item>
                                    </List>
                                </td>
                            </tr>
                        );
                    }
                    content = (
                        <table className='annotations'><tbody>
                            { rows }
                        </tbody></table>
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
                            label={<Dropdown
                                defaultValue='user:comment'
                                options={this.keys}
                                onChange={this.handleSelectKey}
                            />}
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
                                        <IconButton name="close" onClick={this.handleClose}/>
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
