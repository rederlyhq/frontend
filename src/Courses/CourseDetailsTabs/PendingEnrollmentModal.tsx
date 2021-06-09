import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { deletePendingEnrollment, getPendingEnrollments } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { Tooltip } from '@material-ui/core';
import { IconButton } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { useGlobalSnackbarContext } from '../../Contexts/GlobalSnackbar';
import logger from '../../Utilities/Logger';

interface PendingEnrollment {
    id: number;
    email:string;
}

interface PendingEnrollmentModalBodyProps {
    loading: boolean;
    pendingEnrollments: PendingEnrollment[] | null;
    onDelete: (index: number, pendingEnrollmentArr: PendingEnrollment[]) => unknown;
}
const PendingEnrollmentModalBody = ({
    loading,
    pendingEnrollments,
    onDelete,
}: PendingEnrollmentModalBodyProps) => {
    if (loading) {
        return <Modal.Body>Loading...</Modal.Body>;
    }

    if (pendingEnrollments === null) {
        return <Modal.Body>Failed to fetch pending enrollments</Modal.Body>;
    }
    if (pendingEnrollments.length === 0) {
        return <Modal.Body>There are no pending enrollments.</Modal.Body>;
    }
    
    return <Modal.Body>{pendingEnrollments.map((pendingEnrollment, index, arr) => <>
        <div
            style ={{
                display: 'flex',
                flexDirection: 'row'
            }}
            key={pendingEnrollment.email}
        >
            <span style={{marginTop: 'auto', marginBottom: 'auto'}}>{pendingEnrollment.email}</span>
            <Tooltip
                title='Drop Pending Enrollment'
                style={{
                    // alignSelf: 'end'
                    marginLeft: 'auto'
                }}>
                <IconButton 
                    aria-label='Drop Pending Enrollment'
                    tabIndex={0}
                    // onClick={_.partial(removeUnitClick, _, unit.id)}
                    // onKeyPress={_.partial(removeUnitClick, _, unit.id)}
                >
                    <Delete color='error' onClick={() => onDelete(index, arr)}/>
                </IconButton>
            </Tooltip>
        </div>
        {(index < arr.length - 1) ? <hr /> : null}
    </>)}</Modal.Body>;
};

interface PendingEnrollmentModalProps {
    courseId: number;
    showPendingEnrollments: boolean;
    onClose: () => unknown;
}

export const PendingEnrollmentModal: React.FC<PendingEnrollmentModalProps> = ({
    showPendingEnrollments,
    courseId,
    onClose
}) => {
    const [pendingEnrollments, setPendingEnrollments] = useState<PendingEnrollment[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const setAlert = useGlobalSnackbarContext();

    useEffect(() => {
        if (showPendingEnrollments) {
            (async () => {
                try {
                    setAlert?.({message: '', severity: 'info'});
                    setLoading(true);
                    const result = await getPendingEnrollments({courseId});
                    setPendingEnrollments(result.data.data);
                } catch (err) {
                    logger.error('Failed to fetch pending enrollments', err);
                    setAlert?.({message: `Could not fetch pending enrollments: ${err.message}`, severity: 'error'});
                    setPendingEnrollments(null);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [showPendingEnrollments, courseId, setAlert]);

    const onDeleteClick = async (index: number, pendingEnrollmentArr: PendingEnrollment[]) => {
        try {
            const pendingEnrollmentToDrop = pendingEnrollmentArr[index];
            setLoading(true);
            setAlert?.({message: '', severity: 'info'});
            await deletePendingEnrollment({
                pendingEnrollmentId: pendingEnrollmentToDrop.id
            });
            pendingEnrollmentArr.splice(index, 1);
            setPendingEnrollments([...pendingEnrollmentArr]);
            setAlert?.({message: `Successfully dropped pending enrollment for ${pendingEnrollmentToDrop.email}`, severity: 'success'});
        } catch(err) {
            logger.error('Failed to drop pending enrollments', err);
            setAlert?.({message: `Could not drop pending enrollments: ${err.message}`, severity: 'error'});
        } finally {
            setLoading(false);
        }
    };

    return <Modal onHide={onClose} show={showPendingEnrollments}>
        <Modal.Header><h4>Pending Enrollments</h4></Modal.Header>
        <PendingEnrollmentModalBody loading={loading} pendingEnrollments={pendingEnrollments} onDelete={onDeleteClick}/>
        <Modal.Footer><Button variant='secondary' onClick={onClose}>Close</Button></Modal.Footer>
    </Modal>;
};