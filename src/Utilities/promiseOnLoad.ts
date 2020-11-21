// Based on: https://medium.com/@samthor/js-callbacks-to-promises-541adc46c07c
export const promiseOnLoad = (elementRef: HTMLElement) => new Promise(
    (resolve, reject) => {
        console.log('Adding listeners to.', elementRef);
        elementRef.addEventListener('load', () => {
            console.log('ON LOAD CALLED');
            console.log(elementRef);
            resolve();
        });
        elementRef.addEventListener('error', () => {
            console.log('ON error CALLED');
            reject();
        });
        elementRef.addEventListener('abort', () => {
            console.log('ON abort CALLED');
            reject();
        });
    }
);

export default promiseOnLoad;