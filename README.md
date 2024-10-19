## StatesBit
State machine for micro:bit

```blocks
enum States {
    Default,
    Active,
    Inactive
}
states.setEnterHandler(States.Active, function () {
    basic.showIcon(IconNames.Happy)
})
states.addLoopHandler(States.Active, function () {
    led.plotBarGraph(
    input.lightLevel(),
    255
    )
})
states.setEnterHandler(States.Inactive, function () {
    basic.showIcon(IconNames.Sad)
})
basic.forever(function () {
    if (input.lightLevel() > 10) {
        states.setState(States.Active)
    } else {
        states.setState(States.Inactive)
    }
})
```

#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
