import { CourseObject, UnitObject, TopicObject, NewCourseTopicObj } from '../../../Courses/CourseInterfaces';
import { BackendAPIResponse } from '../BackendAPIResponse';

export type CreateCourseResponse = BackendAPIResponse<Partial<CourseObject>>;

interface PutCourseUnitUpdates {
    updatesResult: Partial<UnitObject>[]
}

export type PutCourseUnitUpdatesResponse = BackendAPIResponse<PutCourseUnitUpdates>;

interface PutCourseTopicUpdates {
    updatesResult: Partial<NewCourseTopicObj>[]
}

export type PutCourseTopicUpdatesResponse = BackendAPIResponse<PutCourseTopicUpdates>;

interface PutCourseTopicQuestionUpdates {
    updatesResult: Partial<NewCourseTopicObj>[]
}

export type PutCourseTopicQuestionUpdatesResponse = BackendAPIResponse<PutCourseTopicQuestionUpdates>;