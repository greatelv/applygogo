import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 35, // 12.3mm (approx p-[12mm])
    fontFamily: "NotoSansKR",
    fontSize: 11, // 11pt
    lineHeight: 1.8, // leading-[1.8]
    color: "#1f2937", // text-gray-800
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb", // border-gray-200
    paddingBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 24, // text-3xl
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827", // text-gray-900
  },
  name: {
    fontSize: 12,
    color: "#6b7280", // text-gray-500
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14, // text-lg
    fontWeight: "bold",
    color: "#111827", // text-gray-900
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#111827",
    paddingLeft: 10,
  },
  content: {
    textAlign: "justify",
    marginBottom: 10,
  },
});

interface NarrativePdfProps {
  content: {
    core_competency?: string;
    key_achievements?: string;
    growth_process?: string;
    motivation_and_goals?: string;
  };
  name: string;
}

export const NarrativePdfPage = ({ content, name }: NarrativePdfProps) => {
  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>자기소개서</Text>
        <Text style={styles.name}>{name}</Text>
      </View>

      {/* Sections */}
      {content.core_competency && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>핵심 역량 및 강점</Text>
          <Text style={styles.content}>{content.core_competency}</Text>
        </View>
      )}

      {content.key_achievements && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주요 성과 (Key Achievements)</Text>
          <Text style={styles.content}>{content.key_achievements}</Text>
        </View>
      )}

      {content.growth_process && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>성장 과정</Text>
          <Text style={styles.content}>{content.growth_process}</Text>
        </View>
      )}

      {content.motivation_and_goals && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>입사 후 포부</Text>
          <Text style={styles.content}>{content.motivation_and_goals}</Text>
        </View>
      )}
    </Page>
  );
};
