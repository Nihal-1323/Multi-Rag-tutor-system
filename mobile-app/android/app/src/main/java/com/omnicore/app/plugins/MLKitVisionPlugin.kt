package com.omnicore.app.plugins

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions

@CapacitorPlugin(name = "MLKitVision")
class MLKitVisionPlugin : Plugin() {

    @PluginMethod
    fun extractText(call: PluginCall) {
        val base64Image = call.getString("image") ?: return call.reject("No image provided")
        val mode = call.getString("mode") ?: "UI" // "DOCUMENT" or "UI"

        try {
            val imageBytes = Base64.decode(base64Image, Base64.DEFAULT)
            val bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
            val image = InputImage.fromBitmap(bitmap, 0)

            // Using Latin script recognizer as default, can be expanded
            val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

            recognizer.process(image)
                .addOnSuccessListener { visionText ->
                    val result = JSObject()
                    result.put("text", visionText.text)
                    
                    // Add bounding box metadata for UI mode
                    val blocksArray = com.getcapacitor.JSArray()
                    for (block in visionText.textBlocks) {
                        val blockObj = JSObject()
                        blockObj.put("text", block.text)
                        
                        val box = block.boundingBox
                        if (box != null) {
                            val rectObj = JSObject()
                            rectObj.put("top", box.top)
                            rectObj.put("bottom", box.bottom)
                            rectObj.put("left", box.left)
                            rectObj.put("right", box.right)
                            blockObj.put("boundingBox", rectObj)
                        }
                        blocksArray.put(blockObj)
                    }
                    result.put("blocks", blocksArray)
                    result.put("mode", mode)
                    
                    call.resolve(result)
                }
                .addOnFailureListener { e ->
                    call.reject("Text extraction failed", e)
                }
        } catch (e: Exception) {
            call.reject("Error processing image", e)
        }
    }
}
