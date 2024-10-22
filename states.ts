
//% color=#0fbc11 icon="\uf0e8"
namespace states {
    /**
     * Activate a specified state.
     * If that state is already active it will not be restarted.
     * If another state is currently active, it will stop all repeating code and exit.
     * @param id the state to activate (see States enum)
     */
    //% block="go to $id"
    //% weight=100
    //% id.defl="Ready"
    //% group="Main state"
    export function setState(id: string) {
        mainStateMachine.setState(id);
    }

    /**
     * Do something when a state is activated
     * @param id the state to attach the code to (see States enum)
     * @param enterHandler the code to run on activation
     */
    //% block="on $id start"
    //% weight=90
    //% id.defl="Ready"
    //% group="Main state"
    export function setEnterHandler(id: string, enterHandler: () => void) {
        mainStateMachine.setEnterHandler(id, enterHandler);
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
    //% weight=85
    //% id.defl="Ready"
    //% group="Main state"
    export function addLoopHandler(id: string, loopUpdateHandler: () => void) {
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
     * Returns the currently active state id
     */
    //% block="current state"
    //% advanced=true
    //% weight=65
    //% group="Main state"
    export function currentState() {
        return mainStateMachine.currentId;
    }

    /**
     * Returns the previously active state id
     */
    //% block="previous state"
    //% advanced=true
    //% weight=65
    //% group="Main state"
    export function previousState() {
        return mainStateMachine.previousId;
    }

    /**
     * Returns the next active state id.
     * This is available only within `on exit` blocks
     */
    //% block="next state"
    //% advanced=true
    //% weight=65
    //% group="Main state"
    export function nextState() {
        return mainStateMachine.nextId;
    }

    /**
     * Returns true if a given state is the currently active one 
     * @param id the state to match
     */
    //% block="state is $id"
    //% advanced=true
    //% weight=60
    //% id.defl="Ready"
    //% group="Main state"
    export function matchCurrent(id: string) {
        return mainStateMachine.matchCurrent(id);
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
        return mainStateMachine.matchPrevious(id);
    }

    /**
     * Returns true if a given state matches the next active one.
     * This is available only within `on exit` blocks 
     * @param id the state to match
     */
    //% block="next state is $id"
    //% advanced=true
    //% weight=55
    //% id.defl="Ready"
    //% group="Main state"
    export function matchNext(id: string) {
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

    export type StateProps = {
        id: string;
        enterHandler?: () => void;
        exitHandler?: () => void;
        loopUpdateHandler?: () => void;
    }

    export class State {
        _props: StateProps = {
            id: ID_NONE,
            enterHandler: () => { },
            exitHandler: () => { }
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

        toString() {
            return `State: ${this.id}`;
        }
    }

    export class StateMachine {
        _states: { [key: string]: State };
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
            this._states[clean(props.id)] = new State(props);
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

        setState(id: string) {
            if (clean(id) === this.currentId) return;
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
            logString(this._currentState.toString());
            next.enter();
        }

        getState(id: string) {
            return this._states[clean(id)];
        }

        matchCurrent(id: string) {
            return this.currentId === clean(id);
        }

        matchPrevious(id: string) {
            return this.previousId === clean(id);
        }

        matchNext(id: string) {
            return this.nextId === clean(id);
        }

        has(id: string) {
            return !!this.getState(id);
        }
    }

    function logString(value: string) {
        if (debugStateChange) {
            serial.writeLine(value);
        }
    }

    let debugStateChange = false;

    const ID_NONE = '__none__';
    const clean = (id: string) => id.trim().toLowerCase();
    const mainStateMachine = new StateMachine();
}