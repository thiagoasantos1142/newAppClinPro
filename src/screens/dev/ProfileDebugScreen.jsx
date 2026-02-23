import React, { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { getProfile } from '../../services/modules/profile.service';

export default function ProfileDebugScreen() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setState({ loading: true, error: null, data: null });
        const response = await getProfile();
        console.log('ProfileDebugScreen response:', response);
        setState({ loading: false, error: null, data: response });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setState({ loading: false, error: message, data: null });
      }
    };

    fetchProfile();
  }, []);

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
