import { Injectable } from '@angular/core';
import { registerPlugin } from '@capacitor/core';
import { Subject, Observable } from 'rxjs';

interface MediaPipeInferencePlugin {
  loadModel(options: { modelPath: string }): Promise<void>;
  generateResponse(options: { prompt: string; maxTokens: number }): Promise<void>;
  unloadModel(): Promise<void>;
  addListener(eventName: 'onTokenGenerated', listenerFunc: (info: { token: string }) => void): Promise<any>;
}
const MediaPipeInference = registerPlugin<MediaPipeInferencePlugin>('MediaPipeInference');

@Injectable({
  providedIn: 'root'
})
export class LlmInferenceService {
  private isModelLoaded = false;
  private ttlTimer: any = null;
  private readonly TTL_MS = 60000; // 60 seconds

  private tokenSubject = new Subject<string>();

  constructor() {
    this.initTokenListener();
  }

  private async initTokenListener() {
    await MediaPipeInference.addListener('onTokenGenerated', (info: { token: string }) => {
      this.tokenSubject.next(info.token);
    });
  }

  async generateSummaryStream(cleanText: string, maxTokens: number): Promise<Observable<string>> {
    await this.ensureModelLoaded();

    const systemPrompt = "NO PREAMBLE. Output only the requested data. Limit output strictly to Markdown bullet points.\n\nText to summarize:\n";
    const fullPrompt = systemPrompt + cleanText;

    // We return the observable immediately so the UI can subscribe
    // Then we kick off the generation process
    MediaPipeInference.generateResponse({ prompt: fullPrompt, maxTokens }).catch(err => {
      this.tokenSubject.error(err);
    });

    return this.tokenSubject.asObservable();
  }

  private async ensureModelLoaded() {
    this.resetTtlTimer();

    if (!this.isModelLoaded) {
      console.log('LLM: Cold start, loading model into memory...');
      // In a real app, this path would point to the downloaded .bin file in the app's files directory
      await MediaPipeInference.loadModel({ modelPath: 'gemma_4_e2b.bin' });
      this.isModelLoaded = true;
      console.log('LLM: Model loaded successfully.');
    } else {
      console.log('LLM: Warm start, model already in memory.');
    }
  }

  private resetTtlTimer() {
    if (this.ttlTimer) {
      clearTimeout(this.ttlTimer);
    }
    this.ttlTimer = setTimeout(() => {
      this.flushModel();
    }, this.TTL_MS);
  }

  private async flushModel() {
    if (this.isModelLoaded) {
      console.log(`LLM: ${this.TTL_MS / 1000}s TTL expired. Flushing model from RAM to save memory.`);
      try {
        await MediaPipeInference.unloadModel();
        this.isModelLoaded = false;
      } catch (e) {
        console.error('Failed to flush model', e);
      }
    }
  }

  // To be called by State Machine when streaming is complete or cancelled
  signalTaskComplete() {
    this.resetTtlTimer(); // Starts the 60s countdown
    this.tokenSubject = new Subject<string>(); // Reset subject for next run
  }
}
