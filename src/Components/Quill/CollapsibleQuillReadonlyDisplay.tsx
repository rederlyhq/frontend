import React, { useState } from 'react';
import { Collapse, Button, Grid } from '@material-ui/core';
import { QuillReadonlyDisplay } from './QuillReadonlyDisplay';
import { ReactQuillProps } from 'react-quill';
import { ArrowDropDown, ArrowDropUp } from '@material-ui/icons';

interface CollapsibleQuillReadOnlyDisplayProps {
    content: ReactQuillProps['value'];
    infoTitle: string;
    showQuill: boolean;
}

/**
 * This component creates a row and accepts children to be the right-aligned component of the row. 
 * This allows for buttons to be aligned to the Topic Description button.
 */
export const CollapsibleQuillReadOnlyDisplay: React.FC<CollapsibleQuillReadOnlyDisplayProps> = ({showQuill, content, infoTitle, children}) => {
    const [show, setShow] = useState<boolean>(false);

    return <Grid container spacing={1} style={{marginTop: '5px'}}>
        <Grid sm={4} xs={12} item>
            {showQuill && <Button
                color='primary'
                variant='outlined'
                onClick={()=>setShow(x => !x)} 
                title={infoTitle}
                endIcon={show ? <ArrowDropUp /> : <ArrowDropDown />}
            >
                Topic Description
            </Button>}
        </Grid>
        <Grid container item spacing={1} sm={8} xs={12} justify='flex-end'>
            {children}
        </Grid>
        <Grid xs={12} className='QuillReadonlyScrollingContainer'>
            <Collapse in={show}>
                <QuillReadonlyDisplay 
                    content={content}
                />
            </Collapse>
        </Grid>
    </Grid>;
};

export default CollapsibleQuillReadOnlyDisplay;