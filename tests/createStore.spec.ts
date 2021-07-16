import { createStore } from "../src/main";
import { combineReducers } from "../src/combineReducer";
import * as reducers from "./helpers/reducers";
import { Reducer } from "../src/main.types";

describe("createStore", () => {
	it("exposes the public API", () => {
		const store = createStore(combineReducers(reducers));

		const methods = Object.keys(store);

		expect(methods.length).toBe(4);
		expect(methods).toContain("subscribe");
		expect(methods).toContain("dispatch");
		expect(methods).toContain("getState");
		expect(methods).toContain("replaceReducer");
	});

	it("throws if reducer is not a function", () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		expect(() => createStore(undefined)).toThrow();

		expect(() => createStore("test" as unknown as Reducer)).toThrow();

		expect(() => createStore({} as unknown as Reducer)).toThrow();

		expect(() => createStore(() => {})).not.toThrow();
	});
});
