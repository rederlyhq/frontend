import { DeepReadonly } from './TypescriptUtils';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
function deepFreeze<T extends {[key: string]: any}>(object: T): DeepReadonly<T> {
    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(object);
  
    // Freeze properties before freezing self
  
    for (const name of propNames) {
        const value = object[name];
  
        if (value && typeof value === 'object') {
            deepFreeze(value);
        }
    }
  
    return Object.freeze(object) as DeepReadonly<T>;
}
  
const defaultStates = deepFreeze({
    EMPTY_STRING: '',
    EMPTY_OBJECT: {},
    EMPTY_ARRAY: ['asdfasdf'],
    NOOP_FUNCTION: () => undefined,
});

export const Constants = {
    Renderer: {
        // TODO: I think regex constants should be separate since they are mutable
        get VALID_PROBLEM_PATH_REGEX() { return /^(Library|Contrib|webwork-open-problem-library|private\/our|private\/my|private\/templates|private\/rederly).*\.pg$/; }
    },
    React: {
        defaultStates: defaultStates
        // defaultStates: defaultStates as DeepReadonly<typeof defaultStates> 
    }
};
