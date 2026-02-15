import { Component, OnInit, ViewChild } from '@angular/core';
import { EsriMapComponent } from '../esri-map/esri-map.component';

interface HistoryEntry {
  timestamp: Date;
  basemap: string;
  symbolType: string;
  totalEntities: number;
  loadingTime: number;
  activeLayersCount: number;
}

@Component({
  selector: 'app-maps-layout',
  templateUrl: './maps-layout.component.html',
  styleUrls: ['./maps-layout.component.scss']
})
export class MapsLayoutComponent implements OnInit {
  @ViewChild('esriMap') esriMap!: EsriMapComponent;

  // Layer mode state
  layerMode: 'layers' | 'lazy-loading' | 'clustering' = 'layers';

  // Control panel state
  selectedBasemap: string = 'streets-vector';
  selectedLayerTypeForAll: 'geojson' | 'graphics' | 'feature' | 'csv' | 'feature-collection' | 'client-side' = 'geojson';
  selectedSymbolType: string = 'simple-marker';
  entitiesAmount: number = 50000;
  isLoading: boolean = false;
  totalLoadingTime: number = 0;
  lastLoadedTime: string = '';
  activeLayerCount: number = 0;
  history: HistoryEntry[] = [];

  basemapOptions = [
    { id: 'streets-vector', name: 'Streets' },
    { id: 'satellite', name: 'Satellite' },
    { id: 'hybrid', name: 'Hybrid (Satellite + Labels)' },
    { id: 'topo-vector', name: 'Topographic' },
    { id: 'gray-vector', name: 'Gray Canvas' },
    { id: 'dark-gray-vector', name: 'Dark Gray Canvas' },
    { id: 'oceans', name: 'Oceans' },
    { id: 'national-geographic', name: 'National Geographic' },
    { id: 'terrain', name: 'Terrain' },
    { id: 'osm', name: 'OpenStreetMap' },
    { id: 'streets-night-vector', name: 'Streets (Night)' },
    { id: 'streets-navigation-vector', name: 'Streets (Navigation)' },
    { id: 'streets-relief-vector', name: 'Streets (Relief)' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  onLayersToggle(): void {
    this.layerMode = 'layers';
    this.resetControlPanel();
  }

  onLazyLoadingToggle(): void {
    this.layerMode = 'lazy-loading';
    this.resetControlPanel();
  }

  onClusteringToggle(): void {
    this.layerMode = 'clustering';
    this.resetControlPanel();
  }

  getModeLabel(): string {
    const modeNames: { [key: string]: string } = {
      'layers': 'Standard Layers',
      'lazy-loading': 'Lazy Loading',
      'clustering': 'Clustering'
    };
    return modeNames[this.layerMode] || this.layerMode;
  }

  private resetControlPanel(): void {
    this.selectedBasemap = 'streets-vector';
    this.selectedLayerTypeForAll = 'geojson';
    this.selectedSymbolType = 'simple-marker';
    this.entitiesAmount = 50000;
    this.isLoading = false;
    this.totalLoadingTime = 0;
    this.lastLoadedTime = '';
    this.activeLayerCount = 0;
    this.history = [];
  }

  onSettingsChange(): void {
    console.log('Settings changed');
  }

  applySettings(): void {
    this.esriMap.applySettings();
  }

  toggleHistory(): void {
    console.log('Toggle history');
  }

  clearHistory(): void {
    this.history = [];
  }
}
