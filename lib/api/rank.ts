// TODO: Implement rank API
// Fetch rank http://localhost:1337/api/ranks
// Fetch rank by id http://localhost:1337/api/ranks/:id
// Create rank http://localhost:1337/api/ranks
// Update rank http://localhost:1337/api/ranks/:id
// Delete rank http://localhost:1337/api/ranks/:id
// A rank need to pass the time in seconds, the userid

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Rank {
  id: string;
  time: number;
  userId: string;
  zoneId: string;
}

export const fetchRanks = async () => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch('http://localhost:1337/api/ranks', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

interface RankData {
  time: number;
  user: string | null;
  zone: string;
}

interface RankResponse {
  data: {
    id: number;
    attributes: RankData;
  };
}

export const createRank = async (timeInZone: number, userId: string | null, zoneId: string): Promise<RankResponse> => {
  if (!userId) throw new Error('User ID is required');
  if (!zoneId) throw new Error('Zone ID is required');

  const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/ranks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        time: timeInZone,
        user: userId,
        zone: zoneId
      }
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create rank');
  }

  return response.json();
};

export const updateRank = async (id: string, time: number, userId: string) => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`http://localhost:1337/api/ranks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ time, userId }),
  });
  const data = await response.json();
  return data;
};

export const deleteRank = async (id: string) => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`http://localhost:1337/api/ranks/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};
