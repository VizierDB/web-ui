import React from 'react';
import { Message } from 'semantic-ui-react'


/**
 * Display an error message.
 */
export const ErrorMessage = ({title, message, handleDismiss}) => (
    <Message
        negative
        icon='warning sign'
        header={title}
        onDismiss={handleDismiss}
        content={message.charAt(0).toUpperCase() + message.slice(1)}
    />
);


/**
 * Display an warning message.
 */
export const WarningMessage = ({title, message, handleDismiss}) => (
    <Message
        warning
        icon='warning circle'
        header={title}
        onDismiss={handleDismiss}
        content={message.charAt(0).toUpperCase() + message.slice(1)}
    />
);
