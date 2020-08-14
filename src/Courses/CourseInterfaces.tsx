import _ from 'lodash';

export function* uniqueGen() {
    let index: number = 0;

    while (true) {
        yield ++index;
    }
}

export class CourseObject {
    name: string = '';
    start: Date = new Date();
    end: Date = new Date();
    sectionCode: string = '';
    semesterCode: string = 'FALL';
    semesterCodeYear: number = 2020;
    id: number = 0;
    units: Array<UnitObject> = [];
    code: string = '';
    curriculumId: number = 0;
    textbooks: string = '';
    
    public constructor(init?:Partial<CourseObject>) {
        Object.assign(this, init);
        if(_.isNil(init?.semesterCodeYear) && !_.isNil(init?.semesterCode)) {
            const semesterCodeRegex = /^(.*?)(\d+)$/;
            // I don't want the first result
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            // also init cannot be nil from the if statement above
            const [_fullMatch, group1, group2] = semesterCodeRegex.exec(init?.semesterCode ?? '') || [];
            this.semesterCode = group1;
            this.semesterCodeYear = parseInt(group2);
        }
    }
}

export class UserObject {
    firstName?: string;
    lastName?: string;
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
    comment: string;
}

export interface IProblemObject {
    path: string;
    weight: number;
}

enum TopicTypeId {
    PROBLEM_SET = 1,
    EXAM = 2
}

const newTopicUniqueGen = uniqueGen();
export class TopicObject {
    name: string = '';
    questions: Array<ProblemObject> = [];
    curriculumUnitContentId: number = 0;
    topicTypeId: TopicTypeId = TopicTypeId.PROBLEM_SET;
    id: number = 0;
    unique: number = newTopicUniqueGen.next().value || 0;
    contentOrder: number = 0;
    
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

    public constructor(init?:Partial<NewCourseTopicObj>) {
        super();
        Object.assign(this, init);
    }
}

const newUnitUniqueGen = uniqueGen();
export class UnitObject {
    id: number = 0;
    name: string = '';
    curriculumId: number = 0;
    topics: Array<NewCourseTopicObj> = [];
    unique: number = newUnitUniqueGen.next().value || 0;
    contentOrder: number = 0;
    
    public constructor(init?:Partial<UnitObject>) {
        Object.assign(this, init);
    }
}

export class NewCourseUnitObj extends UnitObject {
    courseId: number = 0;
}

const newProblemUniqueGen = uniqueGen();

export class StudentGrade {
    overallBestScore: number = 0;
    bestScore: number = 0;
    numAttempts: number = 0;

    public constructor(init?:Partial<ProblemObject>) {
        Object.assign(this, init);
    }
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
    unique: number = newProblemUniqueGen.next().value || 0;
    grades?: StudentGrade[];

    public constructor(init?:Partial<ProblemObject>) {
        Object.assign(this, init);
    }
}
