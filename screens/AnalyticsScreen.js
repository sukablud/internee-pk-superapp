import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, TYPE, cardStyle, buttonStyle, buttonTextStyle } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import { fetchSocialStats } from '../services/analyticsService';
import { downloadDocument } from '../utils/download';
import { notify } from '../utils/notify';

function buildReportHtml(stats) {
  const row = (s) =>
    `<tr><td style="padding:8px 12px;">${s.label}</td><td style="padding:8px 12px;font-weight:600;">${s.value}</td></tr>`;
  return `
    <html>
      <body style="font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px;">
        <h1 style="color:#191714;">Social Analytics Report</h1>
        <p style="color:#6E6862;">Generated ${new Date().toLocaleString()}</p>
        <h2 style="color:#E8452B;">Instagram</h2>
        <table>${stats.instagram.map(row).join('')}</table>
        <h2 style="color:#E8452B;">Twitter</h2>
        <table>${stats.twitter.map(row).join('')}</table>
        ${stats.insight ? `<h2 style="color:#E8452B;">Analysis</h2><p>${stats.insight}</p>` : ''}
      </body>
    </html>
  `;
}

function StatRow({ stats, rule }) {
  return (
    <View style={styles.statsRow}>
      {stats.map((s) => (
        <View key={s.label} style={styles.stat}>
          <Text style={TYPE.stat} numberOfLines={1} adjustsFontSizeToFit>
            {s.value}
          </Text>
          <View style={[styles.statRule, { backgroundColor: rule }]} />
          <Text style={TYPE.eyebrow}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function AnalyticsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchSocialStats();
    setStats(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const downloadReport = async () => {
    if (!stats) return;
    setGenerating(true);
    try {
      const { uri, shared } = await downloadDocument({
        html: buildReportHtml(stats),
        filename: 'social-analytics-report.html',
      });
      if (!shared) notify('Report downloaded', `Saved as ${uri}`);
    } catch (e) {
      notify('Download failed', 'The report could not be generated. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !stats) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={[TYPE.eyebrow, styles.loadingText]}>Fetching analytics</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Module 01"
        title="Analytics"
        tagColor={COLORS.analytics}
        note="Follower growth and engagement across channels"
      />

      <View style={[cardStyle, styles.card]}>
        <Text style={TYPE.cardTitle}>Instagram</Text>
        <StatRow stats={stats.instagram} rule={COLORS.accent} />
      </View>

      <View style={[cardStyle, styles.card]}>
        <Text style={TYPE.cardTitle}>Twitter</Text>
        <StatRow stats={stats.twitter} rule={COLORS.lms} />
      </View>

      {stats.insight ? (
        <View style={[cardStyle, styles.card, styles.insightCard]}>
          <Text style={[TYPE.eyebrow, styles.insightEyebrow]}>AI insight</Text>
          <Text style={TYPE.body}>{stats.insight}</Text>
        </View>
      ) : null}

      {stats.rateLimited ? (
        <View style={[cardStyle, styles.card, styles.noticeCard]}>
          <Text style={TYPE.meta}>
            Free-tier limit reached (20 requests a minute). Wait a minute, then refresh.
          </Text>
        </View>
      ) : null}

      <TouchableOpacity style={[buttonStyle, styles.button]} onPress={downloadReport} disabled={generating}>
        <Text style={buttonTextStyle}>{generating ? 'Generating…' : 'Download report'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={load}>
        <Text style={styles.secondaryButtonText}>Refresh data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 14 },
  content: { padding: 20, paddingTop: 28, paddingBottom: 40 },
  card: { marginBottom: 14 },
  statsRow: { flexDirection: 'row', marginTop: 16 },
  stat: { flex: 1, paddingRight: 10 },
  statRule: { height: 3, width: 26, marginTop: 6, marginBottom: 7 },
  insightCard: { backgroundColor: COLORS.accentSoft },
  noticeCard: { backgroundColor: COLORS.card, borderColor: COLORS.hairline },
  insightEyebrow: { marginBottom: 8, color: COLORS.accent },
  button: { marginTop: 6 },
  secondaryButton: {
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: COLORS.hairline,
  },
  secondaryButtonText: {
    ...TYPE.eyebrow,
    color: COLORS.label,
    fontSize: 11,
  },
});
