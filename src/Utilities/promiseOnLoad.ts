import React from 'react';
import logger from './Logger';

// Based on: https://medium.com/@samthor/js-callbacks-to-promises-541adc46c07c
export const promiseOnLoad = (elementRef: HTMLElement) => new Promise(
    (resolve, reject) => {
        elementRef.addEventListener('load', () => {
            resolve();
        });
        elementRef.addEventListener('error', () => {
            reject();
        });
        elementRef.addEventListener('abort', () => {
            reject();
        });
    }
).catch(()=>{
    logger.warn('An element failed to load and rejected promiseOnLoad.');
});

export const promiseIframeOnLoad = (problemIframeRef: React.FC) => new Promise(
    (resolve, reject) => {
        console.log(problemIframeRef);
    }
);

export default promiseOnLoad;