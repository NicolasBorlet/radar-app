import React, { useEffect, useState, useCallback } from 'react';
import MapView, { Region } from 'react-native-maps';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Location from 'expo-location';
import ZoneSvg from '@/components/zone';

interface RadarData {
  latitude: number;
  longitude: number;
  departement: string;
  type: string;
  emplacement: string;
  direction: string;
  vitesse_vehicules_legers_kmh: number | null;
  equipement: string;
  date_installation: string;
}

interface APIResponse {
  data: RadarData[];
  meta: {
    total: number;
    page: number;
    page_size: number;
  };
}

interface MapBounds {
  northEast: {
    latitude: number;
    longitude: number;
  };
  southWest: {
    latitude: number;
    longitude: number;
  };
}

export default function TabTwoScreen() {
  const [radarData, setRadarData] = useState<RadarData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: location ? location.coords.latitude : 48.8566,
    longitude: location ? location.coords.longitude : 2.3522,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }
  
  const getMapBounds = (region: Region): MapBounds => {
    const northEast = {
      latitude: region.latitude + region.latitudeDelta / 2,
      longitude: region.longitude + region.longitudeDelta / 2,
    };
    const southWest = {
      latitude: region.latitude - region.latitudeDelta / 2,
      longitude: region.longitude - region.longitudeDelta / 2,
    };
    return { northEast, southWest };
  };

  const fetchRadarData = useCallback(async (bounds: MapBounds) => {
    try {
      setIsLoading(true);
  
      // Check for cached data
      const cachedData = await AsyncStorage.getItem('radarData');
      if (cachedData) {
        console.log('Using cached data');
        const allData: RadarData[] = JSON.parse(cachedData);

        // Filter data for current region
        // const filteredData = allData.filter((radar) => (
        //   radar.latitude > bounds.southWest.latitude &&
        //   radar.latitude < bounds.northEast.latitude &&
        //   radar.longitude > bounds.southWest.longitude &&
        //   radar.longitude < bounds.northEast.longitude
        // ));

        setRadarData(allData);
        setIsLoading(false);
        return;
      } else {
        console.log('No cached data found');
      }
  
      // Fetch data from API
      let allData: RadarData[] = [];
      let page = 1;
      const pageSize = 50;
      let totalItems = 0;
  
      do {
        const url = new URL('https://tabular-api.data.gouv.fr/api/resources/8a22b5a8-4b65-41be-891a-7c0aead4ba51/data/');
        url.searchParams.append('page_size', pageSize.toString());
        url.searchParams.append('page', page.toString());
        // url.searchParams.append('latitude__greater', bounds.southWest.latitude.toString());
        // url.searchParams.append('latitude__less', bounds.northEast.latitude.toString());
        // url.searchParams.append('longitude__greater', bounds.southWest.longitude.toString());
        // url.searchParams.append('longitude__less', bounds.northEast.longitude.toString());
        // url.searchParams.append('date_installation__sort', 'desc');
  
        const response = await fetch(url.toString());
        const jsonData: APIResponse = await response.json();
        totalItems = jsonData.meta.total;
        allData = allData.concat(jsonData.data);
        page++;
      } while (allData.length < totalItems);
  
      console.log('Fetched all data for region:', bounds);
      await AsyncStorage.setItem('radarData', JSON.stringify(allData));
      setRadarData(allData);
    } catch (error) {
      console.error('Error fetching radar data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialBounds = getMapBounds(mapRegion);
    fetchRadarData(initialBounds);

    setMapRegion({
      ...mapRegion,
      latitude: location ? location.coords.latitude : 48.8566,
      longitude: location ? location.coords.longitude : 2.3522,
    });
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      region={mapRegion}
      initialRegion={mapRegion}
      rotateEnabled={false}
      showsUserLocation
      showsMyLocationButton
    >
      {radarData.map((radar) => (
        <ZoneSvg
          key={`${radar.latitude}-${radar.longitude}`}
          latitude={radar.latitude}
          longitude={radar.longitude}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  clusterMarker: {
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  clusterText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  callout: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutText: {
    fontSize: 12,
    marginBottom: 2,
  },
});