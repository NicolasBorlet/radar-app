import React, { useState } from 'react';
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

interface SearchProps {
  radars: RadarData[];
  onSearchResults: (results: RadarData[]) => void;
}

export default function Search({ radars, onSearchResults }: SearchProps) {
  const [departement, setDepartement] = useState('');
  const [emplacement, setEmplacement] = useState('');

  const handleSearch = () => {
    const results = radars.filter(radar =>
      radar.departement.toLowerCase().includes(departement.toLowerCase()) &&
      radar.emplacement.toLowerCase().includes(emplacement.toLowerCase())
    );
    onSearchResults(results);
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
        data={radars}
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
    // flex: 1,
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