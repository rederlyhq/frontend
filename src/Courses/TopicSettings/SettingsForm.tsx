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
    const { register, handleSubmit, getValues, errors, control, setValue, watch, formState, reset } = useForm<Inputs>({
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

    const { isExam } = watch();

    return (        
        <Grid container item md={9}>
            <DevTool control={control} />
            <form>
                <Grid container item md={12} spacing={3}>
                    {selectedProblemId === 'topic' ? (
                        <>
                            <CommonSettings register={register} control={control} watch={watch} getValues={getValues} />
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