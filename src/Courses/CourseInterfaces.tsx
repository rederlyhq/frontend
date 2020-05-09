export class CourseObject {
    course_name: string = 'undefined';
    course_start?: Date = undefined;
    course_end?: Date = undefined;
    course_code: string = 'undefined';
    
    public constructor(init?:Partial<CourseObject>) {
        Object.assign(this, init);
    }
}

export class UserObject {
    first_name?: string;
    last_name?: string;

    public constructor(init?:Partial<UserObject>) {
        Object.assign(this, init);
    }
}