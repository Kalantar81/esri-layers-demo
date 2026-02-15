import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { LayersService } from '../services/layers.service';
import esriConfig from '@arcgis/core/config';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import CSVLayer from '@arcgis/core/layers/CSVLayer';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';

interface LayerType {
  id: string;
  name: string;
  description: string;
  type: 'feature' | 'graphics' | 'geojson' | 'csv' | 'feature-collection' | 'client-side';
  layerTypeName: string;
}

interface HistoryEntry {
  timestamp: Date;
  basemap: string;
  symbolType: string;
  totalEntities: number;
  loadingTime: number;
  activeLayersCount: number;
}

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.scss']
})
export class EsriMapComponent implements OnInit, OnDestroy {
  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
  
  private view: any = null;
  private map: any = null;
  private currentLayer: any = null;
  private fullDataset: any = null;
  private activeLayers: Map<string, any> = new Map(); // Store multiple active layers
  activeLayerIds: Set<string> = new Set(); // Track active layer IDs for Angular binding

  selectedLayerType: string = 'geojson';
  selectedLayerTypeForAll: 'geojson' | 'graphics' | 'feature' | 'csv' | 'feature-collection' | 'client-side' = 'geojson';
  selectedSymbolType: string = 'simple-marker';
  selectedBasemap: string = 'streets-vector';
  entitiesAmount: number = 50000;
  layersToLoad: number = 22;

  isLoading: boolean = false;
  isLayerPanelOpen: boolean = false;
  loadingTime: number = 0;
  totalLoadingTime: number = 0;
  entityCount: number = 0;
  totalAvailableEntities: number = 0;
  lastLoadedTime: string = '';

  // History tracking
  history: HistoryEntry[] = [];
  isHistoryExpanded: boolean = false;

  // Map layersToLoad to entity count
  private readonly LAYERS_TO_ENTITIES_MAP: { [key: number]: number } = {
    5: 5000,
    10: 10000,
    15: 12500,
    20: 15000,
    22: 15000
  };

  // Israel boundaries
  private readonly ISRAEL_BOUNDS = {
    minLat: 29.5,
    maxLat: 33.3,
    minLon: 34.2,
    maxLon: 35.9
  };

  // Available basemaps
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

  // Color palette for different layers (22 distinct colors)
  private readonly LAYER_COLORS: { [key: string]: number[] } = {
    'geojson': [255, 69, 0, 0.8],        // Red-Orange
    'graphics': [0, 191, 255, 0.8],      // Deep Sky Blue
    'feature': [50, 205, 50, 0.8],       // Lime Green
    'csv': [255, 215, 0, 0.8],           // Gold
    'collection-2': [138, 43, 226, 0.8], // Blue Violet
    'client-side': [220, 20, 60, 0.8],   // Crimson
    'geojson-2': [255, 140, 0, 0.8],     // Dark Orange
    'graphics-2': [30, 144, 255, 0.8],   // Dodger Blue
    'feature-2': [34, 139, 34, 0.8],     // Forest Green
    'csv-2': [218, 165, 32, 0.8],        // Goldenrod
    'feature-collection': [147, 112, 219, 0.8], // Medium Purple
    'client-side-2': [199, 21, 133, 0.8],// Medium Violet Red
    'geojson-3': [255, 99, 71, 0.8],     // Tomato
    'graphics-3': [70, 130, 180, 0.8],   // Steel Blue
    'feature-3': [60, 179, 113, 0.8],    // Medium Sea Green
    'csv-3': [184, 134, 11, 0.8],        // Dark Goldenrod
    'collection-3': [123, 104, 238, 0.8],// Medium Slate Blue
    'client-side-3': [186, 85, 211, 0.8],// Medium Orchid
    'geojson-4': [255, 127, 80, 0.8],    // Coral
    'graphics-4': [95, 158, 160, 0.8],   // Cadet Blue
    'feature-4': [46, 139, 87, 0.8],     // Sea Green
    'csv-4': [205, 133, 63, 0.8]         // Peru
  };

  // SVG/PNG image icons for each layer (local assets)
  private readonly LAYER_PNG_ICONS: { [key: string]: string } = {
    'geojson': 'assets/icons/layer1.svg',
    'graphics': 'assets/icons/layer2.svg',
    'feature': 'assets/icons/layer3.svg',
    'csv': 'assets/icons/layer4.svg',
    'feature-collection': 'assets/icons/layer5.svg',
    'client-side': 'assets/icons/layer6.svg',
    'geojson-2': 'assets/icons/layer7.svg',
    'graphics-2': 'assets/icons/layer8.svg',
    'feature-2': 'assets/icons/layer9.svg',
    'csv-2': 'assets/icons/layer10.svg',
    'collection-2': 'assets/icons/layer11.svg',
    'client-side-2': 'assets/icons/layer12.svg',
    'geojson-3': 'assets/icons/layer13.svg',
    'graphics-3': 'assets/icons/layer14.svg',
    'feature-3': 'assets/icons/layer15.svg',
    'csv-3': 'assets/icons/layer16.svg',
    'collection-3': 'assets/icons/layer17.svg',
    'client-side-3': 'assets/icons/layer18.svg',
    'geojson-4': 'assets/icons/layer19.svg',
    'graphics-4': 'assets/icons/layer20.svg',
    'feature-4': 'assets/icons/layer21.svg',
    'csv-4': 'assets/icons/layer22.svg'
  };

