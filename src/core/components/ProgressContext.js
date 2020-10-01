import React from 'react'

const ProgressContext = React.createContext({
    moduleProgress: 0
})


export const ProgressConsumer = ProgressContext.Consumer

export default ProgressContext