import logger from './Logger';

// Based on: https://medium.com/@samthor/js-callbacks-to-promises-541adc46c07c
export const promiseOnLoad = (elementRef: HTMLElement) => new Promise(
    (resolve, reject) => {
        elementRef.addEventListener('load', () => {
            resolve();
        });
        elementRef.addEventListener('error', (e) => {
            reject(e);
        });
        elementRef.addEventListener('abort', (e) => {
            reject(e);
        });
    }
).catch((e)=>{
    // Note: e.message does not exist for CORS issues, so it may not catch most network-level problems.
    logger.warn(`Attachment ${(elementRef as HTMLImageElement).src} failed to load because ${e.message}`);
});

export default promiseOnLoad;
