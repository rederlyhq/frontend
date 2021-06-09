import React, { useContext, useEffect, useState } from 'react';
import { UserObject } from '../CourseInterfaces';
import { Link, useLocation, useHistory } from 'react-router-dom';
import EmailModal from './EmailModal';
import { AddEnrollmentModal } from './AddEnrollmentModal';
import { UserRole, getUserRole } from '../../Enums/UserRole';
import { Email } from '@material-ui/icons';
import _ from 'lodash';
import MaterialTable, { Action } from 'material-table';
import { TiUserDelete } from 'react-icons/ti';
import { MdPersonAdd } from 'react-icons/md';
import MaterialIcons from '../../Components/MaterialIcons';
import { deleteEnrollment } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { courseContext } from '../CourseDetailsPage';
import { ConfirmationModal } from '../../Components/ConfirmationModal';
import logger from '../../Utilities/Logger';
import { TablePagination } from '@material-ui/core';
import { GrShift } from 'react-icons/gr';
import { ENROLLMENT_TABLE_HEADERS } from './TableColumnHeaders';
import { PendingEnrollmentModal } from './PendingEnrollmentModal';
import RecentActorsIcon from '@material-ui/icons/RecentActors';

interface EmailComponentWrapperProps {
    users: Array<UserObject>;
}

/**
 * This component manages the state for the Email Students functionality.
 */
export const EmailComponentWrapper: React.FC<EmailComponentWrapperProps> = ({ users: propUsers }) => {
    const [users, setUsers] = useState(propUsers);
    const [selectedStudents, setSelectedStudents] = useState<UserObject[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState<{ state: boolean, user: UserObject | null }>({ state: false, user: null });
    const [showPendingEnrollments, setShowPendingEnrollments] = useState<boolean>(false);
    const userType: UserRole = getUserRole();
    const course = useContext(courseContext);
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        setUsers(propUsers);
    }, [propUsers]);

    const onDropStudent = async (userId: number, courseId: number) => {
        try {
            await deleteEnrollment({ userId, courseId });
            setUsers(_.filter(users, user => user.id !== userId));
        } catch (e) {
            // TODO: display errors to user.
            logger.error('Drop student failed', e);
        }
    };

    const onStudentEnrollment = async (user: UserObject) => {
        const existingUser = _.find(users, existingUser => user.id === existingUser.id);
        if (_.isNil(existingUser)) {
            setUsers(users => [...users, user]);
        }
    };

    const emailProfessorButtonOptions: Action<UserObject> = {
        icon: function IconWrapper() {
            return <span><Email style={{color: '#007bff'}} /> <span style={{fontSize: '1rem'}}>Email</span></span>;
        },
        tooltip: 'Email selected students',
        onClick: () => setShowModal(true),
        position: 'toolbarOnSelect'
    };

    const disabledEmailProfessorButtonOptions: Action<UserObject> = {
        icon: function IconWrapper() {
            return <span><Email /> <span style={{fontSize: '1rem'}}>Email</span></span>;
        },
        tooltip: 'Email selected students',
        onClick: () => undefined,
        position: 'toolbar',
        disabled: true,
    };

    return (
        <>
            <AddEnrollmentModal show={showEnrollmentModal} onClose={() => setShowEnrollmentModal(false)} courseId={course.id} onEnrollment={onStudentEnrollment} />
            <EmailModal show={showModal} setClose={() => setShowModal(false)} users={selectedStudents} />
            <ConfirmationModal
                show={showConfirmDelete.state}
                onHide={() => setShowConfirmDelete({ state: false, user: null })}
                onConfirm={() => {
                    if (_.isNull(showConfirmDelete.user)) {
                        logger.error('Tried deleting a null user!');
                        return;
                    }
                    onDropStudent(showConfirmDelete.user.id, course.id);
                    setShowConfirmDelete({ state: false, user: null });
                }}
                confirmText={`Drop ${showConfirmDelete.user?.firstName} from ${course.sectionCode}`}
                confirmVariant='danger'
                headerContent={<h4>Drop Student</h4>}
                bodyContent={(
                    <div className='text-center'>
                        <p>Are you sure you want to drop <br />
                            <b>{showConfirmDelete.user?.firstName} {showConfirmDelete.user?.lastName}</b><br />
                        from the course <br />
                            <b>{course.sectionCode} {course.semesterCode}{course.semesterCodeYear}</b>?</p>
                        <p>This student will no longer be able to use the enrollment link.</p>
                    </div>
                )}
            />
            <PendingEnrollmentModal showPendingEnrollments={showPendingEnrollments} onClose={() => setShowPendingEnrollments(false)} courseId={course.id} />
            <div style={{ maxWidth: '100%' }}>
                <MaterialTable
                    key={users.length}
                    icons={MaterialIcons}
                    title={course.name}
                    columns={ENROLLMENT_TABLE_HEADERS}
                    data={users}
                    // onRowClick={(e: any, user: any) => onClickStudent(user.id)}
                    onSelectionChange={(rows: UserObject[]) => setSelectedStudents(rows)}
                    options={{
                        exportButton: userType !== UserRole.STUDENT,
                        exportAllData: true,
                        actionsColumnIndex: -1,
                        pageSize: users.length,
                        selection: userType !== UserRole.STUDENT,
                        showTextRowsSelected: false,
                        emptyRowsWhenPaging: false,

                    }}
                    components={{
                        Pagination: function PaginationWrapper(props) {
                            return <TablePagination
                                {...props}
                                rowsPerPageOptions={[..._.range(0, users.length, 5), { label: 'All', value: users.length }]}
                            />;
                        }
                    }}
                    actions={userType !== UserRole.STUDENT ? [
                        {
                            icon: function IconWrapper() { return <TiUserDelete style={{ color: 'red' }} />; },
                            tooltip: 'Drop student from course',
                            onClick: (_event: any, user: any) => setShowConfirmDelete({ state: true, user }),
                            position: 'row'
                        },
                        {
                            icon: function IconWrapper() { return <Link to='#'><GrShift style={{ color: 'black' }} /></Link>; },
                            tooltip: 'Go to Extensions',
                            onClick: (_event: any, user: any) => history.push(`${location.pathname}/settings?userId=${user.id}`),
                            position: 'row'
                        },
                        {
                            icon: function IconWrapper() {
                                return <span style={{color: '#28a745'}}><MdPersonAdd /> <span style={{fontSize: '1rem'}}>Enroll</span></span>;
                            },
                            onClick: () => setShowEnrollmentModal(true),
                            position: 'toolbar',
                            tooltip: 'Enroll student in course',
                        },                        {
                            icon: function IconWrapper() {
                                return <span style={{color: '#ff9800', fontSize: '1em'}}><RecentActorsIcon /> <span style={{fontSize: '1rem'}}>Pending</span></span>;
                            },
                            onClick: () => setShowPendingEnrollments(true),
                            position: 'toolbar',
                            tooltip: 'See students that are not enrolled in rederly yet',
                        },
                        emailProfessorButtonOptions,
                        disabledEmailProfessorButtonOptions,
                    ] : undefined}
                    localization={{ header: { actions: 'Actions' } }}
                />
            </div>
        </>
    );
};

export default EmailComponentWrapper;