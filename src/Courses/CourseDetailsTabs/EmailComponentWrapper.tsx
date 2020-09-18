import React, { useContext, useEffect, useState } from 'react';
import { UserObject } from '../CourseInterfaces';
import { Button } from 'react-bootstrap';
import EmailModal from './EmailModal';
import { UserRole, getUserRole } from '../../Enums/UserRole';
import { Email } from '@material-ui/icons';
import _ from 'lodash';
import MaterialTable from 'material-table';
import { TiUserDelete } from 'react-icons/ti';
import MaterialIcons from '../../Components/MaterialIcons';
import { deleteEnrollment } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { courseContext } from '../CourseDetailsPage';

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
    const userType: UserRole = getUserRole();
    const course = useContext(courseContext);

    useEffect(()=>{
        setUsers(propUsers);
    }, [propUsers]);

    const onDropStudent = (userId: number, courseId: number) => {
        try {
            deleteEnrollment({userId, courseId});
            setUsers(_.filter(users, user => user.id !== userId));
        } catch (e) {
            // TODO: display errors to user.
            console.error(e);
        }
    };
    
    return (
        <>
            <EmailModal show={showModal} setClose={() => setShowModal(false)} users={selectedStudents} />
            <div style={{maxWidth: '100%'}}>
                <MaterialTable
                    icons={MaterialIcons}
                    title={course.name}
                    columns={[
                        {title: 'First Name', field: 'firstName'},
                        {title: 'Last Name', field: 'lastName'},
                    ]}
                    data={users}
                    // onRowClick={(e: any, user: any) => onClickStudent(user.id)}
                    onSelectionChange={(rows: UserObject[]) => setSelectedStudents(rows)}
                    options={{
                        exportButton: userType !== UserRole.STUDENT,
                        actionsColumnIndex: -1,
                        rowStyle: unit => ({
                            backgroundColor: _.includes(selectedStudents, unit.id) ? '#EEE' : '#FFF'
                        }),
                        pageSize: 10,
                        pageSizeOptions: [10, 15, 20],
                        selection: userType !== UserRole.STUDENT,
                        showTextRowsSelected: false,
                    }}
                    actions={userType !== UserRole.STUDENT ? [
                        {
                            // eslint-disable-next-line react/display-name
                            icon: () => <TiUserDelete style={{color: 'red'}} />,
                            tooltip: 'Drop student from course',
                            onClick: (event: any, user: any) => onDropStudent(user.id, course.id),
                            position: 'row'
                        },
                        {
                            // eslint-disable-next-line react/display-name
                            icon: () => <span><Email style={{color: '#007bff'}}/> Email</span>,
                            // isFreeAction: true,
                            tooltip: 'Email selected students',
                            onClick: () => setShowModal(true),
                            position: 'toolbarOnSelect'
                        }
                    ] : undefined}
                    localization={{header: { actions: 'Drop Student'}}}
                />
            </div>
        </>
    );
};

export default EmailComponentWrapper;