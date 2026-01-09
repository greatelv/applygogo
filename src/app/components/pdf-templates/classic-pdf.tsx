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
    padding: 18, // Reduced from 20
    fontFamily: "NotoSerifKR",
    fontSize: 9, // Reduced from 9.5
    color: "#000000",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 16, // Reduced from 18
    paddingBottom: 12, // Reduced from 14
    borderBottomWidth: 2,
    borderBottomColor: "#1f2937",
    textAlign: "center",
  },
  name: {
    fontSize: 18, // Reduced from 20
    fontWeight: "bold",
    marginBottom: 6, // Reduced from 8
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    lineHeight: 1.2,
  },
  contactContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4, // Reduced from 5
    fontSize: 9, // Reduced from 9.5
    color: "#4b5563",
    alignItems: "center",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // Reduced from 5
  },
  separator: {
    color: "#4b5563",
    paddingHorizontal: 2,
  },
  section: {
    marginBottom: 12, // Reduced from 14
  },
  sectionTitle: {
    fontSize: 10.5, // Reduced from 11
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4, // Reduced from 5
    paddingBottom: 2, // Reduced from 2.5
    borderBottomWidth: 0.75,
    borderBottomColor: "#d1d5db",
    textAlign: "left",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  summaryText: {
    fontSize: 9, // Reduced from 9.5
    color: "#1f2937",
    lineHeight: 1.625,
    textAlign: "justify",
  },
  expContainer: {
    gap: 8, // Reduced from 10
  },
  expItemHeader: {
    marginBottom: 2, // Reduced from 2.5
  },
  expRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  companyName: {
    fontSize: 9, // Reduced from 9.5
    fontWeight: "bold",
    color: "#111827",
  },
  period: {
    fontSize: 7.5, // Reduced from 8
    color: "#4b5563",
  },
  position: {
    fontSize: 9, // Reduced from 9.5
    color: "#374151",
  },
  bulletList: {
    marginTop: 0,
    gap: 2, // Reduced from 2.5
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4, // Reduced from 5
  },
  bulletIconContainer: {
    width: 6, // Reduced from 7
    height: 14.6, // 9 * 1.625
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bulletPoint: {
    fontSize: 9, // Reduced from 9.5
    color: "#1f2937",
  },
  bulletText: {
    flex: 1,
    fontSize: 9, // Reduced from 9.5
    color: "#1f2937",
    lineHeight: 1.625,
    marginTop: -1,
  },
  skillText: {
    fontSize: 9, // Reduced from 9.5
    color: "#1f2937",
  },
  eduContainer: {
    gap: 6, // Reduced from 7.5
  },
  eduItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
});

interface ClassicPdfProps {
  personalInfo?: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
}

export const ClassicPdf = ({
  personalInfo,
  experiences = [],
  educations = [],
  skills = [],
}: ClassicPdfProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {personalInfo?.name_en || personalInfo?.name_kr || "이름 없음"}
          </Text>
          <View style={styles.contactContainer}>
            {personalInfo?.email && <Text>{personalInfo.email}</Text>}
            {personalInfo?.phone && (
              <View style={styles.contactItem}>
                <Text style={styles.separator}>|</Text>
                <Text>{personalInfo.phone}</Text>
              </View>
            )}
            {personalInfo?.links?.map((link: any, i: number) => (
              // @ts-ignore
              <View key={i} style={styles.contactItem}>
                <Text style={styles.separator}>|</Text>
                <Link
                  src={link.url}
                  style={{ color: "#4b5563", textDecoration: "none" }}
                >
                  <Text style={{ fontWeight: "bold" }}>{link.label}: </Text>
                  {link.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </Link>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
          <Text style={styles.summaryText}>
            Accomplished Frontend Developer with over 4 years of progressive
            experience in designing and implementing sophisticated web
            applications. Demonstrated expertise in modern JavaScript frameworks
            and a proven ability to enhance operational efficiency and user
            satisfaction.
          </Text>
        </View>

        {/* Experience */}
        {experiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROFESSIONAL EXPERIENCE</Text>
            <View style={styles.expContainer}>
              {experiences.map((exp) => (
                // @ts-ignore
                <View key={exp.id}>
                  <View style={styles.expItemHeader}>
                    <View style={styles.expRow}>
                      <Text style={styles.companyName}>{exp.companyEn}</Text>
                      <Text style={styles.period}>{exp.period}</Text>
                    </View>
                    <Text style={styles.position}>{exp.positionEn}</Text>
                  </View>
                  <View style={styles.bulletList}>
                    {exp.bulletsEn?.map((bullet: string, idx: number) => (
                      // @ts-ignore
                      <View key={idx} style={styles.bulletItem}>
                        <View style={styles.bulletIconContainer}>
                          <Text style={styles.bulletPoint}>•</Text>
                        </View>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
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
            <Text style={styles.sectionTitle}>TECHNICAL COMPETENCIES</Text>
            <View>
              <Text style={styles.skillText}>
                <Text style={{ fontWeight: "bold" }}>Skills: </Text>
                {skills.map((s) => s.name).join(", ")}
              </Text>
            </View>
          </View>
        )}

        {/* Education */}
        {educations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
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
