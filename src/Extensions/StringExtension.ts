declare global {
    interface String {
        toBase64(): string;
        fromBase64(): string;
    }    
}

/**
 * AS STRING
 * String prototype has this of type `String`, the capitalization causes issues so I have to cast as `string`
 */
String.prototype.toBase64 = function (): string {
    // see AS STRING comment
    return btoa(this as string);
};

String.prototype.fromBase64 = function (): string {
    // see AS STRING comment
    return atob(this as string);
};

export {};
