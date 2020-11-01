import _ from 'lodash';

export function* uniqueGen() {
    let index: number = 0;

    while (true) {
        yield ++index;
    }
}

// via 1loc.dev (consider moving to a utilities folder)
const generateString = (length: number): string => Array(length).fill('').map(() => Math.random().toString(36).charAt(2)).join('');

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

        if (!_.isNull(init?.units)) {
            this.units = init?.units?.map(unit => new UnitObject(unit)) || [];
        }

        if(_.isNil(init?.semesterCodeYear) && !_.isNil(init?.semesterCode)) {
            const semesterCodeRegex = /^(.*?)(\d+)$/;
            // init cannot be nil from the if statement above
            const [, group1, group2] = semesterCodeRegex.exec(init?.semesterCode ?? '') || [];
            this.semesterCode = group1;
            this.semesterCodeYear = parseInt(group2);
        }
    }

    static toAPIObject(course: CourseObject) {
        // Not every field belongs in the request.
        const newCourseFields = ['curriculum', 'name', 'code', 'start', 'end', 'sectionCode', 'semesterCode', 'textbooks', 'curriculumId'];
        let postObject = _.pick(course, newCourseFields);
        postObject.semesterCode = `${course.semesterCode}${course.semesterCodeYear}`;
        postObject.code = `${postObject.sectionCode}_${postObject.semesterCode}_${generateString(4).toUpperCase()}`;
        // TODO: Fix naming for route, should be 'templateId'.
        return postObject;
    }
}

export class UserObject {
    firstName?: string;
    lastName?: string;
    id: number = -1;

    get name(): string {
        return `${this.firstName} ${this.lastName}`;
    }

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

export enum TopicTypeId {
    PROBLEM_SET = 1,
    EXAM = 2
}

export class TopicAssessmentFields {
    id?: number;
    duration?: number;
    hardCutoff?: boolean;
    maxGradedAttemptsPerVersion?: number;
    maxVersions?: number;
    versionDelay?: number;
    hideHints?: boolean;
    showItemizedResults?: boolean;
    showTotalGradeImmediately?: boolean;
    hideProblemsAfterFinish?: boolean;
    randomizeOrder?: boolean;
    studentTopicAssessmentInfo?: Array<StudentTopicAssessmentFields>;
    studentTopicAssessmentOverride?: StudentTopicAssessmentOverrideFields[];
    
    public constructor(init?:Partial<TopicAssessmentFields>) {
        Object.assign(this, init);
    }
    
    static getDefaultFields = (): Partial<TopicAssessmentFields> => {
        return {
            duration: 60,
            hardCutoff: false,
            maxGradedAttemptsPerVersion: 1,
            maxVersions: 1,
            versionDelay: 0,
            hideHints: false,
            showItemizedResults: false,
            showTotalGradeImmediately: false,
            hideProblemsAfterFinish: false,
            randomizeOrder: false,
        };
    }
}

export class StudentTopicAssessmentOverrideFields {
    // TODO fixed truncated fields from backend
    topicAssessm?: number;
    // maxGradedAtt?: number;
    maxGradedAttemptsPerVersion?: number;
    id?: number;
    userId?: number;
    duration?: number;
    maxVersions?: number;
    versionDelay?: number;
    active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;

    public constructor(init?:Partial<StudentTopicAssessmentOverrideFields>) {
        Object.assign(this, init);
    }
}

export class StudentTopicAssessmentFields {
    id?: number;
    topicAssessmentInfoId?: number;
    userId?: number;
    startTime?: Date;
    endTime?: Date;
    nextVersionAvailableTime?: Date;
    numAttempts?: number;
    maxAttempts?: number;
    isClean?: boolean;
    isClosed?: boolean;
    active?: boolean;

    public constructor(init?: Partial<StudentTopicAssessmentFields>) {
        Object.assign(this, init);
    }
}

export class TopicOverride {
    id?: number;
    startDate?: Date;
    endDate?: Date;
    deadDate?: Date;
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
    courseUnitContentId: number = 0;
    startDate: Date = new Date();
    endDate: Date = new Date();
    deadDate: Date = new Date();
    partialExtend: boolean = false;
    studentTopicOverride: TopicOverride[] = [];
    topicAssessmentInfo?: TopicAssessmentFields = new TopicAssessmentFields();
    
    public constructor(init?:Partial<TopicObject>) {
        Object.assign(this, init);
      
        if (!_.isNull(init?.questions)) {
            this.questions = init?.questions?.map(question => new ProblemObject(question)) || [];
        }
    }
}

const newUnitUniqueGen = uniqueGen();
export class UnitObject {
    id: number = 0;
    name: string = '';
    curriculumId: number = 0;
    topics: Array<TopicObject> = [];
    unique: number = newUnitUniqueGen.next().value || 0;
    contentOrder: number = 0;
    courseId: number = 0;
    
