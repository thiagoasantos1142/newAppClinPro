import React, { useCallback, useState } from 'react';
import { ScrollView, Text } from 'react-native';

interface BackendTestState {
  loading: boolean;
  error: string | null;
  data: unknown;
}

const FALLBACK_URL = 'http://192.168.0.252:8000/api/dev/test-user';

export default function BackendConnectionTestScreen() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState({ loading: true, error: null, data: null });

          try {
            const module = await import('../../services/api');
            const api = module.default;
            if (api) {
              const response = await api.get('/dev/test-user');
              if (isActive) setState({ loading: false, error: null, data: response.data });
              return;
            }
          } catch (innerError) {
            console.warn('BackendConnectionTestScreen fallback to fetch:', innerError);
          }

        const res = await fetch(FALLBACK_URL);
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json();
        setState({ loading: false, error: null, data });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setState({ loading: false, error: message, data: null });
      }
    };

      void fetchData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  if (state.loading) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text>Loading...</Text>
      </ScrollView>
    );
  }

  if (state.error) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text>Error: {state.error}</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text>{JSON.stringify(state.data, null, 2)}</Text>
    </ScrollView>
  );
}
