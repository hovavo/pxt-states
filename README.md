## StatesBit
State machine for micro:bit

```blocks
states.setEnterHandler("Ready", function () {
    basic.showIcon(IconNames.Heart)
})
states.addLoopHandler("Ready", function () {
    led.plotBarGraph(
    input.lightLevel(),
    155
    )
})
states.setEnterHandler("Waiting", function () {
    basic.showIcon(IconNames.SmallDiamond)
})
states.debugOn()
basic.forever(function () {
    if (input.lightLevel() > 10) {
        states.setState("Ready")
    } else {
        states.setState("Waiting")
    }
})
```

#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
