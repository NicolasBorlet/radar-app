// TODO: Implement rank API
// Fetch rank http://localhost:1337/api/ranks
// Fetch rank by id http://localhost:1337/api/ranks/:id
// Create rank http://localhost:1337/api/ranks
// Update rank http://localhost:1337/api/ranks/:id
// Delete rank http://localhost:1337/api/ranks/:id
// A rank need to pass the time in seconds, the userid

export interface Rank {
  id: string;
  time: number;
  userId: string;
}

export const fetchRanks = async () => {
  const response = await fetch('http://localhost:1337/api/ranks');
  const data = await response.json();
  return data;
};

export const createRank = async (time: number, userId: string) => {
  const response = await fetch('http://localhost:1337/api/ranks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ time, userId }),
  });
  const data = await response.json();
  return data;
};

export const updateRank = async (id: string, time: number, userId: string) => {
  const response = await fetch(`http://localhost:1337/api/ranks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ time, userId }),
  });
  const data = await response.json();
  return data;
};

export const deleteRank = async (id: string) => {
  const response = await fetch(`http://localhost:1337/api/ranks/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  return data;
};
