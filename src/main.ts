import type {
	Action,
	AnyAction,
	Dispatch,
	ExtendState,
	Listener,
	PreloadedState,
	Reducer,
	Store,
	Unsubscribe,
} from "./main.types";
import { isPlainObject, kindOf } from "./utils";

export function createStore<S, A extends Action = AnyAction, StateExt = never>(
	reducer: Reducer<S, A>,
	preloadedState?: PreloadedState<S>,
): Store<ExtendState<S, StateExt>, A, StateExt> {
	if (typeof reducer !== "function") {
		throw new Error("Reducer should be a function");
	}

	if (typeof preloadedState === "function") {
		throw new Error("preloadedState can't be a function");
	}

	let currentState = preloadedState as S;
	let currentReducer = reducer;
	let currentListeners: Array<Listener> = [];
	let nextListeners = currentListeners;
	let isDispatching = false;

	function getState(): S {
		if (isDispatching) {
			throw new Error(`You may not call store.getState() while the reducer is executing.`);
		}

		return currentState;
	}

	function subscribe(listener: Listener): Unsubscribe {
		if (typeof listener !== "function") {
			throw new Error(
				"Expected the listener to be a function. Instead, received " + kindOf(listener),
			);
		}

		if (isDispatching) {
			throw new Error("You may not call store.subscribe() while the reducer is executing.");
		}

		nextListeners.push(listener);

		return function unsubscribe() {
			const index = nextListeners.indexOf(listener);

			nextListeners.splice(index, 1);
			currentListeners = [];
		};
	}

	function dispatch(action: A): void {
		if (!isPlainObject(action)) {
			throw new Error(
				`Actions must be plain objects. Instead, the action type was ${kindOf(action)}`,
			);
		}

		if (!("type" in action)) {
			throw new Error(
				`Actions may not have an undefined "type" property. You may misspelled an action type string constant`,
			);
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

		const listeners = (currentListeners = nextListeners);

		for (let i = 0; i < listeners.length; i++) {
			const listener = listeners[i];

			listener();
		}
	}

	/**
	 * Replaces the reducer currently used by the store to calculate the state.
	 */
	function replaceReducer<NewState, NewActions extends A>(
		nextReducer: Reducer<NewState, NewActions>,
	): Store<ExtendState<NewState, StateExt>, NewActions, StateExt> {
		if (typeof nextReducer !== "function") {
			throw new Error(
				`Expected the nextReducer to be a function. Instead, received: '${kindOf(nextReducer)}`,
			);
		}

		(currentReducer as unknown as Reducer<NewState, NewActions>) = nextReducer;

		dispatch({ type: "@REPLACE" } as A);

		return store as unknown as Store<ExtendState<NewState, StateExt>, NewActions, StateExt>;
	}

	dispatch({ type: "@INIT" } as A);

	const store = {
		dispatch: dispatch as Dispatch<A>,
		subscribe,
		getState,
		replaceReducer,
	} as unknown as Store<ExtendState<S, StateExt>, A, StateExt>;

	return store;
}
