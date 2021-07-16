import {Reducer} from "./main.types";
import {combineReducers, createStore} from "./main";


interface PersonReducer {
  name: string;
  family: string;
}

const initialPersonState: PersonReducer = {
  name: "Ali",
  family: "Torki"
}

const personReducer: Reducer<PersonReducer> = (state = initialPersonState, action) => {
  switch (action.type) {
    case "UPDATE":
      return {
        name: action.payload.name,
        family: action.payload.family
      };
    default:
      return state;
  }
}

interface CounterReducer {
  value: number;
}

const initialCounterReducer: CounterReducer = {
  value: 0,
}

const counterReducer: Reducer<CounterReducer> = (state = initialCounterReducer, action) => {
  switch (action.type) {
    case "INC":
      return {
        value: action.payload.value,
      };
    default:
      return state;
  }
}

interface StateNetwork {
  person: PersonReducer,
  counter: CounterReducer
}

const store = createStore<StateNetwork>(combineReducers({
  person: personReducer,
  counter: counterReducer
}));

test('Reducers Initialization', () => {
  expect(store.getState().person.name).toBe("Ali")
  expect(store.getState().person.family).toBe("Torki")
  expect(store.getState().counter.value).toBe(0)
});
