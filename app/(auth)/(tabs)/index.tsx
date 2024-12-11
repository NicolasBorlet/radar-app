import { Button, Image, StyleSheet } from 'react-native';

import { useAuth } from '@/app/ctx';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fetchRanks, Rank } from '@/lib/api/rank';
import React, { useEffect, useState } from 'react';

export default function HomeScreen() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const { logout } = useAuth();

  useEffect(() => {
    fetchRanks().then(setRanks);
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText style={styles.title}>Ranks</ThemedText>
        {ranks.map((rank) => (
          <ThemedText key={rank.id}>{rank.time}</ThemedText>
        ))}
      </ThemedView>

      {/* TODO: Add a button to go logout */}
      <Button onPress={logout} title="Logout" />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
