import {
  Action,
  AnyAction, CombinedState,
  Dispatch,
  Listener,
  PreloadedState,
  Reducer,
  ReducersMapObject,
  StateFromReducerMapObject,
  Store,
  Unsubscribe
} from "./main.types";

export function createStore<S, A extends Action = AnyAction>(reducer: Reducer<S, A>, preloadedState?: PreloadedState<S>): Store<S, A> {
  if (typeof reducer !== "function") {
    throw new Error("Reducer should be a function");
  }

  if (typeof preloadedState === "function") {
    throw new Error("preloadedState can't be a function");
  }

  let currentState = preloadedState as S;
  const currentReducer = reducer;
  let currentListeners: Array<Listener> = [];
  const nextListeners = currentListeners;
  let isDispatching = false;

  function getState(): S {
    if (isDispatching) {
      throw new Error(`You may not call store.getState() while the reducer is executing.`);
    }

    return currentState;
  }

  function subscribe(listener: Listener): Unsubscribe {
    if (typeof listener !== "function") {
      throw new Error("Expected the listener to be a function. Instead, received " + kindOf(listener));
    }

    if (isDispatching) {
      throw new Error("You may not call store.subscribe() while the reducer is executing.");
    }

    nextListeners.push(listener);

    return function unsubscribe() {
      const index = nextListeners.indexOf(listener);

      nextListeners.splice(index, 1);
      currentListeners = [];
    }
  }

  function dispatch(action: A): void {
    if (!isPlainObject(action)) {
      throw new Error(`Actions must be plain objects. Instead, the action type was ${kindOf(action)}`);
    }

    if (!("type" in action)) {
      throw new Error(`Actions may not have an undefined "type" property. You may misspelled an action type string constant`);
    }

    if (isDispatching) {
      throw new Error("Reducers may not dispatch action, because they are busy.");
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    notifyListeners();
  }

  function notifyListeners(): void {
    const listeners = (currentListeners = nextListeners);

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];

      listener();
    }
  }

  dispatch({type: "@INIT"} as A);

  return {
    getState,
    subscribe,
    dispatch: dispatch as Dispatch<A>,
  }
}


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

export function kindOf(inp: any): string {
  return Object.prototype.toString.call(inp).slice(8, -1).toLowerCase();
}

export function isPlainObject(inp: any): boolean {
  return kindOf(inp) === "object";
}
