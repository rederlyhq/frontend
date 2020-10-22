import logger from "./logger";

export class NakedPromise<T> {
    public promise: Promise<T>;
    public reject!: (() => void);
    public resolve!: (() => void);

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
            nakedPromise.resolve();
        }, 
        nakedPromise,
    };
};
