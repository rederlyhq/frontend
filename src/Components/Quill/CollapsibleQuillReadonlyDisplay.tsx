import React, { useState } from 'react';
import { Collapse, IconButton } from '@material-ui/core';
import { QuillReadonlyDisplay } from './QuillReadonlyDisplay';
import { ReactQuillProps } from 'react-quill';
import { Info } from '@material-ui/icons';

interface CollapsibleQuillReadOnlyDisplayProps {
    content: ReactQuillProps['value'];
}

export const CollapsibleQuillReadOnlyDisplay: React.FC<CollapsibleQuillReadOnlyDisplayProps> = ({content}) => {
    const [show, setShow] = useState<boolean>(false);
    
    return <div>
        <IconButton onClick={()=>setShow(x => !x)}>
            <Info />
        </IconButton>
        <Collapse in={show}>
            <QuillReadonlyDisplay 
                content={content}
            />
        </Collapse>
    </div>;
};

export default CollapsibleQuillReadOnlyDisplay;