import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import querystring from 'querystring';
import { ProblemBrowserSearchDropDown } from './ProblemBrowserSearchDropDown';
import { nameof } from '../Utilities/TypescriptUtils';
import { getBrowseProblemsCourseList, getBrowseProblemsUnitList, getBrowseProblemsTopicList } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import logger from '../Utilities/Logger';
import { Snackbar } from '@material-ui/core';
import { useMUIAlertState } from '../Hooks/useAlertState';
import { Alert as MUIAlert } from '@material-ui/lab';

interface ProblemBrowserCourseFormProps {

}

interface DropDownObject {
    name: string;
    id: number;
}

interface SearchFormInputs {
    course?: DropDownObject;
    unit?: DropDownObject;
    topic?: DropDownObject;
}

export const ProblemBrowserCourseForm: React.FC<ProblemBrowserCourseFormProps> = () => {
    const history = useHistory();
    const searchForm = useForm<SearchFormInputs>();
    const { control, watch, setValue } = searchForm;
    const [ courses, setCourses ] = useState<Array<DropDownObject>>([]);
    const [ units, setUnits ] = useState<Array<DropDownObject> | null>(null);
    const [ topics, setTopics ] = useState<Array<DropDownObject> | null>(null);
    const [updateAlert, setUpdateAlert] = useMUIAlertState();

    const {
        course,
        unit,
        topic
    } = watch();

    const submit = () => {
        history.push(`/common/problem-browser/search?${querystring.stringify(_.omitBy({
            type: 'course',
            courseId: course?.id,
            unitId: unit?.id,
            topicId: topic?.id,
        }, _.isUndefined))}`);
    };

    useEffect(() => {
        (async () => {
            try {
                const subjectResponse = await getBrowseProblemsCourseList({
                    params: {
                        instructorId: 'me'
                    }
                });
                setCourses(subjectResponse.data.data.courses);
            } catch (e) {
                logger.error('Could not fetch courses', e);
                setUpdateAlert({
                    message: `Could not fetch courses: ${e.message}`,
                    severity: 'error'
                });
            }
        })();
    }, []);

    useEffect(() => {
        setUnits(null);
        if (_.isNil(course)) {
            return;
        }

        (async () => {
            try {
                const unitsResponse = await getBrowseProblemsUnitList({
                    params: {
                        courseId: course.id
                    }
                });
                setUnits(unitsResponse.data.data.units);    
            } catch (e) {
                logger.error('Could not fetch units', e);
                setUpdateAlert({
                    message: `Could not fetch units: ${e.message}`,
                    severity: 'error'
                });
            }
        })();
    }, [course]);

    useEffect(() => {
        setTopics(null);
        if (_.isNil(unit)) {
            return;
        }

        (async () => {
            try {
                const topicsResponse = await getBrowseProblemsTopicList({
                    params: {
                        unitId: unit.id
                    }
                });
                setTopics(topicsResponse.data.data.topics);                    
            } catch (e) {
                logger.error('Could not fetch topics', e);
                setUpdateAlert({
                    message: `Could not fetch topics: ${e.message}`,
                    severity: 'error'
                });
            }
        })();
    }, [unit]);

    useEffect(() => {
        if (_.isNil(units)) {
            setValue(nameof<SearchFormInputs>('unit'), null);
        }
    }, [units]);

    useEffect(() => {
        if (_.isNil(topics)) {
            setValue(nameof<SearchFormInputs>('topic'), null);
        }
    }, [topics]);

    return (
        <FormProvider {...searchForm}>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={updateAlert.message !== ''}
                autoHideDuration={updateAlert.severity === 'success' ? 6000 : undefined}
                // onClose={() => setUpdateAlert(alertState => ({...alertState, message: ''}))}
                style={{maxWidth: '50vw'}}
            >
                <MUIAlert
                    // onClose={() => setUpdateAlert(alertState => ({...alertState, message: ''}))}
                    severity={updateAlert.severity}
                    variant='filled'
                    style={{fontSize: '1.1em'}}
                >
                    {updateAlert.message}
                </MUIAlert>
            </Snackbar>
            <h5 style={{padding:'1em'}}>Fill out any number of the below drop downs to search your previously used content</h5>
            <ProblemBrowserSearchDropDown
                name={nameof<SearchFormInputs>('course')}
                label='Course'
                options={courses}
                comparator={(option: DropDownObject, value: DropDownObject) => {
                    return option.id === value.id;
                }}
                getLabel={(arg: DropDownObject) => arg.name}
                control={control}
                disabled={_.isNil(courses)}
            />

            <ProblemBrowserSearchDropDown
                name={nameof<SearchFormInputs>('unit')}
                label='Unit'
                options={units ?? []}
                comparator={(option: DropDownObject, value: DropDownObject) => {
                    return option.id === value.id;
                }}
                getLabel={(arg: DropDownObject) => arg.name}
                control={control}
                disabled={_.isNil(units)}
            />

            <ProblemBrowserSearchDropDown
                name={nameof<SearchFormInputs>('topic')}
                label='Topic'
                options={topics ?? []}
                comparator={(option: DropDownObject, value: DropDownObject) => {
                    return option.id === value.id;
                }}
                getLabel={(arg: DropDownObject) => arg.name}
                control={control}
                disabled={_.isNil(topics)}
            />
            <Button color='primary' variant='contained' style={{margin:'1em'}} onClick={submit}>Submit</Button>
        </FormProvider>
    );
};
