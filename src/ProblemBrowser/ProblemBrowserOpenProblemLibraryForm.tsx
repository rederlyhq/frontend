import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@material-ui/core';
import { getSubjects, getChapters, getSections, OPL_DBSubject, OPL_DBChapter, OPL_DBSection } from '../APIInterfaces/LibraryBrowser/LibraryBrowserRequests';
import { useHistory } from 'react-router-dom';
import querystring from 'querystring';
import { ProblemBrowserSearchDropDown } from './ProblemBrowserSearchDropDown';
import logger from '../Utilities/Logger';
import { Snackbar } from '@material-ui/core';
import { useMUIAlertState } from '../Hooks/useAlertState';
import { Alert as MUIAlert } from '@material-ui/lab';

interface ProblemBrowserOpenProblemLibraryFormProps {

}

interface SearchFormInputs {
    subject?: OPL_DBSubject;
    chapter?: OPL_DBChapter;
    section?: OPL_DBSection;
}

export const ProblemBrowserOpenProblemLibraryForm: React.FC<ProblemBrowserOpenProblemLibraryFormProps> = () => {
    const history = useHistory();
    const searchForm = useForm<SearchFormInputs>();
    const { control, watch, setValue } = searchForm;
    const [ subjects, setSubjects ] = useState<Array<OPL_DBSubject>>([]);
    const [ chapters, setChapters ] = useState<Array<OPL_DBChapter> | null>(null);
    const [ sections, setSections ] = useState<Array<OPL_DBSection> | null>(null);
    const [updateAlert, setUpdateAlert] = useMUIAlertState();

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
            try {
                const subjectResponse = await getSubjects();
                setSubjects(subjectResponse.data.data.subjects);    
            } catch (e) {
                logger.error('Could not fetch subjects', e);
                setUpdateAlert({
                    message: `Could not fetch subjects: ${e.message}`,
                    severity: 'error'
                });
            }
        })();
    }, []);

    useEffect(() => {
        setChapters(null);
        if (_.isNil(subject)) {
            return;
        }

        (async () => {
            try {
                const chaptersResponse = await getChapters({
                    params: {
                        subjectId: subject.dbsubject_id
                    }
                });
                setChapters(chaptersResponse.data.data.chapters);    
            } catch (e) {
                logger.error('Could not fetch chapters', e);
                setUpdateAlert({
                    message: `Could not fetch chapters: ${e.message}`,
                    severity: 'error'
                });
            }
        })();
    }, [subject]);

    useEffect(() => {
        setSections(null);
        if (_.isNil(chapter)) {
            return;
        }

        (async () => {
            try {
                const sectionsResponse = await getSections({
                    params: {
                        chapterId: chapter.dbchapter_id
                    }
                });
                setSections(sectionsResponse.data.data.sections);    
            } catch (e) {
                logger.error('Could not fetch sections', e);
                setUpdateAlert({
                    message: `Could not fetch sections: ${e.message}`,
                    severity: 'error'
                });
            }
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

            <h5 style={{padding:'1em'}}>Fill out any number of the below drop downs to search to <code>Open Problem Library</code></h5>
            <ProblemBrowserSearchDropDown
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

            <ProblemBrowserSearchDropDown
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

            <ProblemBrowserSearchDropDown
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
