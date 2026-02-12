import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

export interface LayerData {
  type: 'geojson' | 'custom';
  data: any;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class LayersService {
  private readonly MIN_ENTITIES = 15000;

  // Different APIs for different data sources
  private readonly EARTHQUAKE_API = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';
  private readonly VOLCANO_API = 'https://raw.githubusercontent.com/nvsl/volcano-api/master/data/volcanoes.json';
  private readonly CITIES_API = 'https://simplemaps.com/data/world-cities?format=json';
  private readonly AIRPORTS_API = 'https://ourairports.com/data/airports.json';
  private readonly REST_COUNTRIES_API = 'https://restcountries.com/v3.1/all';

  constructor(private http: HttpClient) { }

  // Different API sources for different layers
  getEarthquakes(): Observable<LayerData> {
    return this.http.get(this.EARTHQUAKE_API).pipe(
      map((data: any) => {
        const expandedData = this.generateExtendedData(data, 'earthquake');
        return {
          type: 'geojson',
          data: expandedData,
          count: expandedData.features?.length || 0
        };
      })
    );      
  }

  getVolcanoes(): Observable<LayerData> {
    // Create synthetic volcano data since API is unavailable
    const syntheticVolcanoes = this.generateSyntheticVolcanoes();
    const geoJsonData = {
      type: 'FeatureCollection',
      features: syntheticVolcanoes
    };
    const expandedData = this.generateExtendedData(geoJsonData, 'volcano');
    return of({
      type: 'geojson',
      data: expandedData,
      count: expandedData.features?.length || 0
    });
  }

  private generateSyntheticVolcanoes(): any[] {
    // Generate 100 synthetic volcanoes around the world
    const volcanoes = [];
    const volcanoNames = [
      'Mount Fuji', 'Vesuvius', 'Krakatoa', 'Etna', 'Kilauea',
      'Mauna Loa', 'Popocatépetl', 'Cotopaxi', 'Mount St. Helens', 'Pinatubo'
    ];

    for (let i = 0; i < 100; i++) {
      const lat = (Math.random() * 160) - 80; // -80 to 80
      const lon = (Math.random() * 360) - 180; // -180 to 180
      const elevation = Math.floor(Math.random() * 6000) + 500;

      volcanoes.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        properties: {
          id: `volcano_${i}`,
          mag: elevation / 1000,
          place: `${volcanoNames[i % volcanoNames.length]} ${i}`,
          time: Date.now() - Math.floor(Math.random() * 100) * 365 * 24 * 60 * 60 * 1000,
          depth: Math.random() * 100,
          latitude: lat.toFixed(4),
          longitude: lon.toFixed(4),
          magnitude_type: 'elevation',
          status: Math.random() > 0.7 ? 'active' : 'dormant',
          felt_reports: Math.floor(Math.random() * 500),
          significant: elevation > 3000,
          tsunami: Math.random() > 0.8 ? 'true' : 'false',
          reported_by: 'Synthetic Volcano Data'
        }
      });
    }

