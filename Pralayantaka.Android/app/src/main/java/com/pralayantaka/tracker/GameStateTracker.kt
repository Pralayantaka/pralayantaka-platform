package com.pralayantaka.tracker

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

enum class GameState {
    WAITING_FOR_SPIN,
    TOP_SLOT_ACTIVE,
    WHEEL_SPINNING,
    RESULT_SHOWN
}

class GameStateTracker {
    var currentState: GameState = GameState.WAITING_FOR_SPIN
        private set

    private val scope = CoroutineScope(Dispatchers.IO)

    fun updateState(newState: GameState) {
        if (currentState != newState) {
            currentState = newState
            // Trigger callbacks or logic based on state transitions
        }
    }

    fun processRecognizedText(text: String) {
        val lowerText = text.lowercase()
        
        if (lowerText.contains("place your bets")) {
            updateState(GameState.WAITING_FOR_SPIN)
        } else if (lowerText.contains("no more bets")) {
            updateState(GameState.WHEEL_SPINNING)
        } else if (currentState == GameState.WHEEL_SPINNING) {
            // Very basic heuristic for detecting spin results
            val isWinner = lowerText.contains("winner") || lowerText.contains("pays")
            if (isWinner) {
                var segment = ""
                if (lowerText.contains("crazy time")) segment = "Crazy Time"
                else if (lowerText.contains("cash hunt")) segment = "Cash Hunt"
                else if (lowerText.contains("pachinko")) segment = "Pachinko"
                else if (lowerText.contains("coin flip")) segment = "Coin Flip"
                else if (lowerText.contains("10")) segment = "10"
                else if (lowerText.contains("5")) segment = "5"
                else if (lowerText.contains("2")) segment = "2"
                else if (lowerText.contains("1")) segment = "1"

                if (segment.isNotEmpty()) {
                    updateState(GameState.RESULT_SHOWN)
                    sendDataToApi(segment)
                }
            }
        }
    }

    private fun sendDataToApi(segment: String) {
        scope.launch {
            try {
                ApiClient.apiService.createSpin(
                    SpinRecordRequest(
                        userEmail = "architect@pralayantaka.com",
                        gameType = "Crazy Time",
                        topSlotSegment = null,
                        topSlotMultiplier = null,
                        result = segment,
                        finalMultiplier = 1.0,
                        numberOfPlayers = 0,
                        totalWinningAmount = 0.0,
                        gameSpecificData = null
                    )
                )
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
