import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { ASAAS_BAAS_SEAL_URL } from '../config/env';

export default function AsaasBaasSeal({ style, width = 120, height = 36 }) {
  return (
    <View style={[styles.container, style]}>
      <SvgUri
        uri={ASAAS_BAAS_SEAL_URL}
        width={width}
        height={height}
        accessibilityLabel="Selo Banco Asaas"
        accessible
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});
