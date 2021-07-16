import {Action, AnyAction, CombinedState, Reducer, ReducersMapObject, StateFromReducerMapObject} from "./main.types";

export function combineReducers<S>(
  reducers: ReducersMapObject<S, any>
): Reducer<CombinedState<S>>;
export function combineReducers<S, A extends Action = AnyAction>(
  reducers: ReducersMapObject<S, A>
): Reducer<CombinedState<S>, A>;
export function combineReducers(reducers: ReducersMapObject) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers: ReducersMapObject = {};

  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];

    if (process.env.NODE_ENV !== "production" && typeof reducers[key] !== "function") {
      throw new Error(`No reducer provided for key ${key}`);
    }

    if (typeof reducers[key] === "function") {
      finalReducers[key] = reducers[key];
    }
  }

  const finalReducersKeys = Object.keys(finalReducers);

  let shapeAssertionsError: Error;
  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionsError = e;
  }

  return function combination(state: StateFromReducerMapObject<typeof reducers> = {}, action: AnyAction) {
    if (shapeAssertionsError) {
      throw shapeAssertionsError;
    }

    let hasChanged = false;
    const nextState: StateFromReducerMapObject<typeof reducers> = {};
    for (let i = 0; i < finalReducersKeys.length; i++) {
      const key = finalReducersKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state?.[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      if (typeof nextStateForKey === "undefined") {
        const actionType = action?.type;

        throw new Error(`When called an action of type ${actionType ? String(actionType) : "(unknown type)"}, the slice reducer for key ${key} returned undefined. To ignore an action, you must explicitly return the previous state.`)
      }

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    hasChanged = hasChanged || finalReducersKeys.length !== Object.keys(state).length;

    return hasChanged ? nextState : state;
  }
}

export function assertReducerShape(reducers: ReducersMapObject) {
  Object.entries(reducers).forEach(([key, reducer]) => {
    const initialState = reducer(undefined, {type: "@INIT"});

    if (typeof initialState === "undefined") {
      throw new Error(`The slice reducer for key ${key} returned undefined during initialization.`);
    }

    const randomActionType = Math.random().toString(16).slice(2);
    const $initialStateWidthRandomActionType = reducer(undefined, {type: randomActionType});

    if (typeof $initialStateWidthRandomActionType === "undefined") {
      throw new Error(`The slice reducer for key ${key} returned undefined probed with a random action type`);
    }
  })
}
