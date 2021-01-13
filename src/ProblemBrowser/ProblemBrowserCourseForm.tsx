import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import querystring from 'querystring';
import { ProblemBrowserSearchDropDown } from './ProblemBrowserSearchDropDown';
import { nameof } from '../Utilities/TypescriptUtils';
import { getBrowseProblemsCourseList, getBrowseProblemsUnitList, getBrowseProblemsTopicList } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';

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
            const subjectResponse = await getBrowseProblemsCourseList({
                params: {
                    instructorId: 'me'
                }
            });
            setCourses(subjectResponse.data.data.courses);
        })();
    }, []);

    useEffect(() => {
        setUnits(null);
        if (_.isNil(course)) {
            return;
        }

        (async () => {
            const chaptersResponse = await getBrowseProblemsUnitList({
                params: {
                    courseId: course.id
                }
            });
            setUnits(chaptersResponse.data.data.units);
        })();
    }, [course]);

    useEffect(() => {
        setTopics(null);
        if (_.isNil(unit)) {
            return;
        }

        (async () => {
            const sectionsResponse = await getBrowseProblemsTopicList({
                params: {
                    unitId: unit.id
                }
            });
            setTopics(sectionsResponse.data.data.topics);
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
