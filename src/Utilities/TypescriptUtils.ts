// https://schneidenbach.gitbooks.io/typescript-cookbook/content/nameof-operator.html
export const nameof = <T>(name: keyof T) => name;

export type EnumDictionary<T extends string | symbol | number, U> = {
    [K in T]?: U;
};

// https://stackoverflow.com/a/49670389
export type DeepReadonly<T> =
    T extends (infer R)[] ? DeepReadonlyArray<R> :
    T extends Function ? T :
    T extends object ? DeepReadonlyObject<T> :
    T;

export interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

export type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export const isKeyOf = <T>(key: any, obj: T): key is keyof T => {
    return key in obj;
};
