import React, { useState } from 'react';
import { Collapse, IconButton, Tooltip, Button, Grid } from '@material-ui/core';
import { QuillReadonlyDisplay } from './QuillReadonlyDisplay';
import { ReactQuillProps } from 'react-quill';
import { Info, Close, ArrowDropDown } from '@material-ui/icons';

interface CollapsibleQuillReadOnlyDisplayProps {
    content: ReactQuillProps['value'];
    infoTitle: string;
    showQuill: boolean;
}

export const CollapsibleQuillReadOnlyDisplay: React.FC<CollapsibleQuillReadOnlyDisplayProps> = ({showQuill, content, infoTitle, children}) => {
    const [show, setShow] = useState<boolean>(false);

    return <Grid container justify='space-between'>
        {show &&
            <Tooltip title={infoTitle}>
                <IconButton onClick={()=>setShow(x => !x)} style={{position: 'absolute', right: '1%', top: '2%', zIndex: 3}}> 
                    <Close />
                </IconButton>
            </Tooltip>}
        <Grid item>
            {showQuill && <Button
                color='primary'
                variant='outlined'
                onClick={()=>setShow(x => !x)} 
                title={infoTitle}
                endIcon={<ArrowDropDown />}
            >
                Topic Description
            </Button>}
        </Grid>
        <Grid item>
            {children}
        </Grid>
        <Grid className='QuillReadonlyScrollingContainer'>
            <Collapse in={show}>
                <QuillReadonlyDisplay 
                    content={content}
                />
            </Collapse>
        </Grid>
    </Grid>;
};

export default CollapsibleQuillReadOnlyDisplay;