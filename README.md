# States
A finite state machine extension for micro:bit.
Using state machines can dramatically simplfy control flow code, while improving readbility.

## Defining states
States can have enter and exit behaviours as well as behaviours that can be looped while the state is active.

```blocks
states.setEnterHandler("Waiting", function () {
    
})
states.addLoopHandler("Waiting", function () {
    
})
states.setExitHandler("Waiting", function () {
    
})
```
## Using states
```blocks
states.setState("Waiting")
```
## Example
```blocks
states.setEnterHandler("Idle", function () {
    basic.clearScreen()
})
states.addLoopHandler("Idle", function () {
    if (input.lightLevel() < 10) {
        states.setState("Started")
    }
})
states.setEnterHandler("Started", function () {
    basic.showIcon(IconNames.Yes)
})
states.addLoopHandler("Started", function () {
    if (input.buttonIsPressed(Button.A)) {
        states.setState("Idle")
    }
})
states.addLoopHandler("Started", function () {
    led.plotBarGraph(
    input.lightLevel(),
    255
    )
})
states.setState("Idle")
```
## Advanced blocks
Do something whenever state has changed
```blocks
states.setChangeHandler(function() {})
```
Get the name of the currently active state
```blocks
states.currentState()
```
Get the name of the last active state
```blocks
states.previousState()
```
Get the name of the next active state (only works when while exiting a state)
```blocks
states.nextState()
```
Return `true` if the currently active state matches a given name
```blocks
states.matchCurrent("Waiting")
```
Return `true` if the last active state matches a given name
```blocks
states.matchPrevious("Waiting")
```
Return `true` if the next active state matches a given name (only works when while exiting a state)
```blocks
states.matchNext("Waiting")
```

## Multiple state machines
Multiple independamt state machines can be created by using a "Machine.State" naming convention in all the extension's blocks.
```blocks
states.setExitHandler("Sound.Low", function () {
    led.unplot(4, 4)
})
states.addLoopHandler("Sound.High", function () {
    led.toggle(4, 0)
    basic.pause(500)
})
states.addLoopHandler("Sound.Low", function () {
    led.toggle(4, 4)
    basic.pause(500)
})
states.addLoopHandler("Light.High", function () {
    led.toggle(0, 0)
    basic.pause(500)
})
states.setExitHandler("Light.High", function () {
    led.unplot(0, 0)
})
states.addLoopHandler("Light.Low", function () {
    led.toggle(0, 4)
    basic.pause(500)
})
states.setExitHandler("Sound.High", function () {
    led.unplot(4, 0)
})
states.setExitHandler("Light.Low", function () {
    led.unplot(0, 4)
})
basic.forever(function () {
    if (input.lightLevel() > 127) {
        states.setState("Light.High")
    } else {
        states.setState("Light.Low")
    }
    if (input.soundLevel() > 127) {
        states.setState("Sound.High")
    } else {
        states.setState("Sound.Low")
    }
})
```

## Sub-states
Sub states can be created by using a "State.Substate" naming convention.
A sub-state can be activated within a state without leaving the parent state.
Leaving the parent state will automatically deactivae all its sub-states.
```blocks
states.addLoopHandler("Playing.Idle", function () {
    led.toggle(2, 2)
    basic.pause(500)
})
states.setEnterHandler("Playing.B", function () {
    basic.clearScreen()
})
states.addLoopHandler("Idle", function () {
    if (input.buttonIsPressed(Button.A)) {
        states.setState("Playing")
    }
})
states.setEnterHandler("Playing.A", function () {
    basic.clearScreen()
})
states.addLoopHandler("Playing.A", function () {
    led.toggle(0, 2)
    basic.pause(500)
})
states.setEnterHandler("Playing.Idle", function () {
    basic.clearScreen()
})
states.addLoopHandler("Playing", function () {
    if (input.buttonIsPressed(Button.A)) {
        states.setState("Playing.A")
    } else if (input.buttonIsPressed(Button.B)) {
        states.setState("Playing.B")
    } else if (input.logoIsPressed()) {
        basic.clearScreen()
        states.setState("Idle")
    } else {
        states.setState("Playing.Idle")
    }
})
states.addLoopHandler("Playing.B", function () {
    led.toggle(4, 2)
    basic.pause(500)
})
states.setState("Idle")
```


#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
