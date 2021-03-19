import React, { useState } from 'react';
import { Collapse, IconButton, Tooltip } from '@material-ui/core';
import { QuillReadonlyDisplay } from './QuillReadonlyDisplay';
import { ReactQuillProps } from 'react-quill';
import { Info, Close } from '@material-ui/icons';

interface CollapsibleQuillReadOnlyDisplayProps {
    content: ReactQuillProps['value'];
    infoTitle: string;
}

export const CollapsibleQuillReadOnlyDisplay: React.FC<CollapsibleQuillReadOnlyDisplayProps> = ({content, infoTitle}) => {
    const [show, setShow] = useState<boolean>(false);

    return <div className='QuillReadonlyScrollingContainer'>
        {show &&
            <Tooltip title={infoTitle}>
                <IconButton onClick={()=>setShow(x => !x)} style={{position: 'absolute', right: '1%', top: '2%', zIndex: 3}}> 
                    <Close />
                </IconButton>
            </Tooltip>}
        <Collapse in={!show}>
            <IconButton onClick={()=>setShow(x => !x)} title={infoTitle}>
                <Info />
            </IconButton>
        </Collapse>
        <Collapse in={show}>
            <QuillReadonlyDisplay 
                content={content}
            />
        </Collapse>
    </div>;
};

export default CollapsibleQuillReadOnlyDisplay;