    public constructor(init?:Partial<UnitObject>) {
        Object.assign(this, init);
                        
        if (!_.isNull(init?.topics)) {
            this.topics = init?.topics?.map(topic => new TopicObject(topic)) || [];
        }
    }
}

export class NewCourseUnitObj extends UnitObject {
}

export interface StudentWorkbookInterface {
    id: number;
    active: boolean;
    studentGradeId: number;
    userId: number;
    courseWWTopicQuestionId: number;
    studentGradeInstanceId?: number;
    randomSeed: number;

    // This is a jsonb field so it could be any (from db)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submitted: any;
    result: number;
    time: Date;
    wasLate: boolean;
    wasExpired: boolean;
    wasAfterAttemptLimit: boolean;
    wasLocked: boolean;
    wasAutoSubmitted: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export interface StudentGradeInstance {
    id: number;
    webworkQuestionPath: string;
    problemNumber: number;
    randomSeed: number;
    // This is a jsonb field so it could be any (from db)
    // Submitted in workbook used any so I'm going to keep it consistent here
    // If this is used for form data we will never know any info about what keys are available
    // Might make sense to make this an unknown type since I don't think we will ever access the types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentProblemState: any;
    studentGradeId: number;
    studentTopicAssessmentInfoId: number;
    scoreForBestVersion: number; // the score from the highest-scoring exam submission
    overallBestScore: number; // the best score on this problem alone
    active: boolean;
    bestIndividualAttemptId: number;
    bestVersionAttemptId: number;
}

export interface StudentGradeDict {
    id: number;
    userId: number;
    randomSeed: number;
    overallBestScore: number;
    effectiveScore: number;
    bestScore: number;
    legalScore: number;
    partialCreditBestScore: number;
    numAttempts: number;
    numLegalAttempts: number;
    locked: boolean;
    lastInfluencingAttemptId?: number;
    workbooks?: Record<number, StudentWorkbookInterface>;
    overrides?: number;
}

export class StudentGrade {
    gradeInstances?: StudentGradeInstance[];
    overallBestScore: number = 0;
    effectiveScore: number = 0;
    bestScore: number = 0;
    numAttempts: number = 0;
    numLegalAttempts: number = 0;
    locked: boolean = false;
    currentProblemState?: unknown;
    id?: number;
    randomSeed?: number;
    lastInfluencingAttemptId?: number;

    public constructor(init?:Partial<ProblemObject>) {
        Object.assign(this, init);
    }
}

export interface ProblemDict {
    id: number;
    problemNumber: number;
    webworkQuestionPath: string; // This is the same as path, currently.
    path: string;
    weight: number;
    maxAttempts: number;
    hidden: boolean;
    optional: boolean;
    grades?: Record<number, StudentGradeDict>;
}

const newProblemUniqueGen = uniqueGen();
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
    studentTopicQuestionOverride: any[] = [];
    courseQuestionAssessmentInfo?: any = {};

    public constructor(init?:Partial<ProblemObject>) {
        Object.assign(this, init);
    }
}

export class NewProblemObject extends ProblemObject {
    courseTopicContentId: number = 0;
}

export type SettingsComponentType = UnitObject | UserObject | TopicObject | ProblemObject;

export class CourseTopicAssessmentInfo extends TopicObject {
    duration?: number;
    hardCutoff?: boolean;
    maxGradedAttemptsPerRandomization?: number;
    maxReRandomizations?: number;
    randomizationDelay?: number;
    hideHints?: boolean;
    showItemizedResults?: boolean;
    showTotalGradeImmediately?: boolean;
    hideProblemsAfterFinish?: boolean;
    randomizeOrder?: boolean;
    
    public constructor(init?:Partial<ProblemObject>) {
        super(init);
        Object.assign(this, init);
    }
}

export interface ExamSettingsFields {
    topicAssessmentInfo?: {
        hardCutoff?: boolean;
        hideHints?: boolean;
        showItemizedResults?: boolean;
        showTotalGradeImmediately?: boolean;
        hideProblemsAfterFinish?: boolean;
        duration?: number;
        maxGradedAttemptsPerRandomization?: number;
        maxReRandomizations?: number;
        randomizationDelay?: number;
        randomizeOrder?: boolean;
    },
}

export interface ExamProblemSettingsFields {
    courseQuestionAssessmentInfo?: {
        additionalProblemPaths?: Array<{path: string}>,
        randomSeedSet?: number[],
    }
}

export class ProblemAttachments {
    id?: number;
    cloudFilename?: string;
    userLocalFilename?: string;
    active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;

    // When created on the frontend, the File object contains the file that was uploaded.
    file?: File;
    progress!: number;

    public constructor(init?:Partial<ProblemAttachments>) {
        Object.assign(this, init);

        // If Backend-specific properties are filled, treat as already uploaded.
        if (_.isNil(init?.progress)) {
            this.progress = _.isNil(init?.id) ? 0 : 100;
        }
    }
}
