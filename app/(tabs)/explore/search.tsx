import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';

interface RadarData {
  id: string;
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

export default function Search() {
  // radars is an array of RadarData objects and it is passed as a params to the Search screen
  const { radars } = useLocalSearchParams<{ radars: RadarData[] }>();

  const [departement, setDepartement] = useState('');
  const [emplacement, setEmplacement] = useState('');
  const [filteredRadars, setFilteredRadars] = useState<RadarData[]>(radars || []);

  const handleSearch = () => {
    const results = radars.filter(radar =>
      radar.departement.toLowerCase().includes(departement.toLowerCase()) &&
      radar.emplacement.toLowerCase().includes(emplacement.toLowerCase())
    );
    setFilteredRadars(results);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Département"
        value={departement}
        onChangeText={setDepartement}
      />
      <TextInput
        style={styles.input}
        placeholder="Emplacement"
        value={emplacement}
        onChangeText={setEmplacement}
      />
      <Button title="Rechercher" onPress={handleSearch} />
      <FlatList
        data={filteredRadars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>Département: {item.departement}</Text>
            <Text style={styles.resultText}>Emplacement: {item.emplacement}</Text>
            <Text style={styles.resultText}>Type: {item.type}</Text>
            <Text style={styles.resultText}>Vitesse: {item.vitesse_vehicules_legers_kmh} km/h</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  resultText: {
    fontSize: 16,
  },
});