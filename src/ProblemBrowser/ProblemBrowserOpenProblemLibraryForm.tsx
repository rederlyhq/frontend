/* eslint-disable no-debugger */
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { TextField, Button } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { getSubjects, getChapters, getSections, OPL_DBSubject, OPL_DBChapter, OPL_DBSection } from '../APIInterfaces/LibraryBrowser/LibraryBrowserRequests';

interface ProblemBrowserOpenProblemLibraryFormProps {

}

interface SearchFormInputs {
    subject?: OPL_DBSubject;
    chapter?: OPL_DBChapter;
    section?: OPL_DBSection;
}

export const ProblemBrowserOpenProblemLibraryForm: React.FC<ProblemBrowserOpenProblemLibraryFormProps> = () => {
    const searchForm = useForm<SearchFormInputs>();
    const { getValues, control, watch, setValue } = searchForm;
    const [ subjects, setSubjects ] = useState<Array<OPL_DBSubject>>([]);
    const [ chapters, setChapters ] = useState<Array<OPL_DBChapter> | null>(null);
    const [ sections, setSections ] = useState<Array<OPL_DBSection> | null>(null);

    const {
        subject,
        chapter,
        section
    } = watch();

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
            <div>ProblemBrowserOpenProblemLibraryForm</div>
            <Controller
                name="subject"
                render={({ onChange, ...props}) =>
                    <Autocomplete
                        options={subjects}
                        getOptionLabel={(option: OPL_DBSubject) => option.name}
                        getOptionSelected={(option: OPL_DBSubject, value: OPL_DBSubject) => {
                            return option.dbsubject_id === value.dbsubject_id;
                        }}
                        onChange={(_event, data) => onChange(data)}
                        fullWidth={true}
                        renderInput={(params: unknown) => <TextField {...params} label="Subject" variant="outlined" />}
                        {...props}
                    />
                }
                onChange={([, data]: [unknown, unknown]) => data}
                control={control}
                defaultValue={null}
            />

            <Controller
                name="chapter"
                render={({ onChange, ...props}) =>
                    <Autocomplete
                        options={chapters ?? []}
                        getOptionLabel={(option: OPL_DBChapter) => option.name}
                        getOptionSelected={(option: OPL_DBChapter, value: OPL_DBChapter) => {
                            return option.dbchapter_id === value.dbchapter_id;
                        }}
                        onChange={(_event, data) => onChange(data)}
                        fullWidth={true}
                        renderInput={(params: unknown) => <TextField {...params} label="Chapter" variant="outlined" />}
                        {...props}
                    />
                }
                onChange={([, data]: [unknown, unknown]) => data}
                control={control}
                defaultValue={null}
            />

            <Controller
                name="section"
                render={({ onChange, ...props}) =>
                    <Autocomplete
                        options={sections ?? []}
                        getOptionLabel={(option: OPL_DBSection) => option.name}
                        getOptionSelected={(option: OPL_DBSection, value: OPL_DBSection) => {
                            return option.dbsection_id === value.dbsection_id;
                        }}
                        onChange={(_event, data) => onChange(data)}
                        fullWidth={true}
                        renderInput={(params: unknown) => <TextField {...params} label="Section" variant="outlined" />}
                        {...props}
                    />
                }
                onChange={([, data]: [unknown, unknown]) => data}
                control={control}
                defaultValue={null}
            />
        </FormProvider>
    );
};
