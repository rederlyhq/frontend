export class CourseObject {
    name: string = 'undefined';
    start?: Date = undefined;
    end?: Date = undefined;
    code: string = 'undefined';
    id: number = 0;
    
    public constructor(init?:Partial<CourseObject>) {
        Object.assign(this, init);
    }
}

export class UserObject {
    first_name?: string;
    last_name?: string;
    id: number = -1;

    public constructor(init?:Partial<UserObject>) {
        Object.assign(this, init);
    }
}

/**
 * Course templates are previous courses or curriculum.
 */
export interface ICourseTemplate {
    name: string;
    id: number;
}

export interface IProblemObject {
    path: string;
    weight: number;
}

export class TopicObject {
    name: string = '';
    questions: Array<IProblemObject> = [];
    
    public constructor(init?:Partial<TopicObject>) {
        Object.assign(this, init);
    }
}