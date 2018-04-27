import React from 'react';
import { Message } from 'semantic-ui-react'


/**
 * Display an error message.
 */
export const ErrorMessage = ({title, message, onDismiss}) => (
    <Message
        negative
        icon='warning sign'
        header={title}
        onDismiss={onDismiss}
        content={message.charAt(0).toUpperCase() + message.slice(1)}
    />
);


/**
 * Display a list of error messages in a single message frame.
 */
export const ErrorListMessage = ({title, errors, onDismiss}) => (
    <Message
        negative
        icon='warning sign'
        header={title}
        list={errors}
        onDismiss={onDismiss}
    />
);



/**
 * Display an warning message.
 */
export const WarningMessage = ({title, message, onDismiss}) => (
    <Message
        warning
        icon='warning circle'
        header={title}
        onDismiss={onDismiss}
        content={message.charAt(0).toUpperCase() + message.slice(1)}
    />
);


/**
 * Display an warning message.
 */
export const NotFoundMessage = ({message}) => (
    <Message
        floating
        icon='frown'
        header='Ooops ... 404'
        size='massive'
        content={message.charAt(0).toUpperCase() + message.slice(1)}
    />
);
