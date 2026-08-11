import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, TYPE, cardStyle } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import { notify } from '../utils/notify';

const JOBS = [
  { id: 'j1', title: 'React Native Developer', company: 'Zenith Labs', location: 'Remote', category: 'Engineering' },
  { id: 'j2', title: 'UI/UX Designer', company: 'Northwind Studio', location: 'Lahore', category: 'Design' },
  { id: 'j3', title: 'Backend Engineer (Node.js)', company: 'Orbit Systems', location: 'Karachi', category: 'Engineering' },
  { id: 'j4', title: 'Product Marketing Intern', company: 'Bluewave', location: 'Remote', category: 'Marketing' },
  { id: 'j5', title: 'QA Analyst', company: 'Zenith Labs', location: 'Islamabad', category: 'Engineering' },
];

const CATEGORIES = ['All', 'Engineering', 'Design', 'Marketing'];
const LOCATIONS = ['All', 'Remote', 'Lahore', 'Karachi', 'Islamabad'];

export default function JobPortalScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('All');
  const [favorites, setFavorites] = useState({});
  const [db, setDb] = useState(null);
  const [applyingTo, setApplyingTo] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const database = await SQLite.openDatabaseAsync('superapp.db');
        await database.runAsync(
          'CREATE TABLE IF NOT EXISTS favorites (job_id TEXT PRIMARY KEY)'
        );
        const rows = await database.getAllAsync('SELECT job_id FROM favorites');
        const loaded = {};
        rows.forEach((row) => {
          loaded[row.job_id] = true;
        });
        setFavorites(loaded);
        setDb(database);
      } catch (e) {
        console.warn('Failed to load favorites from SQLite', e);
      }
    })();
  }, []);

  const toggleFavorite = async (id) => {
    const isNowFavorite = !favorites[id];
    setFavorites((prev) => ({ ...prev, [id]: isNowFavorite }));
    if (!db) return;
    try {
      if (isNowFavorite) {
        await db.runAsync('INSERT OR REPLACE INTO favorites (job_id) VALUES (?)', id);
      } else {
        await db.runAsync('DELETE FROM favorites WHERE job_id = ?', id);
      }
    } catch (e) {
      notify('Error', 'Could not save favorite.');
    }
  };

  const filtered = useMemo(() => {
    return JOBS.filter((job) => {
      const matchesQuery =
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'All' || job.category === category;
      const matchesLocation = location === 'All' || job.location === location;
      return matchesQuery && matchesCategory && matchesLocation;
    });
  }, [query, category, location]);

  const apply = async (job) => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
      type: ['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    });
    if (result.canceled) return;

    const resume = result.assets[0];
    setApplyingTo(job.id);
    setTimeout(() => {
      setApplyingTo(null);
      notify(
        'Application submitted',
        `"${resume.name}" was sent to ${job.company} for the ${job.title} role.`
      );
    }, 1200);
  };

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={filtered}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <ScreenHeader
            eyebrow="Module 05"
            title="Jobs"
            tagColor={COLORS.jobs}
            note={`${filtered.length} of ${JOBS.length} roles shown`}
          />
          <TextInput
            style={styles.search}
            placeholder="Search title or company"
            placeholderTextColor={COLORS.placeholder}
            value={query}
            onChangeText={setQuery}
          />
          <View style={styles.filterRow}>
            <View style={[styles.pickerWrapper, styles.pickerHalf]}>
              <Picker selectedValue={category} onValueChange={setCategory}>
                {CATEGORIES.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>
            <View style={[styles.pickerWrapper, styles.pickerHalf]}>
              <Picker selectedValue={location} onValueChange={setLocation}>
                {LOCATIONS.map((l) => (
                  <Picker.Item key={l} label={l} value={l} />
                ))}
              </Picker>
            </View>
          </View>
        </>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={TYPE.cardTitle}>Nothing matches</Text>
          <Text style={[TYPE.meta, styles.emptyNote]}>
            Clear the search box or set both filters back to All.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const isFavorite = !!favorites[item.id];
        const isApplying = applyingTo === item.id;
        return (
          <View style={[cardStyle, styles.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderText}>
                <Text style={TYPE.eyebrow}>
                  {item.category} · {item.location}
                </Text>
                <Text style={[TYPE.cardTitle, styles.jobTitle]}>{item.title}</Text>
                <Text style={TYPE.meta}>{item.company}</Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleFavorite(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteIconOn]}>
                  {isFavorite ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.applyButton, isApplying && styles.applyButtonBusy]}
              onPress={() => apply(item)}
              disabled={isApplying}
            >
              <Text style={styles.applyButtonText}>
                {isApplying ? 'Sending…' : 'Apply with resume'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingTop: 28, paddingBottom: 40 },
  search: {
    backgroundColor: COLORS.card,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.heading,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORS.heading,
    marginBottom: 10,
  },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  pickerWrapper: {
    backgroundColor: COLORS.card,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.hairline,
    overflow: 'hidden',
  },
  pickerHalf: { flex: 1 },
  empty: { alignItems: 'center', marginTop: 28 },
  emptyNote: { marginTop: 6, textAlign: 'center' },
  card: { marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeaderText: { flex: 1, marginRight: 10 },
  jobTitle: { marginTop: 5, marginBottom: 3 },
  favoriteIcon: { fontSize: 24, color: COLORS.placeholder, lineHeight: 28 },
  favoriteIconOn: { color: COLORS.marigold },
  applyButton: {
    backgroundColor: COLORS.jobs,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.heading,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 16,
  },
  applyButtonBusy: { backgroundColor: COLORS.label },
  applyButtonText: { ...TYPE.eyebrow, color: '#FFFFFF', fontSize: 11 },
});
