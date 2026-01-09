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
    padding: 24, // p-8 (32px) -> 24pt
    fontFamily: "NotoSerifKR",
    fontSize: 10.5, // 14px -> 10.5pt
    color: "#000000",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 24, // mb-8 -> 24pt
    paddingBottom: 18, // pb-6 (24px) -> 18pt
    borderBottomWidth: 2, // border-b-2
    borderBottomColor: "#1f2937", // border-gray-800
    textAlign: "center",
  },
  name: {
    fontSize: 22.5, // text-3xl
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 1.5, // tracking-wide
    lineHeight: 1.2,
  },
  contactContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    fontSize: 10.5, // text-sm
    color: "#4b5563", // text-gray-600
    alignItems: "center",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  separator: {
    color: "#4b5563", // Match text-gray-600
    paddingHorizontal: 2,
  },
  section: {
    marginBottom: 18, // mb-6 -> 18pt
  },
  sectionTitle: {
    fontSize: 12, // text-base (16px) -> 12pt
    fontWeight: "bold",
    color: "#111827", // text-gray-900
    marginBottom: 6, // mb-2
    paddingBottom: 3, // pb-1 (4px) -> 3pt
    borderBottomWidth: 0.75, // border-b (1px)
    borderBottomColor: "#d1d5db", // border-gray-300
    textAlign: "left",
    letterSpacing: 1.5, // tracking-wider
    textTransform: "uppercase",
  },
  summaryText: {
    fontSize: 10.5, // text-sm
    color: "#1f2937", // text-gray-800
    lineHeight: 1.625, // leading-relaxed
    textAlign: "justify", // text-justify
  },
  expContainer: {
    gap: 12, // space-y-4 (16px) -> 12pt
  },
  expItemHeader: {
    marginBottom: 3, // mb-1 (4px) -> 3pt
  },
  expRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  companyName: {
    fontSize: 10.5, // inherited size but bold
    fontWeight: "bold",
    color: "#111827", // text-gray-900
  },
  period: {
    fontSize: 9, // text-xs
    color: "#4b5563", // text-gray-600
  },
  position: {
    fontSize: 10.5, // text-sm
    color: "#374151", // text-gray-700
  },
  bulletList: {
    marginTop: 0,
    gap: 3, // space-y-1 (4px) -> 3pt
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  bulletIconContainer: {
    width: 8,
    // Classic uses leading-relaxed (lineHeight 1.625)
    // height = 10.5 * 1.625 = 17.06
    height: 17.06,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bulletPoint: {
    fontSize: 10.5,
    color: "#1f2937", // text-gray-800
  },
  bulletText: {
    flex: 1,
    fontSize: 10.5, // text-sm
    color: "#1f2937", // text-gray-800
    lineHeight: 1.625, // leading-relaxed
    marginTop: -1, // Vertical alignment fix
  },
  skillText: {
    fontSize: 10.5, // text-sm
    color: "#1f2937", // text-gray-800
  },
  eduContainer: {
    gap: 9, // space-y-3 (12px) -> 9pt
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
