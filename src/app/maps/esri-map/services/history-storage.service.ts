import { Injectable } from '@angular/core';
import { HistoryEntry } from '../components/history-section/history-section.component';

@Injectable({
  providedIn: 'root'
})
export class HistoryStorageService {
  private readonly STORAGE_PREFIX = 'esri-panel-history-';

  saveHistory(panelName: string, history: HistoryEntry[]): void {
    localStorage.setItem(this.STORAGE_PREFIX + panelName, JSON.stringify(history));
  }

  loadHistory(panelName: string): HistoryEntry[] {
    const data = localStorage.getItem(this.STORAGE_PREFIX + panelName);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return parsed.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));
  }

  clearHistory(panelName: string): void {
    localStorage.removeItem(this.STORAGE_PREFIX + panelName);
  }
}