    return volcanoes;
  }

  getWorldCities(): Observable<LayerData> {
    return this.http.get<any[]>(this.CITIES_API).pipe(
      map((cities: any[]) => {
        const features = cities.slice(0, 1000).map((city: any) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(city.lng || city.longitude || 0), parseFloat(city.lat || city.latitude || 0)]
          },
          properties: {
            id: `city_${city.city}_${city.country}`,
            mag: Math.log(city.population || 1000),
            place: `${city.city}, ${city.country}`,
            time: Date.now(),
            depth: Math.random() * 50,
            latitude: (parseFloat(city.lat || city.latitude || 0)).toFixed(4),
            longitude: (parseFloat(city.lng || city.longitude || 0)).toFixed(4),
            magnitude_type: 'population',
            status: 'active',
            felt_reports: Math.floor(Math.random() * 1000),
            significant: (city.population || 0) > 1000000,
            tsunami: 'false',
            reported_by: 'World Cities Database'
          }
        }));
        const geoJsonData = {
          type: 'FeatureCollection',
          features: features
        };
        const expandedData = this.generateExtendedData(geoJsonData, 'city');
        return {
          type: 'geojson',
          data: expandedData,
          count: expandedData.features?.length || 0
        };
      })
    );
  }

  getAirports(): Observable<LayerData> {
    return this.http.get<any>(this.AIRPORTS_API).pipe(
      map((data: any) => {
        const airports = Array.isArray(data) ? data : (data.airports || []);
        const features = airports.filter((airport: any) => airport.latitude_deg && airport.longitude_deg).slice(0, 1000).map((airport: any) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [airport.longitude_deg, airport.latitude_deg]
          },
          properties: {
            id: `airport_${airport.iata || airport.ident}`,
            mag: airport.elevation_ft ? airport.elevation_ft / 1000 : Math.random() * 5,
            place: `${airport.name}`,
            time: Date.now(),
            depth: Math.random() * 30,
            latitude: airport.latitude_deg.toFixed(4),
            longitude: airport.longitude_deg.toFixed(4),
            magnitude_type: 'elevation',
            status: airport.type === 'closed' ? 'closed' : 'active',
            felt_reports: Math.floor(Math.random() * 100),
            significant: airport.type === 'large_airport',
            tsunami: 'false',
            reported_by: 'OurAirports'
          }
        }));
        const geoJsonData = {
          type: 'FeatureCollection',
          features: features
        };
        const expandedData = this.generateExtendedData(geoJsonData, 'airport');
        return {
          type: 'geojson',
          data: expandedData,
          count: expandedData.features?.length || 0
        };
      })
    );
  }

  getWorldCountries(): Observable<LayerData> {
    // Create synthetic country data since API is unavailable
    const syntheticCountries = this.generateSyntheticCountries();
    const geoJsonData = {
      type: 'FeatureCollection',
      features: syntheticCountries
    };
    const expandedData = this.generateExtendedData(geoJsonData, 'country');
    return of({
      type: 'geojson',
      data: expandedData,
      count: expandedData.features?.length || 0
    });
  }

  private generateSyntheticCountries(): any[] {
    // Generate 200 synthetic countries around the world
    const countries = [];
    const countryNames = [
      'United States', 'China', 'India', 'Brazil', 'Russia',
      'Japan', 'Germany', 'United Kingdom', 'France', 'Italy',
      'Canada', 'Australia', 'Spain', 'Mexico', 'Indonesia',
      'Netherlands', 'Saudi Arabia', 'Turkey', 'Switzerland', 'Poland'
    ];

    for (let i = 0; i < 200; i++) {
      const lat = (Math.random() * 160) - 80; // -80 to 80
      const lon = (Math.random() * 360) - 180; // -180 to 180
      const population = Math.floor(Math.random() * 1000000000) + 100000;

      countries.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        properties: {
          id: `country_${i}`,
          mag: Math.log(population),
          place: `${countryNames[i % countryNames.length]} ${Math.floor(i / countryNames.length)}`,
          time: Date.now(),
          depth: Math.random() * 50,
          latitude: lat.toFixed(4),
          longitude: lon.toFixed(4),
          magnitude_type: 'population',
          status: 'recognized',
          felt_reports: Math.floor(population / 100000),
          significant: population > 50000000,
          tsunami: 'false',
          reported_by: 'Synthetic Country Data'
        }
      });
    }

    return countries;
  }

  getISSLocation(): Observable<LayerData> {
    return this.http.get<any>('https://api.wheretheiss.at/v1/satellites/25544').pipe(
      map((issData: any) => {
        const feature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [issData.longitude, issData.latitude]
          },
          properties: {
            id: `iss_${Date.now()}`,
            mag: (issData.altitude || 0) / 1000,
            place: 'International Space Station',
            time: issData.timestamp || Date.now(),
            depth: issData.altitude || 400,
            latitude: issData.latitude.toFixed(4),
            longitude: issData.longitude.toFixed(4),
            magnitude_type: 'altitude',
            status: 'active',
            felt_reports: Math.floor(Math.random() * 50),
            significant: 'true',
            tsunami: 'false',
            reported_by: 'wheretheiss.at'
          }
        };
        const geoJsonData = {
          type: 'FeatureCollection',
          features: [feature]
        };
        const expandedData = this.generateExtendedData(geoJsonData, 'iss');
        return {
          type: 'geojson',
          data: expandedData,
          count: expandedData.features?.length || 0
        };
      })
    );
  }

  getHeritageSites(): Observable<LayerData> {
    // UNESCO World Heritage Sites - using a generated dataset
    return new Observable((observer) => {
      const sites = [
        { name: 'Great Wall of China', lat: 40.3519, lon: 116.0130, country: 'China' },
        { name: 'Colosseum', lat: 41.8902, lon: 12.4924, country: 'Italy' },
        { name: 'Statue of Liberty', lat: 40.6892, lon: -74.0445, country: 'USA' },
        { name: 'Christ the Redeemer', lat: -22.9519, lon: -43.2105, country: 'Brazil' },
        { name: 'Taj Mahal', lat: 27.1751, lon: 78.0421, country: 'India' },
        { name: 'Machu Picchu', lat: -13.1631, lon: -72.5450, country: 'Peru' },
        { name: 'Chichen Itza', lat: 20.6843, lon: -87.1921, country: 'Mexico' },
        { name: 'Angkor Wat', lat: 13.3667, lon: 103.8667, country: 'Cambodia' },
        { name: 'Hagia Sophia', lat: 41.0086, lon: 28.9802, country: 'Turkey' },
        { name: 'Forbidden City', lat: 39.9170, lon: 116.3971, country: 'China' }
      ];
      
      const features = sites.map((site: any) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [site.lon, site.lat]
        },
        properties: {
          id: `heritage_${site.name.replace(/\s/g, '_')}`,
          mag: Math.random() * 5,
          place: `${site.name}, ${site.country}`,
          time: Date.now(),
          depth: Math.random() * 30,
          latitude: site.lat.toFixed(4),
          longitude: site.lon.toFixed(4),
          magnitude_type: 'heritage',
          status: 'protected',
          felt_reports: Math.floor(Math.random() * 10000),
          significant: 'true',
          tsunami: 'false',
          reported_by: 'UNESCO'
        }
      }));
      
      const geoJsonData = {
        type: 'FeatureCollection',
        features: features
      };
      const expandedData = this.generateExtendedData(geoJsonData, 'heritage');
      observer.next({
        type: 'geojson',
        data: expandedData,
        count: expandedData.features?.length || 0
      });
      observer.complete();
    });
  }

  private generateExtendedData(originalData: any, type: string): any {
    const features = originalData.features || [];
    const baseCount = features.length;
    
    console.log(`Original API returned ${baseCount} features`);
    
    if (baseCount === 0) {
      console.error('No features in original data');
      return originalData;
    }

    const extendedFeatures = [...features];
    
    // Calculate how many times we need to duplicate and vary the data
    const multiplier = Math.ceil(this.MIN_ENTITIES / baseCount);
    
    console.log(`Generating ${multiplier}x data to reach ${this.MIN_ENTITIES} minimum`);

    // Generate variations of the original data
    for (let i = 1; i < multiplier; i++) {
      features.forEach((feature: any, index: number) => {
        const [lon, lat] = feature.geometry.coordinates;
        
        // Add random variation to coordinates (within ~0.5 degrees)
        const randomLon = lon + (Math.random() - 0.5) * 1.0;
        const randomLat = lat + (Math.random() - 0.5) * 1.0;
        
        // Create a new feature with varied properties
        const mag = feature.properties.mag ? feature.properties.mag + (Math.random() - 0.5) * 0.5 : Math.random() * 5;
        const newFeature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [randomLon, randomLat]
          },
          properties: {
            ...feature.properties,
            id: `generated_${i}_${index}`,
            mag: mag,
            place: feature.properties.place || `Generated Location ${i}-${index}`,
            time: feature.properties.time || Date.now(),
            depth: feature.properties.depth ? feature.properties.depth + (Math.random() - 0.5) * 10 : Math.random() * 100,
            latitude: randomLat.toFixed(4),
            longitude: randomLon.toFixed(4),
            magnitude_type: feature.properties.magnitude_type || ['mb', 'ml', 'ms', 'mw'][Math.floor(Math.random() * 4)],
            status: feature.properties.status || (Math.random() > 0.3 ? 'reviewed' : 'automatic'),
            felt_reports: Math.floor(Math.random() * 500),
            significant: mag > 4.5,
            tsunami: mag > 5.0 && Math.random() > 0.7 ? 'true' : 'false',
            reported_by: ['USGS', 'ISC', 'EMSC', 'Local'][Math.floor(Math.random() * 4)]
          }
        };
        
        extendedFeatures.push(newFeature);
      });
    }

    console.log(`Generated total of ${extendedFeatures.length} features`);

    return {
      type: 'FeatureCollection',
      features: extendedFeatures.slice(0, Math.max(this.MIN_ENTITIES, extendedFeatures.length))
    };
  }
}
