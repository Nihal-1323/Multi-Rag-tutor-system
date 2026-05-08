import { Injectable } from '@angular/core';
import { registerPlugin } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';

export interface ThermalProfile {
  mode: 'full' | 'text-only';
  maxTokens: number;
  headroom: number;
  status: number;
}

// Capacitor Plugin definition
interface ThermalStatusPlugin {
  getThermalProfile(): Promise<ThermalProfile>;
  addListener(eventName: 'thermalStatusChanged', listenerFunc: (info: ThermalProfile) => void): Promise<any>;
}
const ThermalStatus = registerPlugin<ThermalStatusPlugin>('ThermalStatus');

@Injectable({
  providedIn: 'root'
})
export class ThermalStatusService {
  private profileSubject = new BehaviorSubject<ThermalProfile>({ mode: 'full', maxTokens: 1024, headroom: -1, status: -1 });
  profile$ = this.profileSubject.asObservable();

  constructor() {
    this.initThermalListener();
  }

  private async initThermalListener() {
    // Get initial state
    try {
      const initialProfile = await ThermalStatus.getThermalProfile();
      this.profileSubject.next(initialProfile);

      // Listen for thermal events
      await ThermalStatus.addListener('thermalStatusChanged', (profile: ThermalProfile) => {
        this.profileSubject.next(profile);
      });
    } catch (err) {
      console.warn('Thermal status plugin not available on this platform', err);
    }
  }

  getCurrentProfile(): ThermalProfile {
    return this.profileSubject.getValue();
  }
}
