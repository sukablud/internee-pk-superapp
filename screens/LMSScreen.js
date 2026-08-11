import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPE, cardStyle } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import { notify } from '../utils/notify';
import { downloadDocument } from '../utils/download';

const STORAGE_KEY = '@lms_enrollment';

const COURSES = [
  {
    id: 'c1',
    title: 'React Native Fundamentals',
    instructor: 'S. Ahmed',
    lessons: 12,
    topics: ['Components & JSX', 'Props and state', 'Hooks in depth', 'Navigation patterns', 'Styling & Flexbox', 'Debugging on device'],
  },
  {
    id: 'c2',
    title: 'UI/UX Design Basics',
    instructor: 'F. Malik',
    lessons: 8,
    topics: ['Design principles', 'Colour & typography', 'Wireframing', 'Prototyping', 'Usability testing'],
  },
  {
    id: 'c3',
    title: 'REST API Integration',
    instructor: 'H. Raza',
    lessons: 10,
    topics: ['HTTP verbs', 'fetch & async/await', 'Error handling', 'Authentication headers', 'Caching responses'],
  },
  {
    id: 'c4',
    title: 'Git & Version Control',
    instructor: 'A. Khan',
    lessons: 6,
    topics: ['Repositories & commits', 'Branching', 'Merge vs rebase', 'Pull requests', 'Resolving conflicts'],
  },
];

function buildMaterialText(course) {
  return [
    `${course.title}`,
    `${'='.repeat(course.title.length)}`,
    ``,
    `Instructor: ${course.instructor}`,
    `Lessons: ${course.lessons}`,
    `Downloaded: ${new Date().toLocaleString()}`,
    ``,
    `Course Outline`,
    `--------------`,
    ...course.topics.map((t, i) => `${i + 1}. ${t}`),
    ``,
    `These materials are provided for offline study as part of the`,
    `Internee.pk Learning Management System.`,
  ].join('\n');
}

function buildMaterialHtml(course) {
  return `
    <html>
      <body style="font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px;">
        <h1 style="color:#111827;">${course.title}</h1>
        <p style="color:#6B7280;">Instructor: ${course.instructor} &middot; ${course.lessons} lessons</p>
        <h2 style="color:#4F46E5;">Course Outline</h2>
        <ol>${course.topics.map((t) => `<li style="padding:4px 0;">${t}</li>`).join('')}</ol>
        <p style="color:#6B7280;font-size:12px;">Downloaded ${new Date().toLocaleString()} — Internee.pk LMS</p>
      </body>
    </html>
  `;
}

export default function LMSScreen() {
  const [enrolled, setEnrolled] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setEnrolled(JSON.parse(json));
      } catch (e) {
        console.warn('Failed to load enrollment', e);
      }
    })();
  }, []);

  const toggleEnroll = async (id) => {
    const next = { ...enrolled, [id]: !enrolled[id] };
    setEnrolled(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      notify('Error', 'Could not save enrollment status.');
    }
  };

  const downloadMaterial = async (course) => {
    const filename = `${course.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-materials.txt`;
    try {
      const { shared } = await downloadDocument({
        text: buildMaterialText(course),
        html: buildMaterialHtml(course),
        filename,
      });
      if (!shared) notify('Download complete', `Saved as ${filename}`);
    } catch (e) {
      notify('Download failed', 'Could not download the course materials.');
    }
  };

  const enrolledCount = Object.values(enrolled).filter(Boolean).length;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={COURSES}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <ScreenHeader
          eyebrow="Module 02"
          title="Learning"
          tagColor={COLORS.lms}
          note={`${COURSES.length} courses available · ${enrolledCount} enrolled`}
        />
      }
      renderItem={({ item }) => {
        const isEnrolled = !!enrolled[item.id];
        return (
          <View style={[cardStyle, styles.card]}>
            {isEnrolled ? (
              <View style={styles.enrolledFlag}>
                <Text style={styles.enrolledFlagText}>Enrolled</Text>
              </View>
            ) : null}

            <Text style={TYPE.eyebrow}>{item.lessons} lessons</Text>
            <Text style={[TYPE.cardTitle, styles.courseTitle]}>{item.title}</Text>
            <Text style={TYPE.meta}>{item.instructor}</Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.pill, isEnrolled ? styles.pillActive : styles.pillOutline]}
                onPress={() => toggleEnroll(item.id)}
              >
                <Text style={isEnrolled ? styles.pillTextActive : styles.pillTextOutline}>
                  {isEnrolled ? 'Leave course' : 'Enroll'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pillOutline} onPress={() => downloadMaterial(item)}>
                <Text style={styles.pillTextOutline}>Download materials</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingTop: 28, paddingBottom: 40 },
  card: { marginBottom: 14 },
  courseTitle: { marginTop: 5, marginBottom: 3 },
  enrolledFlag: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.lms,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderBottomLeftRadius: 6,
    borderTopRightRadius: 4,
  },
  enrolledFlagText: {
    ...TYPE.eyebrow,
    color: '#FFFFFF',
    fontSize: 9,
  },
  row: { flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  pill: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 5, borderWidth: 2 },
  pillActive: { backgroundColor: COLORS.heading, borderColor: COLORS.heading },
  pillOutline: {
    borderWidth: 2,
    borderColor: COLORS.hairline,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 5,
  },
  pillTextActive: { ...TYPE.eyebrow, color: '#FFFFFF', fontSize: 11 },
  pillTextOutline: { ...TYPE.eyebrow, color: COLORS.heading, fontSize: 11 },
});
