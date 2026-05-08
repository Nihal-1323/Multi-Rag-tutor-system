package com.omnicore.app.plugins

import android.content.Context
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import com.google.mediapipe.tasks.genai.llminference.LlmInference.LlmInferenceOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.File

@CapacitorPlugin(name = "MediaPipeInference")
class MediaPipeInferencePlugin : Plugin() {

    private var llmInference: LlmInference? = null
    private val scope = CoroutineScope(Dispatchers.Default)

    @PluginMethod
    fun loadModel(call: PluginCall) {
        val modelPath = call.getString("modelPath") ?: return call.reject("No model path provided")
        
        // Ensure model delegation to NPU/GPU based on availability (Samsung AICore specific integrations would go here)
        val absolutePath = File(context.filesDir, modelPath).absolutePath
        
        try {
            val options = LlmInferenceOptions.builder()
                .setModelPath(absolutePath)
                // Use max tokens to constrain initial memory footprint
                .setMaxTokens(1024) 
                .build()

            llmInference = LlmInference.createFromOptions(context, options)
            call.resolve()
        } catch (e: Exception) {
            call.reject("Failed to load model", e)
        }
    }

    @PluginMethod
    fun generateResponse(call: PluginCall) {
        val prompt = call.getString("prompt") ?: return call.reject("No prompt provided")
        val maxTokens = call.getInt("maxTokens") ?: 1024
        
        val llm = llmInference ?: return call.reject("Model not loaded")

        scope.launch {
            try {
                // To support streaming, we generate async and send partial results via events
                llm.generateResponseAsync(prompt)
                call.resolve()
            } catch (e: Exception) {
                call.reject("Inference failed", e)
            }
        }
    }

    @PluginMethod
    fun unloadModel(call: PluginCall) {
        llmInference?.close()
        llmInference = null
        call.resolve()
    }
}
