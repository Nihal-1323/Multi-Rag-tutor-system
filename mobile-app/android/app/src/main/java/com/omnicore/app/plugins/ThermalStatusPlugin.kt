package com.omnicore.app.plugins

import android.content.Context
import android.os.Build
import android.os.PowerManager
import androidx.annotation.RequiresApi
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "ThermalStatus")
class ThermalStatusPlugin : Plugin() {

    private var powerManager: PowerManager? = null

    override fun load() {
        super.load()
        powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            powerManager?.addThermalStatusListener { status ->
                val headroom = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    powerManager?.getThermalHeadroom(30) ?: -1f
                } else {
                    -1f
                }
                
                val ret = JSObject()
                ret.put("status", status)
                ret.put("headroom", headroom)
                
                val mode = if (headroom >= 0.8f || status >= PowerManager.THERMAL_STATUS_MODERATE) "text-only" else "full"
                val maxTokens = if (mode == "text-only") 50 else 1024

                ret.put("mode", mode)
                ret.put("maxTokens", maxTokens)
                
                notifyListeners("thermalStatusChanged", ret)
            }
        }
    }

    @PluginMethod
    fun getThermalProfile(call: PluginCall) {
        val ret = JSObject()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val headroom = powerManager?.getThermalHeadroom(30) ?: -1f
            val status = powerManager?.currentThermalStatus ?: -1
            
            val mode = if (headroom >= 0.8f || status >= PowerManager.THERMAL_STATUS_MODERATE) "text-only" else "full"
            val maxTokens = if (mode == "text-only") 50 else 1024

            ret.put("headroom", headroom)
            ret.put("status", status)
            ret.put("mode", mode)
            ret.put("maxTokens", maxTokens)
            call.resolve(ret)
        } else {
            // Fallback for older devices
            ret.put("mode", "full")
            ret.put("maxTokens", 1024)
            ret.put("headroom", -1f)
            call.resolve(ret)
        }
    }
}
