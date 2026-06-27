package com.pralayantaka.tracker

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

data class SpinRecordRequest(
    val userEmail: String,
    val gameType: String,
    val topSlotSegment: String?,
    val topSlotMultiplier: Double?,
    val result: String,
    val finalMultiplier: Double,
    val numberOfPlayers: Int,
    val totalWinningAmount: Double,
    val gameSpecificData: String?
)

interface ApiService {
    @POST("/api/spins")
    suspend fun createSpin(@Body request: SpinRecordRequest)
}

object ApiClient {
    private const val BASE_URL = "https://pralayantaka-platform-production.up.railway.app"

    val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
