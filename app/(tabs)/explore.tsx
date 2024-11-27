import React, { useEffect, useState, useCallback } from 'react';
import MapView, { Region, Marker, Callout } from 'react-native-maps';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';

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

interface Cluster {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  radars: RadarData[];
}

export default function TabTwoScreen() {
  const [radarData, setRadarData] = useState<RadarData[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 46.603354,
    longitude: 1.888334,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });

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

  const createClusters = useCallback((radars: RadarData[], region: Region) => {
    const scale = region.latitudeDelta * region.longitudeDelta;
    const clusterRadius = 0.01 * scale; // Adjust this value to change cluster size

    const clusters: Cluster[] = [];
    const processed = new Set<number>();

    radars.forEach((radar, index) => {
      if (processed.has(index)) return;

      const cluster: Cluster = {
        id: `cluster-${index}`,
        coordinate: {
          latitude: radar.latitude,
          longitude: radar.longitude,
        },
        radars: [radar],
      };

      // Find nearby radars
      radars.forEach((otherRadar, otherIndex) => {
        if (index === otherIndex || processed.has(otherIndex)) return;

        const distance = Math.sqrt(
          Math.pow(radar.latitude - otherRadar.latitude, 2) +
          Math.pow(radar.longitude - otherRadar.longitude, 2)
        );

        if (distance <= clusterRadius) {
          cluster.radars.push(otherRadar);
          processed.add(otherIndex);
        }
      });

      processed.add(index);
      clusters.push(cluster);
    });

    setClusters(clusters);
  }, []);

  const fetchRadarData = useCallback(async (bounds: MapBounds) => {
    try {
      setIsLoading(true);
      const url = new URL('https://tabular-api.data.gouv.fr/api/resources/8a22b5a8-4b65-41be-891a-7c0aead4ba51/data/');
      
      url.searchParams.append('page_size', '50');
      
      url.searchParams.append('latitude__greater', bounds.southWest.latitude.toString());
      url.searchParams.append('latitude__less', bounds.northEast.latitude.toString());
      url.searchParams.append('longitude__greater', bounds.southWest.longitude.toString());
      url.searchParams.append('longitude__less', bounds.northEast.longitude.toString());
      
      url.searchParams.append('date_installation__sort', 'desc');
      
      const response = await fetch(url.toString());
      const jsonData: APIResponse = await response.json();
      console.log('Fetched data for region:', bounds);
      console.log('URL:', url.toString());
      setRadarData(jsonData.data);
      createClusters(jsonData.data, mapRegion);
    } catch (error) {
      console.error('Error fetching radar data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [mapRegion, createClusters]);

  const onRegionChangeComplete = useCallback((region: Region) => {
    setMapRegion(region);
    const bounds = getMapBounds(region);
    fetchRadarData(bounds);
  }, [fetchRadarData]);

  useEffect(() => {
    const initialBounds = getMapBounds(mapRegion);
    fetchRadarData(initialBounds);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {clusters.map((cluster) => (
          <Marker
            key={cluster.id}
            coordinate={cluster.coordinate}
          >
            <View style={[
              styles.clusterMarker,
              { 
                width: Math.min(cluster.radars.length * 10 + 30, 70),
                height: Math.min(cluster.radars.length * 10 + 30, 70),
              }
            ]}>
              <Text style={styles.clusterText}>{cluster.radars.length}</Text>
            </View>
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{cluster.radars.length} radars dans cette zone</Text>
                {cluster.radars.map((radar, index) => (
                  <Text key={index} style={styles.calloutText}>
                    {radar.type} - {radar.emplacement}
                    {radar.vitesse_vehicules_legers_kmh ? ` (${radar.vitesse_vehicules_legers_kmh} km/h)` : ''}
                  </Text>
                ))}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
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