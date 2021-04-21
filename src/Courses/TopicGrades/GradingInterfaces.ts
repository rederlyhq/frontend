import { TopicObject, ProblemObject } from '../CourseInterfaces';

interface LocalGrade {
    localGrade?: number | null;
}

export class TopicObjectWithLocalGrades extends TopicObject implements LocalGrade {
    localGrade?: number | null;
}


export class ProblemObjectWithLocalGrades extends ProblemObject implements LocalGrade {
    localGrade?: number | null;
}
