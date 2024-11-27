import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

interface RadarData {
  latitude: number;
  longitude: number;
  departement: string;
  type: string;
  emplacement: string;
  direction: string;
  vitesse_vehicules_legers_kmh: number | null;
}

interface APIResponse {
  data: RadarData[];
  meta: {
    total: number;
    page: number;
    page_size: number;
  };
}

export default function TabTwoScreen() {
  const [radarData, setRadarData] = useState<RadarData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRadarData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://tabular-api.data.gouv.fr/api/resources/8a22b5a8-4b65-41be-891a-7c0aead4ba51/data/');
        const jsonData: APIResponse = await response.json();
        console.log(jsonData);
        setRadarData(jsonData.data);
      } catch (error) {
        console.error('Error fetching radar data:', error);
      } finally {
        setIsLoading(false);
      }
    };

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
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: 46.603354, // Center of France
          longitude: 1.888334,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
      >
        {radarData.map((radar, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: radar.latitude,
              longitude: radar.longitude,
            }}
            title={`${radar.type} - ${radar.emplacement}`}
            description={`Département: ${radar.departement}${radar.vitesse_vehicules_legers_kmh ? ` - Vitesse max: ${radar.vitesse_vehicules_legers_kmh} km/h` : ''}\n${radar.direction}`}
          />
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
});