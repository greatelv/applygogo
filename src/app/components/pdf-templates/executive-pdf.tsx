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

const TextAny = Text as any;

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansKR",
    fontSize: 10.5,
    lineHeight: 1.6,
    color: "#333",
    paddingBottom: 40,
  },
  // Header with dark background
  header: {
    backgroundColor: "#0f172a", // slate-900
    color: "white",
    padding: "30 40",
    marginBottom: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    letterSpacing: 0.5,
    lineHeight: 1.2,
  },
  headerContact: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 9.5,
    color: "#cbd5e1", // slate-300
    marginTop: 4,
    alignItems: "center",
  },
  headerLink: {
    color: "#cbd5e1",
    textDecoration: "none",
  },

  // Main Content
  container: {
    paddingHorizontal: 40,
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a", // slate-900
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#0f172a",
    paddingBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Experience
  expItem: {
    marginBottom: 16,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  companyName: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: "#0f172a",
  },
  position: {
    fontSize: 10.5,
    color: "#334155", // slate-700
    fontWeight: "bold",
    marginTop: 1,
  },
  period: {
    fontSize: 9.5,
    color: "#64748b", // slate-500
    fontWeight: "medium",
  },

  bulletList: {
    marginTop: 4,
    gap: 3,
  },
  bulletItem: {
    flexDirection: "row",
    paddingLeft: 4,
  },
  bulletPoint: {
    width: 6,
    fontSize: 10,
    color: "#0f172a",
    marginRight: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: "#334155", // slate-700
  },

  // Summary
  summaryText: {
    fontSize: 10.5,
    color: "#334155",
    lineHeight: 1.6,
  },

  // Skills row
  skillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillBadge: {
    backgroundColor: "#f1f5f9", // slate-100
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 4,
    fontSize: 9.5,
    color: "#0f172a",
    fontWeight: "medium",
  },

  // Education
  eduItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  eduMain: {
    flex: 1,
  },

  // Items
  itemRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  itemLabel: {
    fontWeight: "bold",
    color: "#0f172a",
    width: 100,
  },
  itemContent: {
    flex: 1,
    color: "#334155",
  },
});

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const cleanDate = dateStr.trim();
  if (["-", "present", "현재"].includes(cleanDate.toLowerCase())) {
    if (["present", "현재"].includes(cleanDate.toLowerCase())) return "Present";
    return "";
  }
  try {
    const [year, month] = cleanDate.split(/[-.]/);
    if (!year || !month) return cleanDate;
    const date = new Date(parseInt(year), parseInt(month) - 1);
    if (isNaN(date.getTime())) return cleanDate;
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return cleanDate;
  }
};

interface ExecutivePdfProps {
  personalInfo?: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  additionalItems?: any[];
}

