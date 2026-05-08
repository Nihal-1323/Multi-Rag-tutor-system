import { Component, OnInit } from '@angular/core';
import { StateMachineService, AppState } from '../../services/state-machine.service';
import { ThermalStatusService, ThermalProfile } from '../../services/thermal-status.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// Note: In a real app we'd use a markdown parser library like 'marked'
// For this example we'll simulate the rendering safely

@Component({
  selector: 'app-screenshot-summary',
  templateUrl: './screenshot-summary.component.html',
  styleUrls: ['./screenshot-summary.component.css']
})
export class ScreenshotSummaryComponent implements OnInit {

  appState$: Observable<AppState>;
  thermalProfile$: Observable<ThermalProfile>;
  markdown$: Observable<string>;
  formattedMarkdown$: Observable<string>;
  error$: Observable<string>;

  constructor(
    private stateMachine: StateMachineService,
    private thermalService: ThermalStatusService
  ) {
    this.appState$ = this.stateMachine.state$;
    this.thermalProfile$ = this.thermalService.profile$;
    this.error$ = this.stateMachine.error$;
    this.markdown$ = this.stateMachine.markdown$;
    
    // Simple mock markdown formatting for bullet points
    this.formattedMarkdown$ = this.markdown$.pipe(
      map(md => {
        if (!md) return '';
        // Basic replacement of markdown bullets with HTML
        const html = md.replace(/\n\*\s/g, '<br/>• ')
                       .replace(/^\*\s/g, '• ')
                       .replace(/\n-\s/g, '<br/>• ')
                       .replace(/^-\s/g, '• ')
                       .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return html;
      })
    );
  }

  ngOnInit(): void {}

  async captureAndSummarize() {
    // In the real application, we would use @capacitor/camera to get a screenshot
    // For this implementation, we simulate capturing a base64 image of the screen
    console.log('Capturing screen...');
    
    // MOCK BASE64 IMAGE
    const mockScreenshotBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    await this.stateMachine.processScreenshot(mockScreenshotBase64);
  }
}
