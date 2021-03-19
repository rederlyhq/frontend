import React, { useState, useEffect, useRef } from 'react';
import { Collapse, IconButton, Grid } from '@material-ui/core';
import { QuillReadonlyDisplay } from './QuillReadonlyDisplay';
import { ReactQuillProps } from 'react-quill';
import { Info, Close } from '@material-ui/icons';
import ReactDOM from 'react-dom';

interface CollapsibleQuillReadOnlyDisplayProps {
    content: ReactQuillProps['value'];
    infoTitle?: string;
}

export const CollapsibleQuillReadOnlyDisplay: React.FC<CollapsibleQuillReadOnlyDisplayProps> = ({content, infoTitle}) => {
    const [show, setShow] = useState<boolean>(false);

    return <div className='QuillReadonlyScrollingContainer'>
        {show ? 
            <>
                <IconButton onClick={()=>setShow(x => !x)} title={infoTitle} style={{position: 'absolute', right: '1%', top: '2%', zIndex: 3}}> 
                    <Close />
                </IconButton>
                <Collapse in={show}>
                    <QuillReadonlyDisplay 
                        content={content}
                    />
                </Collapse>
            </> : 
            <IconButton onClick={()=>setShow(x => !x)} title={infoTitle}>
                <Info />
            </IconButton>
        }
    </div>;
};

export default CollapsibleQuillReadOnlyDisplay;