export const ExecutivePdf = ({
  personalInfo,
  experiences = [],
  educations = [],
  skills = [],
  additionalItems = [],
}: ExecutivePdfProps) => {
  const validExperiences = experiences.filter(
    (e) => e.company_name_source?.trim() || e.company_name_target?.trim(),
  );

  const certifications = additionalItems.filter(
    (i) => i.type === "CERTIFICATION",
  );
  const awards = additionalItems.filter((i) => i.type === "AWARD");
  const languages = additionalItems.filter((i) => i.type === "LANGUAGE");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {personalInfo?.name_target || personalInfo?.name_source || "Name"}
          </Text>
          <View style={styles.headerContact}>
            {personalInfo?.email && <Text>{personalInfo.email}</Text>}
            {personalInfo?.phone && (
              <>
                <Text style={{ color: "#475569" }}>|</Text>
                <Text>{personalInfo.phone}</Text>
              </>
            )}
            {personalInfo?.links
              ?.filter((l: any) => l.url)
              .map((link: any, i: number) => (
                <React.Fragment key={i}>
                  <Text style={{ color: "#475569" }}>|</Text>
                  <Link src={link.url} style={styles.headerLink}>
                    {link.label || "Link"}
                  </Link>
                </React.Fragment>
              ))}
          </View>
        </View>

        <View style={styles.container}>
          {/* Summary */}
          {(personalInfo?.summary_target || personalInfo?.summary_source) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Executive Summary</Text>
              <Text style={styles.summaryText}>
                {personalInfo.summary_target || personalInfo.summary_source}
              </Text>
            </View>
          )}

          {/* Experience */}
          {validExperiences.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Experience</Text>
              {validExperiences.map((exp, i) => (
                // @ts-ignore
                <View key={i} style={styles.expItem}>
                  <View style={styles.expHeader}>
                    <View>
                      <Text style={styles.companyName}>
                        {exp.company_name_target || exp.company_name_source}
                      </Text>
                      <Text style={styles.position}>
                        {exp.role_target || exp.role_source}
                      </Text>
                    </View>
                    <Text style={styles.period}>
                      {formatDate(exp.period.split(" - ")[0])} -{" "}
                      {formatDate(exp.period.split(" - ")[1])}
                    </Text>
                  </View>
                  <View style={styles.bulletList}>
                    {(exp.bullets_target || exp.bullets_source)?.map(
                      (bullet: string, idx: number) => (
                        // @ts-ignore
                        <View key={idx} style={styles.bulletItem}>
                          <Text style={styles.bulletPoint}>•</Text>
                          <Text style={styles.bulletText}>{bullet}</Text>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {educations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {educations.map((edu, i) => (
                // @ts-ignore
                <View key={i} style={styles.eduItem}>
                  <View style={styles.eduMain}>
                    <Text style={styles.companyName}>
                      {edu.school_name_target || edu.school_name_source}
                    </Text>
                    <Text style={{ fontSize: 10, color: "#334155" }}>
                      {edu.degree_target || edu.degree_source}
                      {(edu.degree_target || edu.degree_source) &&
                      (edu.major_target || edu.major_source)
                        ? ", "
                        : ""}
                      {edu.major_target || edu.major_source}
                    </Text>
                  </View>
                  <Text style={styles.period}>
                    {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Core Competencies</Text>
              <View style={styles.skillContainer}>
                {skills.map((skill, i) => (
                  // @ts-ignore
                  <Text key={i} style={styles.skillBadge}>
                    {skill.name}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Additional Info */}
          {(certifications.length > 0 ||
            awards.length > 0 ||
            languages.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Information</Text>

              {certifications.length > 0 && (
                <View style={{ marginBottom: 8 }}>
                  <Text
                    style={{
                      fontSize: 10.5,
                      fontWeight: "bold",
                      marginBottom: 4,
                    }}
                  >
                    Certifications
                  </Text>
                  {certifications.map((item: any, i: number) => (
                    // @ts-ignore
                    // @ts-ignore
                    <TextAny
                      key={i}
                      style={{
                        fontSize: 10,
                        color: "#334155",
                        marginBottom: 2,
                      }}
                    >
                      • {item.name_target || item.name_source}{" "}
                      {item.date ? `(${formatDate(item.date)})` : ""}
                    </TextAny>
                  ))}
                </View>
              )}

              {awards.length > 0 && (
                <View style={{ marginBottom: 8 }}>
                  <Text
                    style={{
                      fontSize: 10.5,
                      fontWeight: "bold",
                      marginBottom: 4,
                    }}
                  >
                    Awards
                  </Text>
                  {awards.map((item: any, i: number) => (
                    // @ts-ignore
                    // @ts-ignore
                    <TextAny
                      key={i}
                      style={{
                        fontSize: 10,
                        color: "#334155",
                        marginBottom: 2,
                      }}
                    >
                      • {item.name_target || item.name_source}
                    </TextAny>
                  ))}
                </View>
              )}

              {languages.length > 0 && (
                <View>
                  <Text
                    style={{
                      fontSize: 10.5,
                      fontWeight: "bold",
                      marginBottom: 4,
                    }}
                  >
                    Languages
                  </Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    {languages.map((item: any, i: number) => (
                      // @ts-ignore
                      <Text key={i} style={{ fontSize: 10, color: "#334155" }}>
                        • {item.name_target || item.name_source}
                        {(item.description_target || item.description_source) &&
                          ` (${item.description_target || item.description_source})`}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
