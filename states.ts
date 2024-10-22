
//% color=#0fbc11 icon="\uf0e8"
namespace states {
    const ID_NONE = -1;

    /**
     * State identifier
     */
    //% shim=ENUM_GET
    //% advanced=true
    //% blockId=state_enum_shim
    //% block="$arg"
    //% enumName="States"
    //% enumMemberName="state"
    //% enumPromptHint="e.g. Waiting, Ready, ..."
    //% enumInitialMembers="Default"
    //% group="Main state"
    export function _stateEnumField(arg: number) {
        return arg;
    }

    /**
     * Activate a specified state.
     * If that state is already active it will not be restarted.
     * If another state is currently active, it will stop all repeating code and exit.
     * @param id the state to activate (see States enum)
     */
    //% block="go to $id"
    //% id.shadow="state_enum_shim"
    //% weight=100
    //% group="Main state"
    export function setState(id: number) {
        mainStateMachine.setState(id);
    }

    /**
     * Do something when a state is activated
     * @param id the state to attach the code to (see States enum)
     * @param enterHandler the code to run on activation
     */
    //% block="on $id start"
    //% id.shadow="state_enum_shim"
    //% weight=90
    //% group="Main state"
    export function setEnterHandler(id: number, enterHandler: () => void) {
        mainStateMachine.setEnterHandler(id, enterHandler);
    }

    /**
     * Do something when a state is deactivated.
     * The next state will activate only after this code is done.
     * @param id the state to attach the code to (see States enum)
     * @param exitHandler the code to run on deactivation
     */
    //% block="on $id exit"
    //% id.shadow="state_enum_shim"
    //% weight=80
    //% group="Main state"
    export function setExitHandler(id: number, exitHandler: () => void) {
        mainStateMachine.setExitHandler(id, exitHandler);
    }

    /**
     * Do something repeatedly while a state is active.
     * Multiple instances of this block can be define for any state.
     * This code will start repeating after the activation block is done, and before the deactivation block is started.
     * @param id the state to attach the code to (see States enum)
     * @param loopUpdateHandler the code to run on repeatedly
     */
    //% block="repeat while in $id"
    //% blockAllowMultiple=1
    //% id.shadow="state_enum_shim"
    //% weight=85
    //% group="Main state"
    export function addLoopHandler(id: number, loopUpdateHandler: () => void) {
        mainStateMachine.addLoopHandler(id, loopUpdateHandler);
    }

    /**
     * Do something whenever a state has changed
     * @param handler the code to run on deactivation
     */
    //% block="on state change"
    //% advanced=true 
    //% weight=70
    //% group="Main state"
    export function setChangeHandler(handler: () => void) {
        mainStateMachine.setChangeHandler(handler);
    }

    /**
     * Returns true if a given state is the currently active one 
     * @param id the state to match
     */
    //% block="state is $id"
    //% advanced=true
    //% id.shadow="state_enum_shim"
    //% weight=60
    //% group="Main state"
    export function matchCurrent(id: number) {
        return mainStateMachine.matchCurrent(id);
    }

    /**
     * Returns true if a given state preceeded the currently active one
     * @param id the state to match
     */
    //% block="previous state was $id"
    //% advanced=true
    //% id.shadow="state_enum_shim"
    //% weight=55
    //% group="Main state"
    export function matchPrevious(id: number) {
        return mainStateMachine.matchPrevious(id);
    }

    /**
     * Returns true if a given state matches the next active one.
     * This is available only within `on exit` blocks 
     * @param id the state to match
     */
    //% block="next state is $id"
    //% advanced=true
    //% id.shadow="state_enum_shim"
    //% weight=55
    //% group="Main state"
    export function matchNext(id: number) {
        return mainStateMachine.matchNext(id);
    }

    /**
     * Return the time (milliseconds) that passed since the current state was activated
     */
    //% block="time in state"
    //% advanced=true
    //% weight=52
    //% group="Main state"
    export function runningTime() {
        return mainStateMachine.runningTime;
    }

    export type StateProps = {
        id: number;
        enterHandler?: () => void;
        exitHandler?: () => void;
        loopUpdateHandler?: () => void;
    }

    export class State {
        _props: StateProps = {
            id: ID_NONE,
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
        _nextState: State;
        _changeHandler = () => { };

        constructor() {
            this._states = {};
            this.addState({
                id: ID_NONE,
                enterHandler: () => { },
                exitHandler: () => { },
                loopUpdateHandler: () => { },
            });
            this.setState(ID_NONE);
        }

        addState(props: StateProps) {
            this._states[props.id] = new State(props);
        }

        setEnterHandler(id: number, enterHandler: () => void) {
            this.updateOrAddState({ id, enterHandler });
        }

        setExitHandler(id: number, exitHandler: () => void) {
            this.updateOrAddState({ id, exitHandler });
        }

        addLoopHandler(id: number, loopUpdateHandler: () => void) {
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
            if (!this._currentState) return ID_NONE
            return this._currentState.id;
        }

        get previousId() {
            if (!this._previousState) return ID_NONE
            return this._previousState.id;
        }

        get nextId() {
            if (!this._nextState) return ID_NONE
            return this._nextState.id;
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
            this._nextState = next;
            if (previous) previous.exit();
            this._previousState = previous;
            this._currentState = next;
            this._changeHandler();
            next.enter();
        }

        matchCurrent(id: number) {
            return this.currentId === id;
        }

        matchPrevious(id: number) {
            return this.previousId === id;
        }

        matchNext(id: number) {
            return this.nextId === id;
        }

        has(id: number) {
            return !!this._states[id];
        }
    }

    const mainStateMachine = new StateMachine();
}
