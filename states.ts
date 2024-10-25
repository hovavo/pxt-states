
//% color=#0fbc11 icon="\uf0e8"
namespace states {

    //#region Main machine blocks

    /**
     * Activate a specified state.
     * If that state is already active it will not be restarted.
     * If another state is currently active, it will stop all repeating code and exit.
     * @param id the state to activate (see States enum)
     */
    //% block="go to $input"
    //% weight=100
    //% input.defl="Ready"
    //% group="Main state"
    export function setState(input: string) {
        const { machine, state } = UserInput.parse(input);
        StateMachines.getOrCreate(machine).setState(state);
    }

    /**
     * Do something when a state is activated
     * @param id the state to attach the code to (see States enum)
     * @param enterHandler the code to run on activation
     */
    //% block="on $input start"
    //% weight=90
    //% input.defl="Ready"
    //% group="Main state"
    export function setEnterHandler(input: string, enterHandler: () => void) {
        const { machine, state } = UserInput.parse(input);
        StateMachines.getOrCreate(machine).setEnterHandler(state, enterHandler);
    }

    /**
     * Do something when a state is deactivated.
     * The next state will activate only after this code is done.
     * @param id the state to attach the code to (see States enum)
     * @param exitHandler the code to run on deactivation
     */
    //% block="on $id exit"
    //% weight=80
    //% id.defl="Ready"
    //% group="Main state"
    export function setExitHandler(id: string, exitHandler: () => void) {
        StateMachines.main.setExitHandler(id, exitHandler);
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
    //% weight=85
    //% id.defl="Ready"
    //% group="Main state"
    export function addLoopHandler(id: string, loopUpdateHandler: () => void) {
        StateMachines.main.addLoopHandler(id, loopUpdateHandler);
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
        StateMachines.main.setChangeHandler(handler);
    }

    /**
     * Returns the currently active state id
     */
    //% block="current state"
    //% advanced=true
    //% weight=65
    //% group="Main state"
    export function currentState() {
        return StateMachines.main.currentId;
    }

    /**
     * Returns the previously active state id
     */
    //% block="previous state"
    //% advanced=true
    //% weight=64
    //% group="Main state"
    export function previousState() {
        return StateMachines.main.previousId;
    }

    /**
     * Returns the next active state id.
     * This is available only within `on exit` blocks
     */
    //% block="next state"
    //% advanced=true
    //% weight=63
    //% group="Main state"
    export function nextState() {
        return StateMachines.main.nextId;
    }

    /**
     * Returns true if a given state is the currently active one 
     * @param id the state to match
     */
    //% block="current state is $id"
    //% advanced=true
    //% weight=60
    //% id.defl="Ready"
    //% group="Main state"
    export function matchCurrent(id: string) {
        return StateMachines.main.matchCurrent(id);
    }

    /**
     * Returns true if a given state preceeded the currently active one
     * @param id the state to match
     */
    //% block="previous state was $id"
    //% advanced=true
    //% weight=55
    //% id.defl="Ready"
    //% group="Main state"
    export function matchPrevious(id: string) {
        return StateMachines.main.matchPrevious(id);
    }

    /**
     * Returns true if a given state matches the next active one.
     * This is available only within `on exit` blocks 
     * @param id the state to match
     */
    //% block="next state is $id"
    //% advanced=true
    //% weight=54
    //% id.defl="Ready"
    //% group="Main state"
    export function matchNext(id: string) {
        return StateMachines.main.matchNext(id);
    }

    /**
     * Return the time (milliseconds) that passed since the current state was activated
     */
    //% block="time in state"
    //% advanced=true
    //% weight=52
    //% group="Main state"
    export function runningTime() {
        return StateMachines.main.runningTime;
    }

    /**
     * Show state changes in the console
     */
    //% block="debug states || $value"
    //% advanced=true
    //% weight=51
    //% value.defl=true
    //% value.shadow="toggleOnOff"
    //% group="Main state"
    export function debugOn(value: boolean = true) {
        debugStateChange = value;
    }

    //#endregion
    //#region Types

    export type StateProps = {
        id: string;
        enterHandler?: () => void;
        exitHandler?: () => void;
        loopUpdateHandler?: () => void;
    }

    //#endregion
    //#region Classes

    export class State {
        static ID_NONE = '__none__';

        _props: StateProps = {
            id: State.ID_NONE,
            enterHandler: () => { },
            exitHandler: () => { }
        };
        _isActive: boolean;
        _startTime = 0;
        _loopUpdateHandlers: (() => void)[] = [];

        constructor(props: StateProps = null) {
            if (props) this.updateProps(props);
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
            if (props.enterHandler) {
                this._props.enterHandler = props.enterHandler;
            }
            if (props.exitHandler) {
                this._props.exitHandler = props.exitHandler;
            }
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

        toString() {
            return `State: ${this.id}`;
        }
    }

    export class StateMachine {
        static MAIN_ID = "__main__"

        id: string;

        _states: { [key: string]: State } = {};
        _currentState: State;
        _previousState: State;
        _nextState: State;
        _changeHandler = () => { };

        constructor(id: string) {
            this.id = id;
            this.addState();
            this.deactivate();
        }

        deactivate() {
            this.setState(State.ID_NONE);
        }

        addState(props: StateProps = null) {
            const id = props ? props.id : State.ID_NONE;
            this._states[normalizeString(id)] = new State(props);
        }

        setEnterHandler(id: string, enterHandler: () => void) {
            this.updateOrAddState({ id, enterHandler });
        }

        setExitHandler(id: string, exitHandler: () => void) {
            this.updateOrAddState({ id, exitHandler });
        }

        addLoopHandler(id: string, loopUpdateHandler: () => void) {
            this.updateOrAddState({ id, loopUpdateHandler });
        }

        updateOrAddState(props: StateProps) {
            const state = this.getState(props.id);
            if (state) {
                state.updateProps(props);
            } else {
                this.addState(props);
            }
        }

        get currentId() {
            if (!this._currentState) return State.ID_NONE
            return this._currentState.id;
        }

        get previousId() {
            if (!this._previousState) return State.ID_NONE
            return this._previousState.id;
        }

        get nextId() {
            if (!this._nextState) return State.ID_NONE
            return this._nextState.id;
        }

        get runningTime() {
            return this._currentState.runningTime;
        }

        setChangeHandler(handler: () => void) {
            this._changeHandler = handler;
        }

        setState(id: string) {
            if (normalizeString(id) === this.currentId) return;
            const previous = this._currentState;
            const next = this.getState(id);
            if (!next) {
                logString(`Warning: state ${id} not defined!`);
                return;
            };
            this._nextState = next;
            if (previous) previous.exit();
            this._previousState = previous;
            this._currentState = next;
            this._changeHandler();
            this.debug();
            next.enter();
        }

        getState(id: string) {
            return this._states[normalizeString(id)];
        }

        matchCurrent(id: string) {
            return this.currentId === normalizeString(id);
        }

        matchPrevious(id: string) {
            return this.previousId === normalizeString(id);
        }

        matchNext(id: string) {
            return this.nextId === normalizeString(id);
        }

        has(id: string) {
            return !!this.getState(id);
        }

        debug() {
            if (this != StateMachines.main) {
                logString(this.toString());
            }
            logString(this._currentState.toString());
        }

        toString() {
            return `Machine: ${this.id}`;
        }
    }

    class StateMachines {
        static main: StateMachine;
        static userAdded: { [key: string]: StateMachine } = {};

        static add(id: string) {
            const machine = new StateMachine(id);
            StateMachines.userAdded[normalizeString(id)] = machine;
            return machine;
        }

        static get(id: string = null) {
            if (!id) return StateMachines.main;
            return StateMachines.userAdded[normalizeString(id)];
        }

        static getOrCreate(id: string = null) {
            return StateMachines.get(id) || StateMachines.add(id);
        }
    }

    class UserInput {
        static parse(input: string): { machine: string | null; state: string } {
            let separatorIndex = input.indexOf('.');
            if (separatorIndex !== -1) {
                const machine = input.substr(0, separatorIndex);
                const state = input.substr(separatorIndex + 1);
                return { machine, state };
            } else {
                return { machine: null, state: input };
            }
        }
    }

    //#endregion
    //#region Utilities
    const normalizeString = (id: string) => id.trim().toLowerCase();

    // const parseUserInput = (input: string)

    function logString(value: string) {
        if (debugStateChange) {
            serial.writeLine(value);
        }
    }

    //#endregion
    //#region Initialization
    let debugStateChange = false;    
    StateMachines.main = new StateMachine(StateMachine.MAIN_ID);
}