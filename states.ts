
//% color=#0fbc11
namespace states {
    
    const NONE = "__none__";

    //% block="when state is $name"
    //% handlerStatement=1
    //% expandableArgumentMode="enabled"
    //% draggableParameters="reporter"
    //% name.defl="default"
    export function defaultAddState(name: string, handleEnter: () => void) {
        defaultStateMachine.addState({ name, handleEnter });
    }

    //% block="set state to $name"
    //% name.defl="default"
    export function defaulSetState(name: string) {
        defaultStateMachine.setState(name);
    }

    //% block="current state"
    export function deafultGetState() {
        return defaultStateMachine.getState();
    }

    //% block="previous state"
    export function deafultGetPrevious() {
        return defaultStateMachine.getPrevious();
    }

    export type StateProps = {
        name: string;
        handleEnter: () => void;
    }

    export class State {
        _props: StateProps;
        constructor(props: StateProps) {
            this._props = props;
        }

        get name() {
            return this._props.name;
        }

        enter() {
            this._props.handleEnter();
        }
    }

    export class StateMachine {
        _states: {[key: string]: State};
        _currentState: State;
        _previousState: State;

        constructor() {
            this._states = {};
            this.addState({
                name: NONE,
                handleEnter: () => {}
            });
            this.setState(NONE);
        }

        addState(props: StateProps) {
            this._states[props.name] = new State(props);
        }

        getState() {
            if (!this._currentState) return NONE
            return this._currentState.name;
        }

        getPrevious() {
            if (!this._previousState) return NONE
            return this._previousState.name;
        }

        setState(name: string) {
            const previous = this._currentState;
            if (previous && previous.name === name) return;
            const next = this._states[name];
            if (!next) {
                // TODO: Warn?
                return;
            };
            this._currentState = next;
            this._previousState = previous;
            next.enter();
        }
    }

    export const defaultStateMachine = new StateMachine();


    
}
