import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors } from '../../theme/tokens';

const TEST_VIDEO_URL =
  'https://stream.mux.com/sqlt768FZ576Ce00vXi2Atkw02RbPJL1ut9Cic71XfenY.m3u8';

export default function VideoAvTestScreen() {
  const player = useVideoPlayer(
    {
      uri: TEST_VIDEO_URL,
      contentType: 'hls',
    },
    (instance) => {
      instance.loop = false;
    }
  );
  const [snapshot, setSnapshot] = useState({
    status: 'idle',
    playing: false,
    currentTime: 0,
    duration: 0,
    bufferedPosition: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSnapshot({
        status: player.status,
        playing: player.playing,
        currentTime: player.currentTime ?? 0,
        duration: player.duration ?? 0,
        bufferedPosition: player.bufferedPosition ?? 0,
      });
    }, 250);

    return () => clearInterval(interval);
  }, [player]);

  const isBuffering = snapshot.status === 'loading';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Teste de vídeo (expo-video)</Text>
        <Text style={styles.subtitle}>URL HLS (.m3u8) para validar reprodução no app</Text>

        <View style={styles.videoCard}>
          <VideoView
            style={styles.video}
            player={player}
            nativeControls
            contentFit="contain"
          />
          {isBuffering ? (
            <View style={styles.overlay}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.overlayText}>Buffering...</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.button}
            onPress={() => {
              player.play();
            }}
          >
            <Text style={styles.buttonText}>Play</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => {
              player.pause();
            }}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Pause</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => {
              player.replay();
            }}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Replay</Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Status</Text>
          <Text style={styles.infoLine}>status: {String(snapshot.status)}</Text>
          <Text style={styles.infoLine}>isPlaying: {String(snapshot.playing)}</Text>
          <Text style={styles.infoLine}>isBuffering: {String(isBuffering)}</Text>
          <Text style={styles.infoLine}>currentTime (s): {snapshot.currentTime.toFixed(2)}</Text>
          <Text style={styles.infoLine}>duration (s): {snapshot.duration.toFixed(2)}</Text>
          <Text style={styles.infoLine}>bufferedPosition (s): {snapshot.bufferedPosition.toFixed(2)}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>URL usada</Text>
          <Text selectable style={styles.urlText}>
            {TEST_VIDEO_URL}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    gap: 14,
  },
  title: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.mutedForeground,
    fontSize: 13,
  },
  videoCard: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: colors.border,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    right: 12,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  overlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  buttonTextSecondary: {
    color: colors.foreground,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  infoTitle: {
    color: colors.foreground,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoLine: {
    color: colors.foreground,
    fontSize: 12,
  },
  errorText: {
    color: colors.danger,
  },
  urlText: {
    color: colors.foreground,
    fontSize: 12,
  },
});
