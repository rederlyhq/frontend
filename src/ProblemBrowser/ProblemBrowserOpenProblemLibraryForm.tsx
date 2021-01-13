/* eslint-disable no-debugger */
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useForm, FormProvider, Controller, Control } from 'react-hook-form';
import { TextField, Button } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { getSubjects, getChapters, getSections, OPL_DBSubject, OPL_DBChapter, OPL_DBSection } from '../APIInterfaces/LibraryBrowser/LibraryBrowserRequests';
import { useHistory } from 'react-router-dom';
import querystring from 'querystring';

interface ProblemBrowserOpenProblemLibraryFormProps {

}

interface SearchFormInputs {
    subject?: OPL_DBSubject;
    chapter?: OPL_DBChapter;
    section?: OPL_DBSection;
}

interface ProblemBrowserOpenProblemLibraryDropDownOptions<T> {
    options: Array<T>;
    comparator: (a: T, b: T) => boolean;
    getLabel: (arg: T) => string;
    control: Control;
    label: string;
    name: string;
    disabled?: boolean;
}
const ProblemBrowserOpenProblemLibraryDropDown = <T extends unknown>({
    options,
    comparator,
    getLabel,
    control,
    label,
    name,
    disabled,
}: ProblemBrowserOpenProblemLibraryDropDownOptions<T>) => (
        <Controller
            name={name}
            render={({ onChange, ...props}) =>
                <Autocomplete
                    options={options}
                    getOptionLabel={getLabel}
                    getOptionSelected={comparator}
                    onChange={(_event, data) => onChange(data)}
                    fullWidth={true}
                    style={{
                        padding: '1em'
                    }}
                    renderInput={(params: unknown) => <TextField {...params} label={label} variant="outlined" />}
                    {...props}
                    disabled={disabled}
                />
            }
            onChange={([, data]: [unknown, unknown]) => data}
            control={control}
            defaultValue={null}
        />
    );

export const ProblemBrowserOpenProblemLibraryForm: React.FC<ProblemBrowserOpenProblemLibraryFormProps> = () => {
    const history = useHistory();
    const searchForm = useForm<SearchFormInputs>();
    const { control, watch, setValue } = searchForm;
    const [ subjects, setSubjects ] = useState<Array<OPL_DBSubject>>([]);
    const [ chapters, setChapters ] = useState<Array<OPL_DBChapter> | null>(null);
    const [ sections, setSections ] = useState<Array<OPL_DBSection> | null>(null);

    const {
        subject,
        chapter,
        section
    } = watch();

    const submit = () => {
        history.push(`/common/problem-browser/search?${querystring.stringify(_.omitBy({
            type: 'library',
            subjectId: subject?.dbsubject_id,
            chapterId: chapter?.dbchapter_id,
            sectionId: section?.dbsection_id,
        }, _.isUndefined))}`);
    };

    useEffect(() => {
        (async () => {
            const subjectResponse = await getSubjects();
            setSubjects(subjectResponse.data.data.subjects);
        })();
    }, []);

    useEffect(() => {
        setChapters(null);
        if (_.isNil(subject)) {
            return;
        }

        (async () => {
            const chaptersResponse = await getChapters({
                params: {
                    subjectId: subject.dbsubject_id
                }
            });
            setChapters(chaptersResponse.data.data.chapters);
        })();
    }, [subject]);

    useEffect(() => {
        setSections(null);
        if (_.isNil(chapter)) {
            return;
        }

        (async () => {
            const sectionsResponse = await getSections({
                params: {
                    chapterId: chapter.dbchapter_id
                }
            });
            setSections(sectionsResponse.data.data.sections);
        })();
    }, [chapter]);

    useEffect(() => {
        if (_.isNil(chapters)) {
            setValue('chapter' as keyof SearchFormInputs, null);
        }
    }, [chapters]);

    useEffect(() => {
        if (_.isNil(sections)) {
            setValue('section' as keyof SearchFormInputs, null);
        }
    }, [sections]);

    return (
        <FormProvider {...searchForm}>
            <h5 style={{padding:'1em'}}>Fill out any number of the below drop downs to search to <code>Open Problem Library</code></h5>
            <ProblemBrowserOpenProblemLibraryDropDown
                name='subject'
                label='Subject'
                options={subjects}
                comparator={(option: OPL_DBSubject, value: OPL_DBSubject) => {
                    return option.dbsubject_id === value.dbsubject_id;
                }}
                getLabel={(arg: OPL_DBSubject) => arg.name}
                control={control}
                disabled={_.isNil(subjects)}
            />

            <ProblemBrowserOpenProblemLibraryDropDown
                name='chapter'
                label='Chapter'
                options={chapters ?? []}
                comparator={(option: OPL_DBChapter, value: OPL_DBChapter) => {
                    return option.dbchapter_id === value.dbchapter_id;
                }}
                getLabel={(arg: OPL_DBChapter) => arg.name}
                control={control}
                disabled={_.isNil(chapters)}
            />

            <ProblemBrowserOpenProblemLibraryDropDown
                name='section'
                label='Section'
                options={sections ?? []}
                comparator={(option: OPL_DBSection, value: OPL_DBSection) => {
                    return option.dbsection_id === value.dbsection_id;
                }}
                getLabel={(arg: OPL_DBSection) => arg.name}
                control={control}
                disabled={_.isNil(sections)}
            />
            <Button color='primary' variant='contained' style={{margin:'1em'}} onClick={submit}>Submit</Button>
        </FormProvider>
    );
};
