import React, { useCallback, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProfile, ProfileResponse } from '../../services/modules/profile.service';

interface DebugState {
  loading: boolean;
  error: string | null;
  data: ProfileResponse | null;
}

export default function ProfileDebugScreen() {
  const [state, setState] = useState<DebugState>({
    loading: true,
    error: null,
    data: null,
  });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchProfile = async (): Promise<void> => {
        try {
          setState({ loading: true, error: null, data: null });
          const response = await getProfile();
          console.log('ProfileDebugScreen response:', response);
          if (isActive) setState({ loading: false, error: null, data: response });
        } catch (err: unknown) {
          if (!isActive) return;
          const message = err instanceof Error ? err.message : 'Unknown error';
          setState({ loading: false, error: message, data: null });
        }
      };

      void fetchProfile();

      return () => {
        isActive = false;
      };
    }, [])
  );

  if (state.loading) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text>Loading profile...</Text>
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