  layerTypes: LayerType[] = [
    {
      id: 'geojson',
      name: 'Earthquakes',
      description: 'USGS Earthquake Data',
      type: 'geojson',
      layerTypeName: 'GeoJSON Layer'
    },
    {
      id: 'graphics',
      name: 'ISS Location',
      description: 'International Space Station Real-time Position',
      type: 'graphics',
      layerTypeName: 'Graphics Layer'
    },
    {
      id: 'feature',
      name: 'World Countries',
      description: 'World Countries from REST Countries API',
      type: 'feature',
      layerTypeName: 'Feature Layer'
    },
    {
      id: 'csv',
      name: 'World Airports',
      description: 'Airports Data from OurAirports',
      type: 'csv',
      layerTypeName: 'CSV Layer'
    },
    {
      id: 'feature-collection',
      name: 'World Cities',
      description: 'World Cities Database',
      type: 'feature-collection',
      layerTypeName: 'Feature Layer'
    },
    {
      id: 'client-side',
      name: 'Heritage Sites',
      description: 'UNESCO World Heritage Sites',
      type: 'client-side',
      layerTypeName: 'Feature Layer'
    },
    {
      id: 'geojson-2',
      name: 'Volcanoes',
      description: 'Volcano Database',
      type: 'geojson',
      layerTypeName: 'GeoJSON Layer'
    },
    {
      id: 'graphics-2',
      name: 'ISS Path',
      description: 'ISS Orbital Path Visualization',
      type: 'graphics',
      layerTypeName: 'Graphics Layer'
    },
    {
      id: 'feature-2',
      name: 'Countries',
      description: 'Country Population Distribution',
      type: 'feature',
      layerTypeName: 'Feature Layer'
    },
    {
      id: 'csv-2',
      name: 'Major Airports',
      description: 'Major International Airports',
      type: 'csv',
      layerTypeName: 'CSV Layer'
    },
    {
      id: 'collection-2',
      name: 'Major Cities',
      description: 'Top 1000 World Cities by Population',
      type: 'feature-collection',
      layerTypeName: 'Feature Layer'
    },
    {
      id: 'client-side-2',
      name: 'Volcanoes 2',
      description: 'Active Volcanoes',
      type: 'client-side',
      layerTypeName: 'Feature Layer'
    },
    {
      id: 'geojson-3',
      name: 'Earthquakes Extended',
      description: 'Extended Earthquake Analysis',
      type: 'geojson',
      layerTypeName: 'GeoJSON Layer'
    },
    {
      id: 'graphics-3',
      name: 'Airports Visualization',
      description: 'Airport Distribution Heat Map',
      type: 'graphics',
      layerTypeName: 'Graphics Layer'
    },
    {
      id: 'feature-3',
      name: 'Global Population',
      description: 'Global Population Density Map',
      type: 'feature',
      layerTypeName: 'Feature Layer'
    },
    {
      id: 'csv-3',
      name: 'Cities Data',
      description: 'World Cities Detailed Information',
      type: 'csv',
      layerTypeName: 'CSV Layer'
    },
    {
      id: 'collection-3',
      name: 'Heritage Sites 2',
      description: 'UNESCO World Heritage Sites Network',
      type: 'feature-collection',
      layerTypeName: 'Feature Layer'
    },
    {
      id: 'client-side-3',
      name: 'Heritage Network',
      description: 'Heritage Sites Connection Map',
      type: 'client-side',
      layerTypeName: 'Feature Layer'
    },
    {
      id: 'geojson-4',
      name: 'Volcanoes Extended',
      description: 'Extended Volcano Analysis',
      type: 'geojson',
      layerTypeName: 'GeoJSON Layer'
    },
    {
      id: 'graphics-4',
      name: 'Countries Heat Map',
      description: 'Country Population Heat Map',
      type: 'graphics',
      layerTypeName: 'Graphics Layer'
    },
    {
      id: 'feature-4',
      name: 'Global Airports',
      description: 'Airport Network Analysis',
      type: 'feature',
      layerTypeName: 'Feature Layer'
    },
    {
      id: 'csv-4',
      name: 'World Data',
      description: 'Comprehensive World Data Integration',
      type: 'csv',
      layerTypeName: 'CSV Layer'
    }
  ];

  constructor(private layersService: LayersService) {}

  ngOnInit(): void {
    this.initializeMap();
  }

  get visibleLayerTypes(): LayerType[] {
    return this.layerTypes; // Always show all 22 layers
  }

