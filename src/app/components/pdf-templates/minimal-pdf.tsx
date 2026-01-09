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

interface MinimalPdfProps {
  personalInfo?: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  certifications?: any[];
  awards?: any[];
  languages?: any[];
}

export const MinimalPdf = ({
  personalInfo,
  experiences = [],
  educations = [],
  skills = [],
  certifications = [],
  awards = [],
  languages = [],
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
        {personalInfo?.summary && (
          <View style={styles.section}>
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          </View>
        )}

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
                    <Text style={styles.period}>
                      {formatDate(exp.period.split(" - ")[0])} -{" "}
                      {formatDate(exp.period.split(" - ")[1])}
                    </Text>
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
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={{ gap: 6 }}>
              {certifications.length > 0 && (
                <View style={{ marginBottom: 4 }}>
                  <Text
                    style={{
                      fontSize: 10.5,
                      fontWeight: "medium",
                      marginBottom: 2,
                    }}
                  >
                    Certifications
                  </Text>
                  {certifications.map((cert: any, i: number) => (
                    // @ts-ignore
                    <Text key={i} style={styles.bulletText}>
                      • {cert.name} {cert.issuer ? `| ${cert.issuer}` : ""}{" "}
                      {cert.date ? `(${formatDate(cert.date)})` : ""}
                    </Text>
                  ))}
                </View>
              )}
              {awards.length > 0 && (
                <View style={{ marginBottom: 4 }}>
                  <Text
                    style={{
                      fontSize: 10.5,
                      fontWeight: "medium",
                      marginBottom: 2,
                    }}
                  >
                    Awards
                  </Text>
                  {awards.map((award: any, i: number) => (
                    // @ts-ignore
                    <Text key={i} style={styles.bulletText}>
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
                      fontSize: 10.5,
                      fontWeight: "medium",
                      marginBottom: 2,
                    }}
                  >
                    Languages
                  </Text>
                  <View
                    style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}
                  >
                    {languages.map((lang: any, i: number) => (
                      // @ts-ignore
                      <Text key={i} style={styles.bulletText}>
                        • {lang.name} {lang.level ? `(${lang.level})` : ""}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};
