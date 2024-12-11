import ZoneSvg from '@/components/zone';
import { createRank } from '@/lib/api/rank';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapView, { Region } from 'react-native-maps';

interface RadarData {
  id: string;
  latitude: number;
  longitude: number;
  departement: string;
  emplacement: string;
  direction: string;
  type: string;
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

const initialRegion = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
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
  const debounceTimer = useRef<NodeJS.Timeout>();
  const [currentDelta, setCurrentDelta] = useState<number>(0.0922);
  const [mapRegion, setMapRegion] = useState<Region>(initialRegion);
  const [isInZone, setIsInZone] = useState(false);
  const [time, setTime] = useState(0);
  const mapRef = useRef<MapView>(null);
  const [activeZone, setActiveZone] = useState<RadarData | null>(null);

  const radarsComponents = useMemo(() => {
    return radarData.map((radar, i) => (
      <ZoneSvg
        key={i}
        latitude={radar.latitude}
        longitude={radar.longitude}
        delta={currentDelta}
      />
    ));
  }, [radarData, currentDelta]);

  useEffect(() => {
    // need to refresh cause markers don't show on current delta change
    mapRef.current?.animateCamera({
      center: {
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      }
    });
  }, [currentDelta]);

  const handleRegionChange = useCallback((region: Region) => {
    // if (debounceTimer.current) {
    //   clearTimeout(debounceTimer.current);
    // }

    debounceTimer.current = setTimeout(() => {
      setCurrentDelta(region.latitudeDelta);
    }, 1000)

    console.log('Region changed:', region);

    // setMapRegion(region);
    // setCurrentDelta(Math.min(region.latitudeDelta, region.longitudeDelta));
  }, []);

  const fetchRadarData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Créer une zone de test près de la position actuelle
      if (location) {
        const testZone: RadarData = {
          id: 'test-zone',
          latitude: location.coords.latitude + 0.0001, // ~100m au nord
          longitude: location.coords.longitude,
          departement: 'TEST',
          emplacement: 'Test Zone',
          direction: 'N',
          type: 'TEST',
          vitesse_vehicules_legers_kmh: 50,
          equipement: 'TEST',
          date_installation: new Date().toISOString()
        };

        setRadarData([testZone]);
        setIsLoading(false);
        return;
      }

      // Check for cached data
      const cachedData = await AsyncStorage.getItem('radarData');
      if (cachedData) {
        console.log('Using cached data');
        const allData: RadarData[] = JSON.parse(cachedData);
        setRadarData(allData);
        setIsLoading(false);
        return;
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

        const response = await fetch(url.toString());
        const jsonData: APIResponse = await response.json();
        totalItems = jsonData.meta.total;
        allData = allData.concat(jsonData.data);
        page++;
      } while (allData.length < totalItems);

      console.log('Fetched all data');
      await AsyncStorage.setItem('radarData', JSON.stringify(allData));
      setRadarData(allData);
    } catch (error) {
      console.error('Error fetching radar data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Detect when user enters a zone
  const handleZoneEnter = useCallback((zone: RadarData) => {
    setTime(Date.now());
    console.log('Entered zone:', zone);
  }, []);

  // Detect when user leaves a zone
  const handleZoneLeave = useCallback(async () => {
    if (!activeZone) return;

    try {
      const userId = await AsyncStorage.getItem('userId');
      const timeInZone = Date.now() - time;

      await createRank(timeInZone, userId, activeZone.id);
      console.log('Rank created successfully');
    } catch (error) {
      console.error('Failed to create rank:', error);
    }
  }, [activeZone, time]);

  useEffect(() => {
    if (isInZone && activeZone) {
      handleZoneEnter(activeZone);
    } else {
      handleZoneLeave();
    }
  }, [isInZone, activeZone]);

  // Add this function to check if user is in any radar zone
  const checkIfInZone = useCallback((userLocation: Location.LocationObject) => {
    const ZONE_RADIUS = 100;

    const zoneIndex = radarData.findIndex(radar => {
      const distance = getDistance(
        { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
        { latitude: radar.latitude, longitude: radar.longitude }
      );
      return distance <= ZONE_RADIUS;
    });

    const isInAnyZone = zoneIndex !== -1;
    setIsInZone(isInAnyZone);
    setActiveZone(isInAnyZone ? radarData[zoneIndex] : null);
  }, [radarData]);

  // Update location watching
  useEffect(() => {
    const watchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: 1,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setLocation(newLocation);
          checkIfInZone(newLocation);
          setMapRegion(prev => ({
            ...prev,
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          }));
        }
      );

      return () => {
        subscription.remove();
      };
    };

    watchLocation();
  }, [checkIfInZone]);

  // Initial data fetch and location setup
  useEffect(() => {
    const setup = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation);
      setMapRegion(prev => ({
        ...prev,
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      }));
    };

    setup();
    fetchRadarData();
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
      ref={mapRef}
      region={mapRegion}
      initialRegion={initialRegion}
      // onRegionChangeComplete={handleRegionChange}
      rotateEnabled={false}
      showsUserLocation
      showsMyLocationButton
    >
      {radarsComponents}
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