export interface ICourseObject {
    course_name?: string;
    course_start?: Date;
    course_end?: Date;
    course_code?: string;
}

export class CourseObject implements ICourseObject {
    course_name = undefined;
    course_start = undefined;
    course_end = undefined;
    course_code = undefined;
    
    public constructor(init?:Partial<ICourseObject>) {
        Object.assign(this, init);
    }
}