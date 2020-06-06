export class CourseObject {
    name: string = '';
    start: Date = new Date();
    end: Date = new Date();
    sectionCode: string = '';
    semesterCode: string = '';
    id: number = 0;
    units: Array<UnitObject> = [];
    code: string = '';
    curriculumId: number = 0;
    
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

enum TopicTypeId {
    PROBLEM_SET = 1,
    EXAM = 2
}

export class TopicObject {
    name: string = '';
    questions: Array<ProblemObject> = [];
    curriculumUnitContentId: number = 0;
    topicTypeId: TopicTypeId = TopicTypeId.PROBLEM_SET;
    id: number = 0;
    
    public constructor(init?:Partial<TopicObject>) {
        Object.assign(this, init);
    }
}

export class NewCourseTopicObj extends TopicObject {
    courseUnitContentId: number = 0;
    startDate: Date = new Date();
    endDate: Date = new Date();
    deadDate: Date = new Date();
    partialExtend: boolean = false;
}

export class UnitObject {
    name: string = '';
    curriculumId: number = 0;
    topics: Array<TopicObject> = [];
    
    public constructor(init?:Partial<UnitObject>) {
        Object.assign(this, init);
    }
}

export class NewCourseUnitObj extends UnitObject {
    courseId: number = 0;
}

export class ProblemObject implements IProblemObject {
    id: number = 0;
    problemNumber: number = 1;
    webworkQuestionPath: string = ''; // This is the same as path, currently.
    path: string = '';
    weight: number = 1;
    maxAttempts: number = 3;
    hidden: boolean = false;
    optional: boolean = false;

    public constructor(init?:Partial<ProblemObject>) {
        Object.assign(this, init);
    }
}