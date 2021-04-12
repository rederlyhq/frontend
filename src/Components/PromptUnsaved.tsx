import React from 'react';
import { Prompt } from 'react-router-dom';
import { Beforeunload } from 'react-beforeunload';

interface PromptUnsavedProps {
    message: string;
    when: boolean;
}

export const PromptUnsaved: React.FC<PromptUnsavedProps> = ({message, when}) => {
    
    return <>
        {when && <Beforeunload onBeforeunload={() => message} />}
        <Prompt message={message} when={when} />
    </>;
};
