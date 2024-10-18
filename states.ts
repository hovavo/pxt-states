
//% color=#0fbc11
//% groups="['Main state', 'Custom states']"
namespace states {
    
    const NONE = -1;

    //% shim=ENUM_GET
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

    //% block="once state is $id"
    //% id.shadow="state_enum_shim"
    //% weight=100
    //% group="Main state"
    export function defaultSetStateEnter(id: number, handleEnter: () => void) {
        defaultStateMachine.setStateEnter(id, handleEnter);
    }

    //% block="set state to $id"
    //% id.shadow="state_enum_shim"
    //% weight=90
    //% group="Main state"
    export function defaulSetState(id: number) {
        defaultStateMachine.setState(id);
    }

    //% block="when state exits $id"
    //% id.shadow="state_enum_shim"
    //% weight=80
    //% group="Main state"
    export function defaultSetStateExit(id: number, handleExit: () => void) {
        defaultStateMachine.setStateEnter(id, handleExit);
    }

    //% block="while state is $id"
    //% id.shadow="state_enum_shim"
    //% weight=85
    //% group="Main state"
    export function defaultSetStateLoopUpdate(id: number, handleLoopUpdate: () => void) {
        defaultStateMachine.setStateLoopUpdate(id, handleLoopUpdate);
    }

    //% block="on state change"
    //% weight=70
    //% group="Main state"
    export function defaultSetChangeHandler(handler: () => void) {
        defaultStateMachine.setChangeHandler(handler);
    }

    //% block="state is $id"
    //% id.shadow="state_enum_shim"
    //% weight=60
    //% group="Main state"
    export function defaultMatchCurrent(id: number) {
        return defaultStateMachine.matchCurrent(id);
    }

    //% block="previous state was $id"
    //% id.shadow="state_enum_shim"
    //% weight=55
    //% group="Main state"
    export function defaultMatchPrevious(id: number) {
        return defaultStateMachine.matchPrevious(id);
    }

    //% block="new state machine"
    //% blockSetVariable=myStateMachine
    //% group="Custom states"
    export function addStateMachine() {
        return new StateMachine();
    }

    export type StateProps = {
        id: number;
        handleEnter?: () => void;
        handleExit?: () => void;
        handleLoopUpdate?: () => void;
    }

    export class State {
        _props: StateProps;
        _isActive: boolean;
        constructor(props: StateProps) {
            props.handleEnter = props.handleEnter || (() => {});
            props.handleExit = props.handleExit || (() => {});
            props.handleLoopUpdate = props.handleLoopUpdate || (() => {});
            this._props = props;
            this._isActive = false;
        }

        get id() {
            return this._props.id;
        }

        enter() {
            this._isActive = true;
            this._props.handleEnter();
            if (this._props.handleLoopUpdate) {
                this._startLoop();
            }
        }

        exit() {
            this._props.handleExit();
            this._isActive = false;
        }

        updateProps(props:StateProps) {
            this._props.handleEnter = props.handleEnter || this._props.handleEnter;
            this._props.handleExit = props.handleExit || this._props.handleExit;
            this._props.handleLoopUpdate = props.handleLoopUpdate || this._props.handleLoopUpdate;
        }

        _startLoop() {
            control.inBackground(() => {
                while(this._isActive)
                    this._props.handleLoopUpdate();
            })
        }
    }

    //% shim=ENUM_GET
    //% blockId=custom_state_enum_shim
    //% block="$arg"
    //% enumName="CustomStates"
    //% enumMemberName="state"
    //% enumPromptHint="e.g. Waiting, Ready, ..."
    //% enumInitialMembers="Default"
    //% group="Custom states"
    export function _customStateEnumShim(arg: number) {
        return arg;
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
                handleExit: () => {},
                handleLoopUpdate: () => {},
            });
            this.setState(NONE);
        }

        addState(props: StateProps) {
            this._states[props.id] = new State(props);
        }

        //% block="when $this is $id"
        //% handlerStatement
        //% this.defl=myStateMachine
        //% this.shadow=variables_get
        //% id.shadow="custom_state_enum_shim"
        //% weight=100
        //% group="Custom states"
        setStateEnter(id: number, handleEnter: () => void) {
            this.updateOrAddState({ id, handleEnter });
        }

        setStateExit(id: number, handleExit: () => void) {
            this.updateOrAddState({ id, handleExit });
        }

        setStateLoopUpdate(id: number, handleLoopUpdate: () => void) {
            this.updateOrAddState({ id, handleLoopUpdate });
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

        //% block="set $this to $id"
        //% this.defl=myStateMachine
        //% this.shadow=variables_get
        //% id.shadow="custom_state_enum_shim"
        //% weight=90
        //% group="Custom states"
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
