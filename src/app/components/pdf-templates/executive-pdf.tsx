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
import { shouldUseTargetData, type AppLocale } from "@/lib/resume-language";

const TextAny = Text as any;

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansKR",
    fontSize: 10.5,
    lineHeight: 1.6,
    color: "#333",
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 30,
    paddingRight: 30,
  },
  // Header with dark background
  header: {
    backgroundColor: "#0f172a", // slate-900
    color: "white",
    paddingTop: 50,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 20,
    marginLeft: -30,
    marginRight: -30,
    marginTop: -30,
    marginBottom: 16,
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
    paddingHorizontal: 0,
  },

  section: {
    marginBottom: 16,
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
    marginTop: 6,
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

const ensureUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

const formatDateLocale = (dateStr?: string, isKo?: boolean) => {
  if (!dateStr) return "";
  const cleanDate = dateStr.trim();
  if (["-", "present", "현재"].includes(cleanDate.toLowerCase())) {
    if (["present", "현재"].includes(cleanDate.toLowerCase()))
      return isKo ? "현재" : "Present";
    return "";
  }
  try {
    const [year, month] = cleanDate.split(/[-.]/);
    if (!year || !month) return cleanDate;
    const date = new Date(parseInt(year), parseInt(month) - 1);
    if (isNaN(date.getTime())) return cleanDate;

    if (isKo) {
      return `${year}.${month.padStart(2, "0")}`;
    }

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
  locale = "ko",
}: ExecutivePdfProps & { locale?: AppLocale }) => {
  const useTarget = shouldUseTargetData(locale);
  const isKo = !useTarget;

  const validExperiences = experiences.filter(
    (e) => e.company_name_source?.trim() || e.company_name_target?.trim(),
  );

  const validEducations = educations.filter(
    (e) => e.school_name_source?.trim() || e.school_name_target?.trim(),
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
            {(isKo ? personalInfo?.name_source : personalInfo?.name_target) ||
              "Name"}
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
                  <Link src={ensureUrl(link.url)} style={styles.headerLink}>
                    {link.label || "Link"}
                  </Link>
                </React.Fragment>
              ))}
          </View>
        </View>

        <View style={styles.container}>
          {/* Summary */}
          {(isKo
            ? personalInfo?.summary_source
            : personalInfo?.summary_target) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {isKo ? "핵심 요약" : "Executive Summary"}
              </Text>
              <Text style={styles.summaryText}>
                {isKo
                  ? personalInfo.summary_source
                  : personalInfo.summary_target}
              </Text>
            </View>
          )}

          {/* Experience */}
          {validExperiences.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {isKo ? "경력 사항" : "Professional Experience"}
              </Text>
              {validExperiences.map((exp, i) => (
                // @ts-ignore
                <View key={i} style={styles.expItem}>
                  <View style={styles.expHeader}>
                    <View>
                      <Text style={styles.companyName}>
                        {isKo
                          ? exp.company_name_source
                          : exp.company_name_target}
                      </Text>
                      <Text style={styles.position}>
                        {isKo ? exp.role_source : exp.role_target}
                      </Text>
                    </View>
                    <Text style={styles.period}>
                      {formatDateLocale(exp.period.split(" - ")[0], isKo)} -{" "}
                      {formatDateLocale(exp.period.split(" - ")[1], isKo)}
                    </Text>
                  </View>
                  <View style={styles.bulletList}>
                    {(isKo ? exp.bullets_source : exp.bullets_target)?.map(
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
          {validEducations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {isKo ? "학력 사항" : "Education"}
              </Text>
              {validEducations.map((edu, i) => (
                // @ts-ignore
                <View key={i} style={styles.eduItem}>
                  <View style={styles.eduMain}>
                    <Text style={styles.companyName}>
                      {isKo ? edu.school_name_source : edu.school_name_target}
                    </Text>
                    <Text style={{ fontSize: 10, color: "#334155" }}>
                      {isKo ? edu.degree_source : edu.degree_target}
                      {(isKo ? edu.degree_source : edu.degree_target) &&
                      (isKo ? edu.major_source : edu.major_target)
                        ? ", "
                        : ""}
                      {isKo ? edu.major_source : edu.major_target}
                    </Text>
                  </View>
                  <Text style={styles.period}>
                    {formatDateLocale(edu.start_date, isKo)} -{" "}
                    {formatDateLocale(edu.end_date, isKo)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {isKo ? "보유 기술" : "Core Competencies"}
              </Text>
              <View style={styles.skillContainer}>
                {skills.map((skill, i) => (
                  // @ts-ignore
                  <Text key={i} style={styles.skillBadge}>
                    {skill.name_target || skill.name_source || skill.name}
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
              <Text style={styles.sectionTitle}>
                {isKo ? "추가 정보" : "Additional Information"}
              </Text>

              {certifications.length > 0 && (
                <View style={{ marginBottom: 8 }}>
                  <Text
                    style={{
                      fontSize: 10.5,
                      fontWeight: "bold",
                      marginBottom: 4,
                    }}
                  >
                    {isKo ? "자격증" : "Certifications"}
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
                      • {isKo ? item.name_source : item.name_target}{" "}
                      {item.date
                        ? `(${formatDateLocale(item.date, isKo)})`
                        : ""}
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
                    {isKo ? "수상 경력" : "Awards"}
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
                      • {isKo ? item.name_source : item.name_target}
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
                    {isKo ? "언어" : "Languages"}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    {languages.map((item: any, i: number) => (
                      // @ts-ignore
                      <Text key={i} style={{ fontSize: 10, color: "#334155" }}>
                        • {isKo ? item.name_source : item.name_target}
                        {(isKo
                          ? item.description_source
                          : item.description_target) &&
                          ` (${isKo ? item.description_source : item.description_target})`}
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
