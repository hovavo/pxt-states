
//% color=#0fbc11
namespace states {

    const NONE = -1;

    //% shim=ENUM_GET
    //% advanced=true
    //% blockId=state_enum_shim
    //% block="$arg"
    //% enumName="States"
    //% enumMemberName="state"
    //% enumPromptHint="e.g. Waiting, Ready, ..."
    //% enumInitialMembers="Default"
    //% group="Main state"
    export function _stateEnumShim(arg: number) {
        return arg;
    }

    //% block="go to $id"
    //% id.shadow="state_enum_shim"
    //% weight=100
    //% group="Main state"
    export function defaulSetState(id: number) {
        defaultStateMachine.setState(id);
    }

    //% block="on $id"
    //% id.shadow="state_enum_shim"
    //% weight=90
    //% group="Main state"
    export function defaultSetStateEnter(id: number, enterHandler: () => void) {
        defaultStateMachine.setStateEnter(id, enterHandler);
    }

    //% block="after $id"
    //% id.shadow="state_enum_shim"
    //% weight=80
    //% group="Main state"
    export function defaultAddStateExit(id: number, exitHandler: () => void) {
        defaultStateMachine.addStateExit(id, exitHandler);
    }

    //% block="while $id"
    //% blockAllowMultiple=1
    //% id.shadow="state_enum_shim"
    //% weight=85
    //% group="Main state"
    export function defaultSetStateLoopUpdate(id: number, loopUpdateHandler: () => void) {
        defaultStateMachine.setStateLoopUpdate(id, loopUpdateHandler);
    }

    //% block="on state change"
    //% advanced=true 
    //% weight=70
    //% group="Main state"
    export function defaultSetChangeHandler(handler: () => void) {
        defaultStateMachine.setChangeHandler(handler);
    }

    //% block="state is $id"
    //% advanced=true
    //% id.shadow="state_enum_shim"
    //% weight=60
    //% group="Main state"
    export function defaultMatchCurrent(id: number) {
        return defaultStateMachine.matchCurrent(id);
    }

    //% block="previous state was $id"
    //% advanced=true
    //% id.shadow="state_enum_shim"
    //% weight=55
    //% group="Main state"
    export function defaultMatchPrevious(id: number) {
        return defaultStateMachine.matchPrevious(id);
    }

    //% block="state time"
    //% advanced=true
    //% weight=52
    //% group="Main state"
    export function defaultRunningTime() {
        return defaultStateMachine.runningTime;
    }

    export function addStateMachine() {
        return new StateMachine();
    }

    export type StateProps = {
        id: number;
        enterHandler?: () => void;
        exitHandler?: () => void;
        loopUpdateHandler?: () => void;
    }

    export class State {
        _props: StateProps = {
            id: NONE,
            enterHandler: () => {},
            exitHandler: () => {}
        };
        _isActive: boolean;
        _startTime = 0;
        _loopUpdateHandlers: (() => void)[] = [];

        constructor(props: StateProps) {
            this.updateProps(props);
            this._isActive = false;
        }

        get id() {
            return this._props.id;
        }

        get runningTime() {
            return this._startTime = input.runningTime();
        }

        enter() {
            this._isActive = true;
            this._props.enterHandler();
            this._startLoops();
        }

        exit() {
            this._isActive = false;
            this._props.exitHandler();
        }

        updateProps(props: StateProps) {
            this._props.id = props.id;
            this._props.enterHandler = props.enterHandler || this._props.enterHandler;
            this._props.exitHandler = props.exitHandler || this._props.exitHandler;
            if (props.loopUpdateHandler) {
                this._loopUpdateHandlers.push(props.loopUpdateHandler);
            }
        }

        _startLoops() {
            this._loopUpdateHandlers.forEach(handler => {
                control.inBackground(() => {
                    while (this._isActive) {
                        handler();
                        basic.pause(1);
                    }
                });
            });
        }
    }

    export class StateMachine {
        _states: { [key: number]: State };
        _currentState: State;
        _previousState: State;
        _changeHandler = () => { };

        constructor() {
            this._states = {};
            this.addState({
                id: NONE,
                enterHandler: () => { },
                exitHandler: () => { },
                loopUpdateHandler: () => { },
            });
            this.setState(NONE);
        }

        addState(props: StateProps) {
            this._states[props.id] = new State(props);
        }

        setStateEnter(id: number, enterHandler: () => void) {
            this.updateOrAddState({ id, enterHandler });
        }

        addStateExit(id: number, exitHandler: () => void) {
            this.updateOrAddState({ id, exitHandler });
        }

        setStateLoopUpdate(id: number, loopUpdateHandler: () => void) {
            this.updateOrAddState({ id, loopUpdateHandler });
        }

        updateOrAddState(props: StateProps) {
            if (this.has(props.id)) {
                this._states[props.id].updateProps(props);
            } else {
                this.addState(props);
            }
        }

        get currentId() {
            if (!this._currentState) return NONE
            return this._currentState.id;
        }

        get previousId() {
            if (!this._previousState) return NONE
            return this._previousState.id;
        }

        get runningTime() {
            return this._currentState.runningTime;
        }

        setChangeHandler(handler: () => void) {
            this._changeHandler = handler;
        }

        setState(id: number) {
            const previous = this._currentState;
            if (previous && previous.id === id) return;
            const next = this._states[id];
            if (!next) {
                console.warn(`state ${id} not defined!`)
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
