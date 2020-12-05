import logger from './Logger';

export class NakedPromise<T> {
    public promise: Promise<T>;
    public reject!: (() => void);
    public resolve!: ((value: T | PromiseLike<T>) => void);

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

export const xRayVision = (f: any) => {
    const nakedPromise = new NakedPromise();
    return {
        dressedFunction: function () {
            try {
                // down level iteration
                //@ts-ignore
                f(...arguments);
            } catch (e) {
                logger.error('error occurred in parameter function', e);
            }
            nakedPromise.resolve(null);
        },
        nakedPromise,
    };
};
