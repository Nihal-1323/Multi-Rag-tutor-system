import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ThermalStatusService, ThermalProfile } from './thermal-status.service';
import { OcrService } from './ocr.service';
import { LlmInferenceService } from './llm-inference.service';

export enum AppState {
  IDLE = 'IDLE',
  CAPTURING = 'CAPTURING',
  OCR = 'OCR',
  INFERRING = 'INFERRING',
  STREAMING = 'STREAMING',
  ERROR = 'ERROR'
}

@Injectable({
  providedIn: 'root'
})
export class StateMachineService {
  private stateSubject = new BehaviorSubject<AppState>(AppState.IDLE);
  state$ = this.stateSubject.asObservable();

  private markdownSubject = new BehaviorSubject<string>('');
  markdown$ = this.markdownSubject.asObservable();

  private errorSubject = new BehaviorSubject<string>('');
  error$ = this.errorSubject.asObservable();

  private streamSub: Subscription | null = null;

  constructor(
    private thermalService: ThermalStatusService,
    private ocrService: OcrService,
    private llmService: LlmInferenceService
  ) {}

  async processScreenshot(base64Image: string) {
    if (this.stateSubject.getValue() !== AppState.IDLE && this.stateSubject.getValue() !== AppState.ERROR) {
      console.warn('Pipeline is already running.');
      return;
    }

    try {
      this.markdownSubject.next('');
      this.errorSubject.next('');
      this.stateSubject.next(AppState.CAPTURING);

      // 1. Get Thermal Constraint
      const profile = this.thermalService.getCurrentProfile();
      
      this.stateSubject.next(AppState.OCR);
      // 2. Extract and Clean Text
      const cleanText = await this.ocrService.extractCleanText(base64Image, 'UI');

      if (!cleanText.trim()) {
        throw new Error("No readable text found in the image.");
      }

      // If thermal mode is text-only, we skip LLM synthesis
      if (profile.mode === 'text-only') {
        this.markdownSubject.next("*(Thermal throttling active. Displaying raw extracted text)*\n\n" + cleanText);
        this.stateSubject.next(AppState.IDLE);
        return;
      }

      // 3. Start LLM Inference
      this.stateSubject.next(AppState.INFERRING);
      
      const stream$ = await this.llmService.generateSummaryStream(cleanText, profile.maxTokens);
      this.stateSubject.next(AppState.STREAMING);

      let currentMarkdown = '';

      this.streamSub = stream$.pipe(
        catchError(err => {
          this.handleError(err);
          return of(null);
        }),
        finalize(() => {
          this.finishProcessing();
        })
      ).subscribe(token => {
        if (token) {
          currentMarkdown += token;
          this.markdownSubject.next(currentMarkdown);
        }
      });

    } catch (e: any) {
      this.handleError(e);
    }
  }

  private handleError(error: any) {
    console.error('Pipeline Error:', error);
    this.errorSubject.next(error.message || 'An unknown error occurred');
    this.stateSubject.next(AppState.ERROR);
    this.llmService.signalTaskComplete();
  }

  private finishProcessing() {
    this.stateSubject.next(AppState.IDLE);
    this.llmService.signalTaskComplete(); // Triggers the 60s TTL cache timer
    if (this.streamSub) {
      this.streamSub.unsubscribe();
      this.streamSub = null;
    }
  }

  getCurrentState(): AppState {
    return this.stateSubject.getValue();
  }
}
