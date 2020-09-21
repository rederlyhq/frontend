// https://schneidenbach.gitbooks.io/typescript-cookbook/content/nameof-operator.html
export const nameof = <T>(name: keyof T) => name;

export type EnumDictionary<T extends string | symbol | number, U> = {
    [K in T]?: U;
};