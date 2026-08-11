import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, TYPE } from '../theme';

// Eyebrow + rule + display title. The rule takes the module's tag colour, so
// each tab is identifiable at a glance without recolouring the whole screen.
export default function ScreenHeader({ eyebrow, title, note, tagColor }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.eyebrowRow}>
        <View style={[styles.tag, { backgroundColor: tagColor }]} />
        <Text style={TYPE.eyebrow}>{eyebrow}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tag: { width: 22, height: 4, borderRadius: 2, marginRight: 8 },
  title: { ...TYPE.display },
  note: { ...TYPE.meta, marginTop: 6, maxWidth: 340 },
});
