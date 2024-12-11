import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(storedToken);
          router.replace('/(auth)/(tabs)');
        }
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log(process.env);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      await AsyncStorage.setItem('token', data.jwt);
      setToken(data.jwt);
      setUser(data.user);
      router.replace('/(auth)/(tabs)');
    } catch (error) {
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: username,
          username,
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.log(data);

        throw new Error(data.error.message);
      }

      await AsyncStorage.setItem('token', data.jwt);
      setToken(data.jwt);
      setUser(data.user);
      router.replace('/(auth)/(tabs)');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};