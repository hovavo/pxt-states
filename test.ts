/**
 * Test suit expected results (on start):
 *
 * 1. V icon is displayed
 * 2. Data console prints:
 *      State: idle
 *      State changed:
 *      - Current state: idle
 *      - Previous state: __none__
 *      - Current state is "Idle": true
 *      - Previous state was "Idle": false
 * 3. Pause till running time is larger than 3 seconds
 * 4. Data console prints:
 *      Idle state exit:
 *      - Next state: done
 *      - Next state is "Idle": false
 * 5. "Bye!" is displayed
 * 6. When "Bye!" is done, X icon is displayed
 * 7. Data console prints:
 *      State: done
 *      State changed:
 *      - Current state: done
 *      - Previous state: idle
 *      - Current state is "Idle": false
 *      - Previous state was "Idle": true
 */


states.setExitHandler("Idle", function () {
    serial.writeLine("Idle state exit:")
    serial.writeLine("- Next state: " + states.nextState())
    serial.writeLine("- Next state is \"Idle\": " + states.matchNext("Idle"))
    basic.clearScreen()
    basic.showString("Bye!")
})
states.setChangeHandler(function () {
    serial.writeLine("State changed:")
    serial.writeLine("- Current state: " + states.currentState())
    serial.writeLine("- Previous state: " + states.previousState())
    serial.writeLine("- Current state is \"Idle\": " + states.matchCurrent("Idle"))
    serial.writeLine("- Previous state was \"Idle\": " + states.matchPrevious("Idle"))
})
states.addLoopHandler("Idle", function () {
    if (input.runningTime() > 3000) {
        states.setState("Done")
    }
})
states.setEnterHandler("Idle", function () {
    basic.showIcon(IconNames.Yes)
})
states.setEnterHandler("Done", function () {
    basic.showIcon(IconNames.No)
})
states.debugOn()
states.setState("Idle")
