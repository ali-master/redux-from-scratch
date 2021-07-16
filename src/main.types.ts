export interface Action {
	type: string;
}

export interface AnyAction extends Action {
	[extraProps: string]: any;
}

export interface Dispatch<A extends Action = AnyAction> {
	<T extends A>(action: T): T;
}

export type Listener = () => void;

export interface Unsubscribe {
	(): void;
}

export interface Store<S = any, A extends Action = AnyAction, StateExt = never> {
	getState(): S;

	subscribe(listener: Listener): Unsubscribe;

	dispatch: Dispatch<A>;

	replaceReducer<NewState, NewActions extends Action = AnyAction>(
		nextReducer: Reducer<NewState, NewActions>,
	): Store<ExtendState<NewState, StateExt>, NewActions, StateExt>;
}

export type Reducer<S = any, A extends Action = AnyAction> = (state: S, action: A) => S;
export type PreloadedState<S> = Required<S>;

export declare const $CombinedState: unique symbol;

export type ReducersMapObject<S = any, A extends Action = AnyAction> = {
	[K in keyof S]: Reducer<S[K], A>;
};
export type CombinedState<S> = { readonly [$CombinedState]?: undefined } & S;

export type StateFromReducerMapObject<M> = M extends ReducersMapObject
	? {
			[P in keyof M]: M[P] extends Reducer<infer S, any> ? S : never;
	  }
	: never;

export type ExtendState<State, Extension> = [Extension] extends [never] ? State : State & Extension;
