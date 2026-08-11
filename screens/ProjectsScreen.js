import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPE, cardStyle } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import { uploadSubmission } from '../services/storageService';
import { notify } from '../utils/notify';

const STORAGE_KEY = '@project_submissions';

const INITIAL_HISTORY = [
  { id: 's1', name: 'Task 2 - LMS Module.zip', date: '2026-07-28', status: 'Reviewed' },
  { id: 's2', name: 'Task 1 - Analytics Report.pdf', date: '2026-08-02', status: 'Reviewed' },
];

export default function ProjectsScreen() {
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setHistory(JSON.parse(json));
      } catch (e) {
        console.warn('Failed to load submission history', e);
      }
    })();
  }, []);

  const pickAndUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (result.canceled) return;

    const file = result.assets[0];
    setUploading(true);

    let uploadResult;
    try {
      uploadResult = await uploadSubmission(file);
    } catch (e) {
      setUploading(false);
      notify('Upload failed', 'Could not upload this file. Please try again.');
      return;
    }

    const next = [
      {
        id: `new-${Date.now()}`,
        name: file.name,
        date: new Date().toISOString().slice(0, 10),
        status: 'Submitted',
        url: uploadResult.url,
      },
      ...history,
    ];
    setHistory(next);
    setUploading(false);
    notify('Upload complete', `"${file.name}" was submitted successfully.`);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      notify('Error', 'Submission was added but could not be saved for next time.');
    }
  };

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={history}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <ScreenHeader
            eyebrow="Module 06"
            title="Submissions"
            tagColor={COLORS.projects}
            note={`${history.length} files submitted`}
          />
          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonBusy]}
            onPress={pickAndUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.uploadButtonText}>Upload a file</Text>
            )}
          </TouchableOpacity>
        </>
      }
      renderItem={({ item }) => {
        const isNew = item.status === 'Submitted';
        return (
          <View style={[cardStyle, styles.card]}>
            <View style={[styles.statusRule, isNew ? styles.ruleNew : styles.ruleReviewed]} />
            <Text style={TYPE.eyebrow}>{item.date}</Text>
            <Text style={[TYPE.cardTitle, styles.itemName]} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={[TYPE.eyebrow, isNew ? styles.statusNew : styles.statusReviewed]}>
              {item.status}
            </Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingTop: 28, paddingBottom: 40 },
  uploadButton: {
    backgroundColor: COLORS.projects,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.heading,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadButtonBusy: { backgroundColor: COLORS.label },
  uploadButtonText: { ...TYPE.eyebrow, color: '#FFFFFF', fontSize: 12 },
  card: { marginBottom: 14, paddingLeft: 20, overflow: 'hidden' },
  statusRule: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6 },
  ruleNew: { backgroundColor: COLORS.projects },
  ruleReviewed: { backgroundColor: COLORS.hairline },
  itemName: { marginTop: 5, marginBottom: 7 },
  statusNew: { color: COLORS.projects },
  statusReviewed: { color: COLORS.label },
});
