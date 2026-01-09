import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Font,
} from "@react-pdf/renderer";
import { registerFonts } from "./modern-pdf";

const styles = StyleSheet.create({
  page: {
    paddingVertical: 36, // py-12
    paddingHorizontal: 54, // Increase padding to simulate max-w-2xl mx-auto
    fontFamily: "NotoSansKR",
    fontSize: 10.5, // text-sm
    lineHeight: 1.625, // leading-relaxed
    color: "#000000",
  },
  header: {
    marginBottom: 36, // mb-12
  },
  name: {
    fontSize: 36, // text-5xl
    fontFamily: "NotoSansKR",
    fontWeight: 300, // font-light
    marginBottom: 8,
    color: "#111827",
    letterSpacing: -0.75,
    lineHeight: 1.1, // tighter for large names
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 9, // text-xs
    color: "#6b7280", // text-gray-500
    marginTop: 6,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    marginBottom: 30, // mb-10
  },
  sectionTitle: {
    fontSize: 9, // text-xs
    fontWeight: 700, // font-semibold (bold in pdf-renderer)
    color: "#9ca3af", // text-gray-400
    letterSpacing: 2.25, // tracking-widest
    marginBottom: 18,
    textTransform: "uppercase",
  },
  summaryText: {
    fontSize: 10.5, // text-sm
    color: "#374151", // text-gray-700
    lineHeight: 1.625,
    fontWeight: 300, // font-light
  },
  expContainer: {
    gap: 24, // space-y-8
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 9,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 500, // font-medium
    color: "#111827",
  },
  position: {
    fontSize: 10.5, // text-sm
    color: "#6b7280", // text-gray-500
  },
  period: {
    fontSize: 9, // text-xs
    color: "#9ca3af", // text-gray-400
  },
  bulletList: {
    gap: 6,
  },
  bulletText: {
    fontSize: 10.5, // text-sm
    color: "#4b5563", // text-gray-600
    lineHeight: 1.625,
    fontWeight: 300, // font-light
  },
  skillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillBadge: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    fontSize: 9,
    color: "#374151",
    backgroundColor: "#f9fafb",
    borderRadius: 9999,
    borderWidth: 0.75,
    borderColor: "#e5e7eb",
  },
  eduContainer: {
    gap: 12,
  },
  eduItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  linkText: {
    color: "#4b5563",
    textDecoration: "none",
  },
});

interface MinimalPdfProps {
  personalInfo?: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
}

export const MinimalPdf = ({
  personalInfo,
  experiences = [],
  educations = [],
  skills = [],
}: MinimalPdfProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {personalInfo?.name_en || personalInfo?.name_kr || "이름 없음"}
          </Text>
          <View style={styles.contactRow}>
            {personalInfo?.email && <Text>{personalInfo.email}</Text>}
            {personalInfo?.phone && <Text>{personalInfo.phone}</Text>}
            {personalInfo?.links?.map((link: any, i: number) => (
              // @ts-ignore
              <View key={i} style={styles.contactItem}>
                <Link src={link.url} style={styles.linkText}>
                  <Text style={{ fontWeight: "medium" }}>{link.label}: </Text>
                  {link.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </Link>
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.summaryText}>
            Frontend Developer specializing in React and TypeScript with 4+
            years of experience building elegant, user-centric web applications.
          </Text>
        </View>

        {/* Experience */}
        {experiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <View style={styles.expContainer}>
              {experiences.map((exp) => (
                // @ts-ignore
                <View key={exp.id}>
                  <View style={styles.expHeader}>
                    <View>
                      <Text style={styles.companyName}>{exp.companyEn}</Text>
                      <Text style={styles.position}>{exp.positionEn}</Text>
                    </View>
                    <Text style={styles.period}>{exp.period}</Text>
                  </View>
                  <View style={styles.bulletList}>
                    {exp.bulletsEn?.map((bullet: string, idx: number) => (
                      // @ts-ignore
                      <Text key={idx} style={styles.bulletText}>
                        {bullet}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillRow}>
              {skills.map((skill) => (
                // @ts-ignore
                <Text key={skill.id} style={styles.skillBadge}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Education */}
        {educations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.eduContainer}>
              {educations.map((edu) => (
                // @ts-ignore
                <View key={edu.id} style={styles.eduItem}>
                  <View>
                    <Text style={styles.companyName}>
                      {edu.school_name_en || edu.school_name}
                    </Text>
                    <Text style={styles.position}>
                      {edu.degree_en || edu.degree}, {edu.major_en || edu.major}
                    </Text>
                  </View>
                  <Text style={styles.period}>
                    {edu.start_date} - {edu.end_date}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};
