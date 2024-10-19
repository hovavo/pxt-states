## StatesBit
State machine for micro:bit

```blocks
enum States {
    Default,
    Active,
    Inactive
}
states.setEnterHandler(1, function () {
    basic.showIcon(IconNames.Happy)
})
states.addLoopHandler(1, function () {
    led.plotBarGraph(
    input.lightLevel(),
    255
    )
})
states.setEnterHandler(2, function () {
    basic.showIcon(IconNames.Sad)
})
basic.forever(function () {
    if (input.lightLevel() > 10) {
        states.setState(1)
    } else {
        states.setState(2)
    }
})
```

#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
