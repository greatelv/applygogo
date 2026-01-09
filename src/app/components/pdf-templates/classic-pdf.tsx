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

// Helper to format date YYYY-MM -> MMM YYYY
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  if (dateStr.toLowerCase() === "present" || dateStr.toLowerCase() === "현재")
    return "Present";

  try {
    const [year, month] = dateStr.split(/[-.]/);
    if (!year || !month) return dateStr;
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

interface ClassicPdfProps {
  personalInfo?: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  certifications?: any[];
  awards?: any[];
  languages?: any[];
}

export const ClassicPdf = ({
  personalInfo,
  experiences = [],
  educations = [],
  skills = [],
  certifications = [],
  awards = [],
  languages = [],
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
        {personalInfo?.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          </View>
        )}

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
                      <Text style={styles.period}>
                        {formatDate(exp.period.split(" - ")[0])} -{" "}
                        {formatDate(exp.period.split(" - ")[1])}
                      </Text>
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
                    {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Certifications & Awards & Languages */}
        {(certifications.length > 0 ||
          awards.length > 0 ||
          languages.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ADDITIONAL INFORMATION</Text>
            <View style={{ gap: 6 }}>
              {certifications.length > 0 && (
                <View>
                  <Text
                    style={{
                      fontSize: 9.5,
                      fontWeight: "bold",
                      marginBottom: 2,
                    }}
                  >
                    Certifications
                  </Text>
                  {certifications.map((cert: any, i: number) => (
                    // @ts-ignore
                    <Text key={i} style={styles.skillText}>
                      • {cert.name} {cert.issuer ? `| ${cert.issuer}` : ""}{" "}
                      {cert.date ? `(${formatDate(cert.date)})` : ""}
                    </Text>
                  ))}
                </View>
              )}
              {awards.length > 0 && (
                <View>
                  <Text
                    style={{
                      fontSize: 9.5,
                      fontWeight: "bold",
                      marginBottom: 2,
                    }}
                  >
                    Awards
                  </Text>
                  {awards.map((award: any, i: number) => (
                    // @ts-ignore
                    <Text key={i} style={styles.skillText}>
                      • {award.name} {award.issuer ? `| ${award.issuer}` : ""}{" "}
                      {award.date ? `(${formatDate(award.date)})` : ""}
                    </Text>
                  ))}
                </View>
              )}
              {languages.length > 0 && (
                <View>
                  <Text
                    style={{
                      fontSize: 9.5,
                      fontWeight: "bold",
                      marginBottom: 2,
                    }}
                  >
                    Languages
                  </Text>
                  {languages.map((lang: any, i: number) => (
                    // @ts-ignore
                    <Text key={i} style={styles.skillText}>
                      • {lang.name} {lang.level ? `(${lang.level})` : ""}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};
