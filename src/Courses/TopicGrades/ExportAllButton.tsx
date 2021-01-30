import React, { useEffect, useState, useRef } from 'react';
import { Button, ButtonGroup, CircularProgress, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from '@material-ui/core';
import { startExportOfTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import _ from 'lodash';
import { useRouteMatch } from 'react-router-dom';

interface ExportAllButtonProps {
    topicId: number;
    userId: number | undefined;
}

enum LoadingState {
    UNTOUCHED,
    LOADING,
    SUCCESS,
    ERROR
}

enum ButtonOptions {
    EXPORT_ALL = 'Export All (.zip)',
    // TODO: Implement
    // EXPORT_ALL_NO_SOLUTIONS = 'Export All without Solutions (.zip)',
    RECALCULATE = 'Recreate Archive',
    PRINT_SINGLE = 'Export Selected Student (.pdf)',
}

function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}

export const ExportAllButton: React.FC<ExportAllButtonProps> = ({topicId, userId}) => {
    const [loading, setLoading] = useState<LoadingState>(LoadingState.UNTOUCHED);
    const [url, setUrl] = useState<string | null>(null);
    const [open, setOpen] = React.useState(false);
    const [buttonState, setButtonState] = useState<ButtonOptions>(ButtonOptions.EXPORT_ALL);
    const intervalRef = useRef<number | undefined>(undefined);
    const splitButtonRef = useRef<HTMLDivElement>(null);
    const { url: path } = useRouteMatch();

    // On mount, check 
    useEffect(()=>{
        checkAndStatusUpdateExport(false);
    }, []);

    const checkAndStatusUpdateExport = async (force: boolean = false) => {
        // If forced, set loading immediately.
        if (force) setLoading(LoadingState.LOADING);

        try {
            const res = await startExportOfTopic({topicId, force});

            if (_.isNil(res.data.data.lastExported) && force === false) {
                setLoading(LoadingState.UNTOUCHED);
            // If the Export URL is null but Last Export wasn't, it's loading.
            // If we're forcing the request, we're always in loading.
            } else if (_.isNil(res.data.data.exportUrl) || force === true) {
                setLoading(LoadingState.LOADING);
                if (_.isNil(intervalRef.current)) {
                    intervalRef.current = setInterval(checkAndStatusUpdateExport, 5000);
                }
            } else {
                clearInterval(intervalRef.current);
                intervalRef.current = undefined;
                setLoading(LoadingState.SUCCESS);
                setUrl(res.data.data.exportUrl);
                setButtonState(ButtonOptions.EXPORT_ALL);

                // This was more friendly, but since it is ambiguous as to whether this includes solutions or not.
                // setButtonState(ButtonOptions.DOWNLOAD_ZIP);

                // Only open the Window on a click. This prevents us from hitting popup blockers
                // and from opening it on every page load.
                if (force)
                    window.open('https://staging.rederly.com/' + url, '_blank');
            }
        } catch (e) {
            setLoading(LoadingState.ERROR);
            clearInterval(intervalRef.current);
        }
    };

    return <>
        <ButtonGroup variant="contained" color="primary" ref={splitButtonRef} aria-label="split button" disabled={loading === LoadingState.LOADING}>
            <Button onClick={
                () => {
                    if (userId && buttonState === ButtonOptions.PRINT_SINGLE) {
                        window.open(`${path}/print/${userId}`, '_blank');
                        return;
                    }

                    if (url && buttonState !== ButtonOptions.RECALCULATE) {
                        window.open('https://staging.rederly.com/' + url, '_blank');
                        return;
                    }

                    checkAndStatusUpdateExport(true);
                }
            }>{buttonState}</Button>
            <Button
                color="primary"
                size="small"
                aria-controls={open ? 'split-button-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-label="Select export options"
                aria-haspopup="menu"
                onClick={() => setOpen((prevOpen) => !prevOpen)}
            >
                {loading === LoadingState.LOADING ? 
                    <CircularProgress size={24} /> :
                    <ArrowDropDownIcon />
                }
            </Button>
        </ButtonGroup>
        <Popper open={open} anchorEl={splitButtonRef.current} role='menu' transition disablePortal style={{zIndex: 2}} placement='bottom-end'>
            {({ TransitionProps, placement }) => (
                <Grow
                    {...TransitionProps}
                    style={{
                        transformOrigin: placement === 'bottom' ? 'left top' : 'left bottom',
                    }}
                >
                    <Paper>
                        <ClickAwayListener onClickAway={
                            (event) => {
                                if (splitButtonRef.current?.contains(event.target as HTMLElement)) {
                                    return;
                                }
                                
                                setOpen(false);
                            }
                        }>
                            <MenuList id="split-button-menu">
                                {
                                    enumKeys(ButtonOptions).map((value) => {
                                        if (ButtonOptions[value] === ButtonOptions.RECALCULATE  && loading !== LoadingState.SUCCESS) return null;
                                        // if (ButtonOptions[value] === ButtonOptions.DOWNLOAD_ZIP && loading !== LoadingState.SUCCESS) return null;

                                        return <MenuItem
                                            key={value}
                                            disabled={false}
                                            selected={ButtonOptions[value] === buttonState}
                                            onClick={() => {setButtonState(ButtonOptions[value]); setOpen(false);}}
                                        >
                                            {ButtonOptions[value]}
                                        </MenuItem>;
                                    })
                                }
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
        </Popper>
    </>;
};

export default ExportAllButton;