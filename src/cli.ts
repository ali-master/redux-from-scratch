#!/usr/bin/env node
import { createStore } from "./main";
import { combineReducers } from "./combineReducer";
// Types
import type { AnyAction, Reducer } from "./main.types";

interface PersonReducer {
	name: string;
	family: string;
}

const initialPersonState: PersonReducer = {
	name: "Ali",
	family: "Torki",
};

const personReducer: Reducer<PersonReducer> = (state = initialPersonState, action) => {
	switch (action.type) {
		case "UPDATE":
			return {
				name: action.payload.name,
				family: action.payload.family,
			};
		default:
			return state;
	}
};

interface CounterReducer {
	value: number;
}

const initialCounterReducer: CounterReducer = {
	value: 0,
};

const counterReducer: Reducer<CounterReducer> = (state = initialCounterReducer, action) => {
	switch (action.type) {
		case "INC":
			return {
				value: action.payload.value,
			};
		default:
			return state;
	}
};

interface StateNetwork {
	person: PersonReducer;
	counter: CounterReducer;
}

const store = createStore<StateNetwork, AnyAction, { e: CounterReducer }>(
	combineReducers({
		person: personReducer,
		counter: counterReducer,
	}),
);

console.log("before", store.getState());
store.replaceReducer(
	combineReducers({
		e: counterReducer,
	}),
);
console.log("after", store.getState().e.value);
