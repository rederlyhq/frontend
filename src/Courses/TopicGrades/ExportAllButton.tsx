import React, { useEffect, useState, useRef } from 'react';
import { Button, CircularProgress } from '@material-ui/core';
import { startExportOfTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import _ from 'lodash';

interface ExportAllButtonProps {
    topicId: number;
}

enum LoadingState {
    UNTOUCHED,
    LOADING,
    SUCCESS,
    ERROR
}

export const ExportAllButton: React.FC<ExportAllButtonProps> = ({topicId}) => {
    const [loading, setLoading] = useState<LoadingState>(LoadingState.UNTOUCHED);
    const [url, setUrl] = useState<string | null>(null);
    const intervalRef = useRef<number | undefined>(undefined);

    // On mount, check 
    useEffect(()=>{
        checkAndStatusUpdateExport(false);
    }, []);

    useEffect(()=>{
        console.log(loading);
    }, [loading]);

    const checkAndStatusUpdateExport = async (force: boolean = false) => {
        // If forced, set loading immediately.
        if (force) setLoading(LoadingState.LOADING);

        try {
            const res = await startExportOfTopic({topicId, force});
            console.log(res);

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
        <Button 
            variant='contained' 
            color='primary'
            disabled={loading === LoadingState.LOADING}
            onClick={
                () => {
                    if (url) {
                        window.open('https://staging.rederly.com/' + url, '_blank');
                        return;
                    }    
                    checkAndStatusUpdateExport(true);
                }
            }
        >
            {url ? 'Download ZIP' : 'Export All'}
            {loading === LoadingState.LOADING && <CircularProgress size={24} />}
        </Button>
        {loading === LoadingState.SUCCESS && <Button
            color='secondary'
            variant='contained'
            onClick={() => checkAndStatusUpdateExport(true)}
        >
            Force Refresh Zip    
        </Button>}
    </>;
};

export default ExportAllButton;