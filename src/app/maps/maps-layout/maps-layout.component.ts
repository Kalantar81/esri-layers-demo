import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
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
export class MapsLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('esriMap') esriMap!: EsriMapComponent;

  layerMode: 'layers' | 'lazy-loading' | 'clustering' = 'layers';
  useEsriLegend: boolean = false;

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

  private routerSub!: Subscription;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Detect current route and set layerMode accordingly
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateModeFromUrl(event.urlAfterRedirects || event.url);
      });

    // Set initial mode from current URL
    this.updateModeFromUrl(this.router.url);
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private updateModeFromUrl(url: string): void {
    if (url.includes('control-panel-lazy-loading')) {
      this.layerMode = 'lazy-loading';
    } else if (url.includes('control-panel-clustering')) {
      this.layerMode = 'clustering';
    } else {
      this.layerMode = 'layers';
    }
  }

  onLayersToggle(): void {
    this.layerMode = 'layers';
    this.router.navigate(['/']);
    this.resetControlPanel();
  }

  onLazyLoadingToggle(): void {
    this.layerMode = 'lazy-loading';
    this.router.navigate(['/control-panel-lazy-loading']);
    this.esriMap.removeAllLayers();
    this.resetControlPanel();
  }

  onClusteringToggle(): void {
    this.layerMode = 'clustering';
    this.router.navigate(['/control-panel-clustering']);
    this.esriMap.removeAllLayers();
    this.resetControlPanel();
  }

  onLegendToggle(): void {
    if (this.esriMap) {
      this.esriMap.setLegendType(this.useEsriLegend ? 'esri' : 'custom');
    }
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
