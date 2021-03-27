/// <reference types="react-scripts" />
/// <reference types="react-quill" />

// FIXME: Updated Typescript is needed: https://stackoverflow.com/questions/60276013/property-allsettled-does-not-exist-on-type-promiseconstructor-ts2339
declare interface PromiseConstructor {
    allSettled(promises: Array<Promise<any>>): Promise<Array<{status: 'fulfilled' | 'rejected', value?: any, reason?: any}>>;
}

declare module 'mathquill4quill';