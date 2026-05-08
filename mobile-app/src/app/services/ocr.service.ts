import { Injectable } from '@angular/core';
import { registerPlugin } from '@capacitor/core';

export interface OcrResult {
  text: string;
  blocks: any[];
  mode: string;
}

interface MLKitVisionPlugin {
  extractText(options: { image: string, mode: 'UI' | 'DOCUMENT' }): Promise<OcrResult>;
}
const MLKitVision = registerPlugin<MLKitVisionPlugin>('MLKitVision');

@Injectable({
  providedIn: 'root'
})
export class OcrService {

  async extractCleanText(base64Image: string, mode: 'UI' | 'DOCUMENT' = 'UI'): Promise<string> {
    try {
      const result = await MLKitVision.extractText({ image: base64Image, mode });
      
      // The crucial step: clean up the noise if UI mode
      if (mode === 'UI') {
        return this.preProcessUIText(result.text);
      }
      return result.text;
    } catch (e) {
      console.error('OCR Extraction failed', e);
      throw e;
    }
  }

  /**
   * Pre-processor to strip status bar garbage:
   * System clock strings, battery percentages, carrier names, notification counts.
   */
  private preProcessUIText(rawText: string): string {
    let cleanText = rawText;

    // 1. Remove time formats (e.g., 10:30 AM, 14:05, 12:00)
    cleanText = cleanText.replace(/\b([01]?[0-9]|2[0-3]):[0-5][0-9]\s*(AM|PM)?\b/gi, '');

    // 2. Remove battery percentages (e.g., 100%, 45 %)
    cleanText = cleanText.replace(/\b\d{1,3}\s*%/g, '');

    // 3. Remove common carrier names at top (AT&T, T-Mobile, Verizon) - simple heuristics
    const carriers = ['AT&T', 'T-Mobile', 'Verizon', 'Sprint', 'Vodafone', 'O2'];
    carriers.forEach(carrier => {
      const regex = new RegExp(`^\\s*${carrier}\\s*`, 'mi');
      cleanText = cleanText.replace(regex, '');
    });

    // 4. Remove common signal strength / Wi-Fi artifacts (4G, 5G, LTE)
    cleanText = cleanText.replace(/\b(4G|5G|LTE|Wi-Fi)\b/gi, '');

    // 5. Clean up excessive newlines and spaces left over
    cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();

    return cleanText;
  }
}
