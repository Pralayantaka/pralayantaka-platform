package com.pralayantaka.tracker

enum class GameState {
    WAITING_FOR_SPIN,
    TOP_SLOT_ACTIVE,
    WHEEL_SPINNING,
    RESULT_SHOWN
}

class GameStateTracker {
    var currentState: GameState = GameState.WAITING_FOR_SPIN
        private set

    fun updateState(newState: GameState) {
        if (currentState != newState) {
            currentState = newState
            // Trigger callbacks or logic based on state transitions
        }
    }
}
