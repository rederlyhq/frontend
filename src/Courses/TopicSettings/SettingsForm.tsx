import { Moment } from 'moment';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { DevTool } from '@hookform/devtools';
import CommonSettings from './CommonSettings';
import ExamSettings from './ExamSettings';
import moment from 'moment';
import { Button, Grid } from '@material-ui/core';
import ProblemSettings from './ProblemSettings';

interface SettingsFormProps {
    selectedProblemId: number | 'topic';
}

interface Inputs {
    name: string;
    startDate: Moment;
    endDate: Moment;
    deadDate: Moment;
    isExam: boolean;
}

/**
 * This component hosts the React-Hook-Forms element and passes down props to subcomponents to render the form.
 */
export const SettingsForm: React.FC<SettingsFormProps> = ({selectedProblemId}) => {
    const formObject = useForm<Inputs>({
        mode: 'onSubmit', 
        shouldFocusError: true,
        defaultValues: {
            name: 'Unnamed Topic',
            startDate: moment(),
            endDate: moment(),
            deadDate: moment(),
            isExam: false,
        }
    });
    const { register, handleSubmit, getValues, errors, control, setValue, watch, formState, reset } = formObject;

    const { isExam } = watch();

    const onSubmit = console.log;

    return (        
        <Grid container item md={9}>
            <DevTool control={control} />
            <form onChange={(e: any) => {console.log('form onchange recv');}} onSubmit={handleSubmit(onSubmit)}>
                <Grid container item md={12} spacing={3}>
                    {selectedProblemId === 'topic' ? (
                        <>
                            <CommonSettings formObject={formObject} />
                            {isExam && <ExamSettings register={register} control={control} watch={watch} />}
                        </>
                    ) : (
                        <>
                            <ProblemSettings 
                                selectedProblemId={selectedProblemId} 
                                register={register} 
                                control={control} 
                                watch={watch}
                            />
                        </>
                    )
                    }

                    <Grid container item md={12} alignItems='flex-start' justify="flex-end" >
                        <Grid item md={3}>
                            <Button
                                color='primary'
                                variant='contained'
                            >
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        </Grid>
    );
};

export default SettingsForm;