  private async initializeMap(): Promise<void> {
    try {
      esriConfig.assetsPath = './assets/esri';

      this.map = new EsriMap({
        basemap: this.selectedBasemap
      });

      this.view = new MapView({
        container: this.mapViewEl.nativeElement,
        map: this.map,
        center: [35.0, 31.5], // Center of Israel
        zoom: 7
      });

      // Wait for view to be ready before loading layers
      await this.view.when();

      // Load all visible layers by default
      await this.loadAllVisibleLayers();

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private async loadAllVisibleLayers(): Promise<void> {
    const startTime = performance.now();
    this.isLoading = true;
    this.totalLoadingTime = 0;

    try {
      console.log(`Starting to load ${this.visibleLayerTypes.length} layers...`);

      // Load all visible layers in parallel
      const layerPromises = this.visibleLayerTypes.map(layer =>
        this.addLayer(layer.id).catch(err => {
          console.error(`Failed to load layer ${layer.id}:`, err);
          return null; // Continue loading other layers even if one fails
        })
      );
      await Promise.all(layerPromises);

      const endTime = performance.now();
      this.totalLoadingTime = Math.round(endTime - startTime);
      this.lastLoadedTime = new Date().toLocaleTimeString();

      console.log(`Loaded ${this.activeLayerIds.size} of ${this.visibleLayerTypes.length} layers in ${this.totalLoadingTime}ms`);

      // Add to history
      this.addToHistory();
    } catch (error) {
      console.error('Error loading layers:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private addToHistory(): void {
    const entry: HistoryEntry = {
      timestamp: new Date(),
      basemap: this.getBasemapName(this.selectedBasemap),
      symbolType: this.getSymbolTypeName(),
      totalEntities: this.entitiesAmount,
      loadingTime: this.totalLoadingTime,
      activeLayersCount: this.activeLayerIds.size
    };

    // Add to beginning of array (newest first)
    this.history.unshift(entry);

    // Keep only last 20 entries
    if (this.history.length > 20) {
      this.history = this.history.slice(0, 20);
    }
  }

  private getBasemapName(id: string): string {
    const basemap = this.basemapOptions.find(b => b.id === id);
    return basemap ? basemap.name : id;
  }

  toggleHistory(): void {
    this.isHistoryExpanded = !this.isHistoryExpanded;
  }

  clearHistory(): void {
    this.history = [];
  }

  onPanelBasemapChange(value: string): void {
    this.selectedBasemap = value;
  }

  onPanelLayerTypeChange(value: string): void {
    this.selectedLayerTypeForAll = value as 'geojson' | 'graphics' | 'feature' | 'csv' | 'feature-collection' | 'client-side';
  }

  onPanelSymbolTypeChange(value: string): void {
    this.selectedSymbolType = value;
  }

  onPanelEntitiesAmountChange(value: number): void {
    this.entitiesAmount = value;
  }

  onSettingsChange(): void {
    // Settings changed, but not applied yet
    console.log('Settings changed - Basemap:', this.selectedBasemap, 'Layer:', this.selectedLayerType, 'Symbol:', this.selectedSymbolType, 'Amount:', this.entitiesAmount);
  }

  async applySettings(): Promise<void> {
    // Apply basemap change
    if (this.map) {
      this.map.basemap = this.selectedBasemap;
    }

    // Reload all active layers to apply symbol type changes
    if (this.activeLayers.size > 0) {
      const startTime = performance.now();
      this.isLoading = true;
      this.totalLoadingTime = 0;

      try {
        // Get all currently active layer IDs
        const activeLayerIds: string[] = Array.from(this.activeLayers.keys()) as string[];

        // Remove all current layers
        activeLayerIds.forEach(layerId => {
          const layer = this.activeLayers.get(layerId);
          if (layer) {
            this.map.remove(layer);
          }
        });
        this.activeLayers.clear();
        this.activeLayerIds.clear();

        // Reload all layers with new settings
        const layerPromises = activeLayerIds.map(layerId => this.addLayer(layerId));
        await Promise.all(layerPromises);

        const endTime = performance.now();
        this.totalLoadingTime = Math.round(endTime - startTime);
        this.lastLoadedTime = new Date().toLocaleTimeString();

        console.log(`Reloaded ${activeLayerIds.length} layers with new settings in ${this.totalLoadingTime}ms`);

        // Add to history
        this.addToHistory();
      } catch (error) {
        console.error('Error reloading layers:', error);
      } finally {
        this.isLoading = false;
      }
    }

    // Reset dataset when applying new settings to ensure consistent entity count across layers
    this.fullDataset = null;
  }

  getTotalEntities(): number {
    return this.entitiesAmount * 22;
  }

  getActiveEntitiesCount(): number {
    return this.entitiesAmount * this.activeLayerIds.size;
  }

  toggleLayerPanel(): void {
    this.isLayerPanelOpen = !this.isLayerPanelOpen;
  }

  isLayerActive(layerId: string): boolean {
    return this.activeLayerIds.has(layerId);
  }

  async toggleLayer(layerId: string): Promise<void> {
    if (this.isLoading) return;

    if (this.activeLayers.has(layerId)) {
      // Remove layer from map
      const layer = this.activeLayers.get(layerId);
      if (layer) {
        this.map.remove(layer);
        this.activeLayers.delete(layerId);
        this.activeLayerIds.delete(layerId);
      }
    } else {
      // Add layer to map
      this.isLoading = true;
      await this.addLayer(layerId);
      this.isLoading = false;
      this.lastLoadedTime = new Date().toLocaleTimeString();
    }
  }

  getLayerColorStyle(layerId: string): string {
    const color = this.getColorForLayer(layerId);
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
  }

  private async addLayer(layerId: string): Promise<void> {
    const startTime = performance.now();

    try {
      const layerConfig = this.layerTypes.find(l => l.id === layerId);
      if (!layerConfig) {
        console.error('Layer configuration not found');
        return;
      }

      // Get data from different APIs based on the layer ID - each layer gets unique data source
      let layerData: any;

      // Map each layer to a specific data source (using only reliable sources)
      // We have 5 working sources: Earthquakes, Volcanoes, Countries, ISS, Heritage Sites
      // Distribute them across all 22 layers
      switch (layerId) {
        case 'geojson':
          layerData = await this.layersService.getEarthquakes().toPromise();
          break;
        case 'graphics':
          layerData = await this.layersService.getVolcanoes().toPromise();
          break;
        case 'feature':
          layerData = await this.layersService.getWorldCountries().toPromise();
          break;
        case 'csv':
          layerData = await this.layersService.getISSLocation().toPromise();
          break;
        case 'feature-collection':
          layerData = await this.layersService.getHeritageSites().toPromise();
          break;
        case 'client-side':
          layerData = await this.layersService.getEarthquakes().toPromise();
          break;
        case 'geojson-2':
          layerData = await this.layersService.getVolcanoes().toPromise();
          break;
        case 'graphics-2':
          layerData = await this.layersService.getWorldCountries().toPromise();
          break;
        case 'feature-2':
          layerData = await this.layersService.getISSLocation().toPromise();
          break;
        case 'csv-2':
          layerData = await this.layersService.getHeritageSites().toPromise();
          break;
        case 'collection-2':
          layerData = await this.layersService.getEarthquakes().toPromise();
          break;
        case 'client-side-2':
          layerData = await this.layersService.getVolcanoes().toPromise();
          break;
        case 'geojson-3':
          layerData = await this.layersService.getWorldCountries().toPromise();
          break;
        case 'graphics-3':
          layerData = await this.layersService.getISSLocation().toPromise();
          break;
        case 'feature-3':
          layerData = await this.layersService.getHeritageSites().toPromise();
          break;
        case 'csv-3':
          layerData = await this.layersService.getEarthquakes().toPromise();
          break;
        case 'collection-3':
          layerData = await this.layersService.getVolcanoes().toPromise();
          break;
        case 'client-side-3':
          layerData = await this.layersService.getWorldCountries().toPromise();
          break;
        case 'geojson-4':
          layerData = await this.layersService.getISSLocation().toPromise();
          break;
        case 'graphics-4':
          layerData = await this.layersService.getHeritageSites().toPromise();
          break;
        case 'feature-4':
          layerData = await this.layersService.getEarthquakes().toPromise();
          break;
        case 'csv-4':
          layerData = await this.layersService.getVolcanoes().toPromise();
          break;
        default:
          // Fallback to earthquakes
          layerData = await this.layersService.getEarthquakes().toPromise();
          break;
      }

      if (!layerData) {
        console.error('No data received from service');
        return;
      }

      // Filter data based on entities amount
      const filteredData = this.filterDataByAmount(layerData.data, this.entitiesAmount);

      // Transform coordinates to Israel for all features
      const transformedData = this.transformDataToIsrael(filteredData);

      // Create layer based on the selected layer type (use selectedLayerTypeForAll instead of layerConfig.type)
      let newLayer: any;
      newLayer = await this.createLayerInstance(this.selectedLayerTypeForAll, transformedData, layerId);

      if (newLayer) {
        this.map.add(newLayer);
        this.activeLayers.set(layerId, newLayer);
        this.activeLayerIds.add(layerId);
      }

      const endTime = performance.now();
      this.loadingTime = Math.round(endTime - startTime);

      console.log(`Added layer ${layerId} with ${this.entitiesAmount} entities in ${this.loadingTime}ms`);

    } catch (error) {
      console.error('Error adding layer:', error);
    }
  }

  getLayerTypeName(): string {
    const layerNames: { [key: string]: string } = {
      'geojson': 'GeoJSON Layer',
      'graphics': 'Graphics Layer',
      'feature': 'Feature Layer',
      'csv': 'CSV Layer',
      'feature-collection': 'Feature Layer (Collection)',
      'client-side': 'Feature Layer (Client-Side)'
    };
    return layerNames[this.selectedLayerTypeForAll] || this.selectedLayerTypeForAll;
  }

  getSymbolTypeName(): string {
    const symbolNames: { [key: string]: string } = {
      'simple-marker': 'Simple Point',
      'circle': 'Circle',
      'square': 'Square',
      'diamond': 'Diamond',
      'cross': 'Cross',
      'x': 'X Symbol',
      'triangle': 'Triangle',
      'picture-marker': 'SVG Icon',
      'complex-svg': 'Complex SVG',
      'png-image': 'Custom Icon'
    };
    return symbolNames[this.selectedSymbolType] || this.selectedSymbolType;
  }

  // Transform global coordinates to Israel boundaries
  private transformToIsrael(lon: number, lat: number): { lon: number, lat: number } {
    // Normalize the coordinates to 0-1 range based on global bounds
    const normalizedLon = (lon + 180) / 360; // Longitude range: -180 to 180
    const normalizedLat = (lat + 90) / 180;  // Latitude range: -90 to 90

    // Map to Israel's boundaries
    const israelLon = this.ISRAEL_BOUNDS.minLon + 
                      (normalizedLon * (this.ISRAEL_BOUNDS.maxLon - this.ISRAEL_BOUNDS.minLon));
    const israelLat = this.ISRAEL_BOUNDS.minLat + 
                      (normalizedLat * (this.ISRAEL_BOUNDS.maxLat - this.ISRAEL_BOUNDS.minLat));

    return { lon: israelLon, lat: israelLat };
  }

  private async loadLayer(layerId: string): Promise<void> {
    const startTime = performance.now();
    this.isLoading = true;

    try {
      if (this.currentLayer) {
        this.map.remove(this.currentLayer);
        this.currentLayer = null;
      }

      const layerConfig = this.layerTypes.find(l => l.id === layerId);
      if (!layerConfig) {
        console.error('Layer configuration not found');
        return;
      }

      // Get data from different APIs based on the layer ID
      let layerData: any;
      
      if (layerId.includes('earthquake') || layerId === 'geojson') {
        layerData = await this.layersService.getEarthquakes().toPromise();
      } else if (layerId.includes('volcano')) {
        layerData = await this.layersService.getVolcanoes().toPromise();
      } else if (layerId.includes('city') || layerId === 'collection-2') {
        layerData = await this.layersService.getWorldCities().toPromise();
      } else if (layerId.includes('airport')) {
        layerData = await this.layersService.getAirports().toPromise();
      } else if (layerId.includes('heritage') || layerId === 'client-side-3') {
        layerData = await this.layersService.getHeritageSites().toPromise();
      } else if (layerId.includes('iss') || layerId === 'graphics-2') {
        layerData = await this.layersService.getISSLocation().toPromise();
      } else if (layerId.includes('country') || layerId === 'feature-2') {
        layerData = await this.layersService.getWorldCountries().toPromise();
      } else {
        // Default to earthquakes for unknown layers
        layerData = await this.layersService.getEarthquakes().toPromise();
      }
      
      if (!layerData) {
        console.error('No data received from service');
        return;
      }

      this.fullDataset = layerData.data;
      this.totalAvailableEntities = layerData.count;

      // Filter data based on entities amount
      const filteredData = this.filterDataByAmount(this.fullDataset, this.entitiesAmount);
      this.entityCount = filteredData.features?.length || 0;

      // Transform coordinates to Israel for all features
      const transformedData = this.transformDataToIsrael(filteredData);

      // Create different layer types based on selection
      switch (layerConfig.type) {
        case 'geojson':
          await this.createGeoJSONLayer(transformedData);
          break;
        case 'graphics':
          await this.createGraphicsLayer(transformedData);
          break;
        case 'feature':
          await this.createFeatureLayer(transformedData);
          break;
        case 'csv':
          await this.createCSVLayer(transformedData);
          break;
        case 'feature-collection':
          await this.createFeatureCollectionLayer(transformedData);
          break;
        case 'client-side':
          await this.createClientSideFeatureLayer(transformedData);
          break;
      }

      const endTime = performance.now();
      this.loadingTime = Math.round(endTime - startTime);
      this.lastLoadedTime = new Date().toLocaleTimeString();

      console.log(`Loaded ${this.entityCount} entities in Israel as ${layerConfig.layerTypeName} with ${this.getSymbolTypeName()} symbols in ${this.loadingTime}ms`);

    } catch (error) {
      console.error('Error loading layer:', error);
      this.entityCount = 0;
      this.loadingTime = 0;
    } finally {
      this.isLoading = false;
    }
  }

  private filterDataByAmount(data: any, amount: number): any {
    if (!data || !data.features) {
      return data;
    }

    return {
      ...data,
      features: data.features.slice(0, amount)
    };
  }

  private transformDataToIsrael(data: any): any {
    const transformedData = { ...data };
    
    if (transformedData.features) {
      transformedData.features = transformedData.features.map((feature: any) => {
        const [originalLon, originalLat] = feature.geometry.coordinates;
        const transformed = this.transformToIsrael(originalLon, originalLat);
        
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: [transformed.lon, transformed.lat]
          }
        };
      });
    }

    return transformedData;
  }

  private getColorForLayer(layerId: string): number[] {
    return this.LAYER_COLORS[layerId] || [255, 69, 0, 0.8]; // Default to red-orange
  }

  private generateComplexSVG(layerId: string): string {
    const color = this.getColorForLayer(layerId);
    const svgTypes = [
      // Star
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <polygon points="12,2 15,10 23,10 17,16 20,24 12,18 4,24 7,16 1,10 9,10" fill="rgb(${color[0]},${color[1]},${color[2]})" stroke="white" stroke-width="1"/>
      </svg>`,
      // Heart
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="rgb(${color[0]},${color[1]},${color[2]})" stroke="white" stroke-width="1"/>
      </svg>`,
      // Hexagon
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="rgb(${color[0]},${color[1]},${color[2]})" stroke="white" stroke-width="1"/>
      </svg>`,
      // Pentagon
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <polygon points="12,2 22,9 18,21 6,21 2,9" fill="rgb(${color[0]},${color[1]},${color[2]})" stroke="white" stroke-width="1"/>
      </svg>`,
      // Shield
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="rgb(${color[0]},${color[1]},${color[2]})" stroke="white" stroke-width="1"/>
      </svg>`,
      // Diamond
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <polygon points="12,2 22,12 12,22 2,12" fill="rgb(${color[0]},${color[1]},${color[2]})" stroke="white" stroke-width="1"/>
      </svg>`,
      // Triangle
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <polygon points="12,2 22,20 2,20" fill="rgb(${color[0]},${color[1]},${color[2]})" stroke="white" stroke-width="1"/>
      </svg>`,
      // Circle with ring
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" fill="rgb(${color[0]},${color[1]},${color[2]})" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="5" fill="none" stroke="white" stroke-width="1"/>
      </svg>`
    ];

    // Use layerId to determine which SVG to use (consistent per layer)
    const layerIndex = this.layerTypes.findIndex(l => l.id === layerId);
    const svgIndex = (layerIndex >= 0 ? layerIndex : 0) % svgTypes.length;
    
    return 'data:image/svg+xml;base64,' + btoa(svgTypes[svgIndex]);
  }

  private getSymbolForType(layerId: string): any {
    const color = this.getColorForLayer(layerId);

    const symbols: { [key: string]: any } = {
      'simple-marker': {
        type: 'simple-marker',
        style: 'circle',
        color: color,
        size: '8px',
        outline: { color: [255, 255, 255], width: 1 }
      },
      'circle': {
        type: 'simple-marker',
        style: 'circle',
        color: color,
        size: '10px',
        outline: { color: [255, 255, 255], width: 2 }
      },
      'square': {
        type: 'simple-marker',
        style: 'square',
        color: color,
        size: '10px',
        outline: { color: [255, 255, 255], width: 1 }
      },
      'diamond': {
        type: 'simple-marker',
        style: 'diamond',
        color: color,
        size: '12px',
        outline: { color: [255, 255, 255], width: 1 }
      },
      'cross': {
        type: 'simple-marker',
        style: 'cross',
        color: color,
        size: '12px',
        outline: { color: [255, 255, 255], width: 2 }
      },
      'x': {
        type: 'simple-marker',
        style: 'x',
        color: color,
        size: '12px',
        outline: { color: [255, 255, 255], width: 2 }
      },
      'triangle': {
        type: 'simple-marker',
        style: 'triangle',
        color: color,
        size: '12px',
        outline: { color: [255, 255, 255], width: 1 }
      },
      'picture-marker': {
        type: 'picture-marker',
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="rgb(${color[0]},${color[1]},${color[2]})" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
          </svg>
        `),
        width: '20px',
        height: '20px'
      },
      'complex-svg': {
        type: 'picture-marker',
        url: this.generateComplexSVG(layerId),
        width: '20px',
        height: '20px'
      },
      'png-image': {
        type: 'picture-marker',
        url: this.LAYER_PNG_ICONS[layerId] || 'assets/icons/layer1.svg',
        width: '24px',
        height: '24px'
      }
    };

    return symbols[this.selectedSymbolType] || symbols['simple-marker'];
  }

  private async createLayerInstance(type: string, data: any, layerId: string): Promise<any> {
    switch (type) {
      case 'geojson':
        return await this.buildGeoJSONLayer(data, layerId);
      case 'graphics':
        return await this.buildGraphicsLayer(data, layerId);
      case 'feature':
        return await this.buildFeatureLayer(data, layerId);
      case 'csv':
        return await this.buildCSVLayer(data, layerId);
      case 'feature-collection':
        return await this.buildFeatureCollectionLayer(data, layerId);
      case 'client-side':
        return await this.buildClientSideFeatureLayer(data, layerId);
      default:
        return null;
    }
  }

  private async createGeoJSONLayer(data: any): Promise<void> {
    this.currentLayer = await this.buildGeoJSONLayer(data, this.selectedLayerType);
    this.map.add(this.currentLayer);
    await this.zoomToIsrael();
  }

  private async buildGeoJSONLayer(data: any, layerId: string): Promise<any> {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    return new GeoJSONLayer({
      url: url,
      renderer: new SimpleRenderer({
        symbol: this.getSymbolForType(layerId)
      }),
      popupTemplate: {
        title: 'Earthquake (GeoJSON Layer)',
        content: '<b>ID:</b> {id}<br><b>Latitude:</b> {latitude}<br><b>Longitude:</b> {longitude}<br><b>Magnitude:</b> {mag}<br><b>Mag Type:</b> {magnitude_type}<br><b>Location:</b> {place}<br><b>Time:</b> {time}<br><b>Depth:</b> {depth}<br><b>Status:</b> {status}<br><b>Felt Reports:</b> {felt_reports}<br><b>Significant:</b> {significant}<br><b>Tsunami Risk:</b> {tsunami}<br><b>Reported By:</b> {reported_by}'
      }
    });
  }

  private async createGraphicsLayer(data: any): Promise<void> {
    this.currentLayer = await this.buildGraphicsLayer(data, this.selectedLayerType);
    this.map.add(this.currentLayer);
    await this.zoomToIsrael();
  }

  private async buildGraphicsLayer(data: any, layerId: string): Promise<any> {
    const layer = new GraphicsLayer();

    const features = data.features || [];
    const symbol = this.getSymbolForType(layerId);

    features.forEach((feature: any) => {
      const [lon, lat] = feature.geometry.coordinates;

      const point = new Point({
        longitude: lon,
        latitude: lat
      });

      const graphic = new Graphic({
        geometry: point,
        symbol: symbol,
        attributes: feature.properties,
        popupTemplate: {
          title: 'Earthquake (Graphics Layer)',
          content: '<b>ID:</b> {id}<br><b>Latitude:</b> {latitude}<br><b>Longitude:</b> {longitude}<br><b>Magnitude:</b> {mag}<br><b>Mag Type:</b> {magnitude_type}<br><b>Location:</b> {place}<br><b>Time:</b> {time}<br><b>Depth:</b> {depth}<br><b>Status:</b> {status}<br><b>Felt Reports:</b> {felt_reports}<br><b>Significant:</b> {significant}<br><b>Tsunami Risk:</b> {tsunami}<br><b>Reported By:</b> {reported_by}'
        }
      });

      layer.add(graphic);
    });

    return layer;
  }

  private async createFeatureLayer(data: any): Promise<void> {
    this.currentLayer = await this.buildFeatureLayer(data, this.selectedLayerType);
    this.map.add(this.currentLayer);
    await this.zoomToIsrael();
  }

  private async buildFeatureLayer(data: any, layerId: string): Promise<any> {
    const features = data.features || [];
    const graphics = features.map((feature: any) => {
      const [lon, lat] = feature.geometry.coordinates;
      return new Graphic({
        geometry: new Point({
          longitude: lon,
          latitude: lat
        }),
        attributes: feature.properties
      });
    });

    return new FeatureLayer({
      source: graphics,
      objectIdField: 'OBJECTID',
      fields: [
        { name: 'OBJECTID', type: 'oid' },
        { name: 'id', type: 'string' },
        { name: 'latitude', type: 'double' },
        { name: 'longitude', type: 'double' },
        { name: 'mag', type: 'double' },
        { name: 'magnitude_type', type: 'string' },
        { name: 'place', type: 'string' },
        { name: 'time', type: 'string' },
        { name: 'depth', type: 'double' },
        { name: 'status', type: 'string' },
        { name: 'felt_reports', type: 'integer' },
        { name: 'significant', type: 'string' },
        { name: 'tsunami', type: 'string' },
        { name: 'reported_by', type: 'string' }
      ],
      renderer: new SimpleRenderer({
        symbol: this.getSymbolForType(layerId)
      }),
      popupTemplate: {
        title: 'Earthquake (Feature Layer)',
        content: '<b>ID:</b> {id}<br><b>Latitude:</b> {latitude}<br><b>Longitude:</b> {longitude}<br><b>Magnitude:</b> {mag}<br><b>Mag Type:</b> {magnitude_type}<br><b>Location:</b> {place}<br><b>Time:</b> {time}<br><b>Depth:</b> {depth}<br><b>Status:</b> {status}<br><b>Felt Reports:</b> {felt_reports}<br><b>Significant:</b> {significant}<br><b>Tsunami Risk:</b> {tsunami}<br><b>Reported By:</b> {reported_by}'
      }
    });
  }

  private async createCSVLayer(data: any): Promise<void> {
    this.currentLayer = await this.buildCSVLayer(data, this.selectedLayerType);
    this.map.add(this.currentLayer);
    await this.zoomToIsrael();
  }

  private async buildCSVLayer(data: any, layerId: string): Promise<any> {
    const features = data.features || [];
    let csvContent = 'longitude,latitude,id,mag,magnitude_type,place,time,depth,status,felt_reports,significant,tsunami,reported_by\n';

    features.forEach((feature: any) => {
      const [lon, lat] = feature.geometry.coordinates;
      const props = feature.properties;
      csvContent += `${lon},${lat},"${props.id}",${props.mag},"${props.magnitude_type}","${props.place}","${props.time}",${props.depth},"${props.status}",${props.felt_reports},"${props.significant}","${props.tsunami}","${props.reported_by}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    return new CSVLayer({
      url: url,
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      renderer: new SimpleRenderer({
        symbol: this.getSymbolForType(layerId)
      }),
      popupTemplate: {
        title: 'Earthquake (CSV Layer)',
        content: '<b>ID:</b> {id}<br><b>Latitude:</b> {latitude}<br><b>Longitude:</b> {longitude}<br><b>Magnitude:</b> {mag}<br><b>Mag Type:</b> {magnitude_type}<br><b>Location:</b> {place}<br><b>Time:</b> {time}<br><b>Depth:</b> {depth}<br><b>Status:</b> {status}<br><b>Felt Reports:</b> {felt_reports}<br><b>Significant:</b> {significant}<br><b>Tsunami Risk:</b> {tsunami}<br><b>Reported By:</b> {reported_by}'
      }
    });
  }

  private async createFeatureCollectionLayer(data: any): Promise<void> {
    this.currentLayer = await this.buildFeatureCollectionLayer(data, this.selectedLayerType);
    this.map.add(this.currentLayer);
    await this.zoomToIsrael();
  }

  private async buildFeatureCollectionLayer(data: any, layerId: string): Promise<any> {
    const features = data.features || [];
    const featureSet = features.map((feature: any, index: number) => {
      const [lon, lat] = feature.geometry.coordinates;
      return {
        geometry: {
          type: 'point',
          longitude: lon,
          latitude: lat
        },
        attributes: {
          ObjectID: index,
          id: feature.properties.id,
          latitude: feature.properties.latitude,
          longitude: feature.properties.longitude,
          mag: feature.properties.mag,
          magnitude_type: feature.properties.magnitude_type,
          place: feature.properties.place,
          time: feature.properties.time,
          depth: feature.properties.depth,
          status: feature.properties.status,
          felt_reports: feature.properties.felt_reports,
          significant: feature.properties.significant,
          tsunami: feature.properties.tsunami,
          reported_by: feature.properties.reported_by
        }
      };
    });

    return new FeatureLayer({
      source: featureSet,
      objectIdField: 'ObjectID',
      geometryType: 'point',
      fields: [
        { name: 'ObjectID', type: 'oid' },
        { name: 'id', type: 'string' },
        { name: 'latitude', type: 'double' },
        { name: 'longitude', type: 'double' },
        { name: 'mag', type: 'double' },
        { name: 'magnitude_type', type: 'string' },
        { name: 'place', type: 'string' },
        { name: 'time', type: 'string' },
        { name: 'depth', type: 'double' },
        { name: 'status', type: 'string' },
        { name: 'felt_reports', type: 'integer' },
        { name: 'significant', type: 'string' },
        { name: 'tsunami', type: 'string' },
        { name: 'reported_by', type: 'string' }
      ],
      renderer: new SimpleRenderer({
        symbol: this.getSymbolForType(layerId)
      }),
      popupTemplate: {
        title: 'Earthquake (Feature Collection)',
        content: '<b>ID:</b> {id}<br><b>Latitude:</b> {latitude}<br><b>Longitude:</b> {longitude}<br><b>Magnitude:</b> {mag}<br><b>Mag Type:</b> {magnitude_type}<br><b>Location:</b> {place}<br><b>Time:</b> {time}<br><b>Depth:</b> {depth}<br><b>Status:</b> {status}<br><b>Felt Reports:</b> {felt_reports}<br><b>Significant:</b> {significant}<br><b>Tsunami Risk:</b> {tsunami}<br><b>Reported By:</b> {reported_by}'
      }
    });
  }

  private async createClientSideFeatureLayer(data: any): Promise<void> {
    this.currentLayer = await this.buildClientSideFeatureLayer(data, this.selectedLayerType);
    this.map.add(this.currentLayer);
    await this.zoomToIsrael();
  }

  private async buildClientSideFeatureLayer(data: any, layerId: string): Promise<any> {
    const features = data.features || [];
    const graphics = features.map((feature: any, index: number) => {
      const [lon, lat] = feature.geometry.coordinates;
      return {
        geometry: {
          type: 'point',
          x: lon,
          y: lat,
          spatialReference: { wkid: 4326 }
        },
        attributes: {
          OBJECTID: index,
          id: feature.properties.id,
          latitude: feature.properties.latitude,
          longitude: feature.properties.longitude,
          mag: feature.properties.mag,
          magnitude_type: feature.properties.magnitude_type,
          place: feature.properties.place,
          time: feature.properties.time,
          depth: feature.properties.depth,
          status: feature.properties.status,
          felt_reports: feature.properties.felt_reports,
          significant: feature.properties.significant,
          tsunami: feature.properties.tsunami,
          reported_by: feature.properties.reported_by
        }
      };
    });

    return new FeatureLayer({
      source: graphics,
      objectIdField: 'OBJECTID',
      geometryType: 'point',
      spatialReference: { wkid: 4326 },
      fields: [
        { name: 'OBJECTID', alias: 'OBJECTID', type: 'oid' },
        { name: 'id', alias: 'ID', type: 'string' },
        { name: 'latitude', alias: 'Latitude', type: 'double' },
        { name: 'longitude', alias: 'Longitude', type: 'double' },
        { name: 'mag', alias: 'Magnitude', type: 'double' },
        { name: 'magnitude_type', alias: 'Mag Type', type: 'string' },
        { name: 'place', alias: 'Location', type: 'string' },
        { name: 'time', alias: 'Time', type: 'string' },
        { name: 'depth', alias: 'Depth', type: 'double' },
        { name: 'status', alias: 'Status', type: 'string' },
        { name: 'felt_reports', alias: 'Felt Reports', type: 'integer' },
        { name: 'significant', alias: 'Significant', type: 'string' },
        { name: 'tsunami', alias: 'Tsunami Risk', type: 'string' },
        { name: 'reported_by', alias: 'Reported By', type: 'string' }
      ],
      renderer: new SimpleRenderer({
        symbol: this.getSymbolForType(layerId)
      }),
      popupTemplate: {
        title: 'Earthquake (Client-Side Feature)',
        content: '<b>ID:</b> {id}<br><b>Latitude:</b> {latitude}<br><b>Longitude:</b> {longitude}<br><b>Magnitude:</b> {mag}<br><b>Mag Type:</b> {magnitude_type}<br><b>Location:</b> {place}<br><b>Time:</b> {time}<br><b>Depth:</b> {depth}<br><b>Status:</b> {status}<br><b>Felt Reports:</b> {felt_reports}<br><b>Significant:</b> {significant}<br><b>Tsunami Risk:</b> {tsunami}<br><b>Reported By:</b> {reported_by}'
      }
    });
  }

  private async zoomToIsrael(): Promise<void> {
    setTimeout(() => {
      this.view.goTo({
        center: [35.0, 31.5],
        zoom: 7
      }, { duration: 1000 }).catch((error: any) => {
        console.log('GoTo failed:', error);
      });
    }, 500);
  }

  getCurrentLayerInfo(): string {
    const layer = this.layerTypes.find(l => l.id === this.selectedLayerType);
    return layer ? layer.description : 'No layer selected';
  }

  ngOnDestroy(): void {
    if (this.view) {
      this.view.destroy();
    }
  }
}
