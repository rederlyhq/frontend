declare global {
    interface Array<T> {
        first?: T;
    }    
}

Object.defineProperty(Array.prototype, 'first', {
    get(this: Array<unknown>) {
        return this[0];
    },
    enumerable: false,
    configurable: true
});

export {};
