
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

    //% block="when state is $id"
    //% id.shadow="state_enum_shim"
    //% weight=100
    export function defaultAddStateEnter(id: number, handleEnter: () => void) {
        defaultStateMachine.updateOrAddState({ id, handleEnter });
    }

    //% block="set state to $id"
    //% id.shadow="state_enum_shim"
    //% weight=90
    export function defaulSetState(id: number) {
        defaultStateMachine.setState(id);
    }

    //% block="when state exits $id"
    //% id.shadow="state_enum_shim"
    //% weight=80
    export function defaultAddStateExit(id: number, handleExit: () => void) {
        defaultStateMachine.updateOrAddState({ id, handleExit });
    }

    //% block="on state change"
    //% weight=70
    export function defaultSetHandler(handler: () => void) {
        defaultStateMachine.setChangeHandler(handler);
    }

    //% block="state is $id"
    //% id.shadow="state_enum_shim"
    //% weight=60
    export function defaultMatchCurrent(id: number) {
        return defaultStateMachine.matchCurrent(id);
    }

    //% block="previous state was $id"
    //% id.shadow="state_enum_shim"
    //% weight=55
    export function defaultMatchPrevious(id: number) {
        return defaultStateMachine.matchPrevious(id);
    }

    export type StateProps = {
        id: number;
        handleEnter?: () => void;
        handleExit?: () => void;
    }

    export class State {
        _props: StateProps;
        constructor(props: StateProps) {
            props.handleEnter = props.handleEnter || (() => {});
            props.handleExit = props.handleExit || (() => {});
            this._props = props;
        }

        get id() {
            return this._props.id;
        }

        enter() {
            this._props.handleEnter();
        }

        exit() {
            this._props.handleExit();
        }

        updateProps(props:StateProps) {
            this._props.handleEnter = props.handleEnter || this._props.handleEnter;
            this._props.handleExit = props.handleExit || this._props.handleExit;
        }
    }

    export class StateMachine {
        _states: {[key: number]: State};
        _currentState: State;
        _previousState: State;
        _changeHandler = () => {};

        constructor() {
            this._states = {};
            this.addState({
                id: NONE,
                handleEnter: () => {},
                handleExit: () => { },
            });
            this.setState(NONE);
        }

        addState(props: StateProps) {
            this._states[props.id] = new State(props);
        }

        updateOrAddState(props: StateProps) {
            if (this.has(props.id)) {
                this._states[props.id].updateProps(props);
            } else {
                this.addState(props);
            }
        }

        get currentId () { 
            if (!this._currentState) return NONE
            return this._currentState.id;
        }

        get previousId() {
            if (!this._previousState) return NONE
            return this._previousState.id;
        }

        setChangeHandler(handler: () => void) {
            this._changeHandler = handler;
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
            if (previous) previous.exit();
            next.enter();
            this._changeHandler();
        }

        matchCurrent(id: number) {
            return this.currentId === id;
        }

        matchPrevious(id: number) {
            return this.previousId === id;
        }

        has(id: number) {
           return !!this._states[id]; 
        }
    }

    export const defaultStateMachine = new StateMachine();
}
