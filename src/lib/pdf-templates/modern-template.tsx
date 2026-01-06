import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Register fonts
// Note: In a real app, you should register actual font files.
// For now we rely on standard fonts or would need to add font files to public dir.
// Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' });

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  contact: {
    fontSize: 10,
    color: "#4B5563",
    flexDirection: "row",
    gap: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 8,
    color: "#111827",
  },
  experienceItem: {
    marginBottom: 10,
  },
  companyLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  companyName: {
    fontSize: 11,
    fontWeight: "bold",
  },
  date: {
    fontSize: 10,
    color: "#6B7280",
  },
  role: {
    fontSize: 11,
    fontStyle: "italic",
    marginBottom: 4,
  },
  bullet: {
    fontSize: 10,
    marginBottom: 2,
    lineHeight: 1.4,
    paddingLeft: 10,
  },
});

interface ResumeData {
  user: {
    name: string;
    email: string;
    phone?: string;
    linkedin?: string;
  };
  experiences: {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
}

export const ModernTemplate = ({ data }: { data: ResumeData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{data.user.name}</Text>
        <View style={styles.contact}>
          <Text>{data.user.email}</Text>
          {data.user.phone && <Text> | {data.user.phone}</Text>}
          {data.user.linkedin && <Text> | {data.user.linkedin}</Text>}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {data.experiences.map((exp, i) => (
          <View key={i} style={styles.experienceItem}>
            <View style={styles.companyLine}>
              <Text style={styles.companyName}>{exp.company}</Text>
              <Text style={styles.date}>
                {exp.startDate} - {exp.endDate}
              </Text>
            </View>
            <Text style={styles.role}>{exp.role}</Text>
            {exp.bullets.map((bullet, j) => (
              <Text key={j} style={styles.bullet}>
                • {bullet}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
