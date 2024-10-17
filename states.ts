
//% color=#0fbc11
namespace states {
    
    const NONE = -1;

    //% shim=ENUM_GET
    //% blockId=state_enum_shim
    //% block="$arg"
    //% enumName="States"
    //% enumMemberName="state"
    //% enumPromptHint="e.g. Waiting, Ready, ..."
    //% enumInitialMembers="Default"
    export function _stateEnumShim(arg: number) {
        return arg;
    }

    //% blockId=log_state
    //% block="log $state"
    //% state.shadow="state_enum_shim"
    export function logState(state: number) {
        console.log(state);
    }

    //% block="when state is $id"
    //% handlerStatement=1
    //% expandableArgumentMode="enabled"
    //% draggableParameters="reporter"
    //% id.shadow="state_enum_shim"
    export function defaultAddState(id: number, handleEnter: () => void) {
        defaultStateMachine.addState({ id, handleEnter });
    }

    //% block="set state to $id"
    //% id.shadow="state_enum_shim"
    export function defaulSetState(id: number) {
        defaultStateMachine.setState(id);
    }

    //% block="state is $id"
    //% id.shadow="state_enum_shim"
    export function defaultMatchCurrent(id: number) {
        return defaultStateMachine.matchCurrent(id);
    }

    //% block="previous state was $id"
    //% id.shadow="state_enum_shim"
    export function defaultMatchPrevious(id: number) {
        return defaultStateMachine.matchPrevious(id);
    }

    export type StateProps = {
        id: number;
        handleEnter: () => void;
    }

    export class State {
        _props: StateProps;
        constructor(props: StateProps) {
            this._props = props;
        }

        get id() {
            return this._props.id;
        }

        enter() {
            this._props.handleEnter();
        }
    }

    export class StateMachine {
        _states: {[key: number]: State};
        _currentState: State;
        _previousState: State;

        constructor() {
            this._states = {};
            this.addState({
                id: NONE,
                handleEnter: () => {}
            });
            this.setState(NONE);
        }

        addState(props: StateProps) {
            this._states[props.id] = new State(props);
        }

        get currentId () { 
            if (!this._currentState) return NONE
            return this._currentState.id;
        }

        get previousId() {
            if (!this._previousState) return NONE
            return this._previousState.id;
        }

        setState(id: number) {
            const previous = this._currentState;
            if (previous && previous.id === id) return;
            const next = this._states[id];
            if (!next) {
                // TODO: Warn?
                return;
            };
            this._currentState = next;
            this._previousState = previous;
            next.enter();
        }

        matchCurrent(id: number) {
            return this.currentId === id;
        }

        matchPrevious(id: number) {
            return this.previousId === id;
        }
    }

    export const defaultStateMachine = new StateMachine();


    
}
