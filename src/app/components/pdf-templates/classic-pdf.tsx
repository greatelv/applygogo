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

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 30,
    paddingRight: 30,
    fontFamily: "NotoSerifKR",
    fontSize: 9.5, // Restored to 9.5
    color: "#000000",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#1f2937",
    textAlign: "center",
  },
  name: {
    fontSize: 24, // Increased to match text-3xl (30px) ~ 22.5pt -> 24pt
    fontWeight: "bold",
    marginBottom: 8,
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
    marginBottom: 10,
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

interface ClassicPdfProps {
  personalInfo?: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  additionalItems?: any[];
  locale?: AppLocale;
}

export const ClassicPdf = ({
  personalInfo,
  experiences = [],
  educations = [],
  skills = [],
  additionalItems = [],
  locale = "ko",
}: ClassicPdfProps) => {
  // Use centralized logic: ko locale → English (_target), en/ja locale → Korean (_source)
  const useTarget = shouldUseTargetData(locale);
  // Filter out empty items first
  const validExperiences = experiences.filter(
    (exp) => exp.company_name_source?.trim() || exp.company_name_target?.trim(),
  );
  const validEducations = educations.filter(
    (edu) => edu.school_name_source?.trim() || edu.school_name_target?.trim(),
  );
  const validItems = additionalItems.filter(
    (i) => i.name_source?.trim() || i.name_target?.trim(),
  );
  const certifications = validItems.filter((i) => i.type === "CERTIFICATION");
  const awards = validItems.filter((i) => i.type === "AWARD");
  const languages = validItems.filter((i) => i.type === "LANGUAGE");
  const others = validItems.filter(
    (i) => !["CERTIFICATION", "AWARD", "LANGUAGE"].includes(i.type),
  );
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {(useTarget
              ? personalInfo?.name_target
              : personalInfo?.name_source) || "이름 없음"}
          </Text>
          <View style={styles.contactContainer}>
            {personalInfo?.email && <Text>{personalInfo.email}</Text>}
            {personalInfo?.phone && (
              <View style={styles.contactItem}>
                <Text style={styles.separator}>|</Text>
                <Text>{personalInfo.phone}</Text>
              </View>
            )}
            {personalInfo?.links
              ?.filter((link: any) => link.label && link.url)
              .map((link: any, i: number) => (
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
        {(useTarget
          ? personalInfo?.summary_target
          : personalInfo?.summary_source) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {useTarget ? "PROFESSIONAL SUMMARY" : "핵심 요약"}
            </Text>
            <Text style={styles.summaryText}>
              {useTarget
                ? personalInfo.summary_target
                : personalInfo.summary_source}
            </Text>
          </View>
        )}

        {/* Experience */}
        {validExperiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {useTarget ? "PROFESSIONAL EXPERIENCE" : "경력 사항"}
            </Text>
            <View style={styles.expContainer}>
              {validExperiences.map((exp) => (
                // @ts-ignore
                <View key={exp.id}>
                  <View style={styles.expItemHeader}>
                    <View style={styles.expRow}>
                      <Text style={styles.companyName}>
                        {useTarget
                          ? exp.company_name_target
                          : exp.company_name_source}
                      </Text>
                      <Text style={styles.period}>
                        {formatDate(exp.period.split(" - ")[0])} -{" "}
                        {formatDate(exp.period.split(" - ")[1])}
                      </Text>
                    </View>
                    <Text style={styles.position}>
                      {useTarget ? exp.role_target : exp.role_source}
                    </Text>
                  </View>
                  <View style={styles.bulletList}>
                    {(useTarget ? exp.bullets_target : exp.bullets_source)?.map(
                      (bullet: string, idx: number) => (
                        // @ts-ignore
                        <View key={idx} style={styles.bulletItem}>
                          <View style={styles.bulletIconContainer}>
                            <Text style={styles.bulletPoint}>•</Text>
                          </View>
                          <Text style={styles.bulletText}>{bullet}</Text>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {useTarget ? "TECHNICAL COMPETENCIES" : "보유 기술"}
            </Text>
            <View>
              <Text style={styles.skillText}>
                <Text style={{ fontWeight: "bold" }}>Skills: </Text>
                {skills
                  .map((s) => s.name_target || s.name_source || s.name)
                  .join(", ")}
              </Text>
            </View>
          </View>
        )}

        {/* Education */}
        {validEducations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {useTarget ? "EDUCATION" : "학력 사항"}
            </Text>
            <View style={styles.eduContainer}>
              {validEducations.map((edu) => (
                // @ts-ignore
                <View key={edu.id} style={styles.eduItem}>
                  <View>
                    <Text style={styles.companyName}>
                      {useTarget
                        ? edu.school_name_target
                        : edu.school_name_source}
                    </Text>
                    <Text style={styles.position}>
                      {useTarget ? edu.degree_target : edu.degree_source},{" "}
                      {useTarget ? edu.major_target : edu.major_source}
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
            <Text style={styles.sectionTitle}>
              {useTarget ? "ADDITIONAL INFORMATION" : "추가 정보"}
            </Text>
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
                    {useTarget ? "Certifications" : "자격증"}
                  </Text>
                  {certifications.map((cert: any, i: number) => {
                    const name = useTarget
                      ? cert.name_target
                      : cert.name_source;
                    const desc = useTarget
                      ? cert.description_target
                      : cert.description_source;
                    const date = formatDate(cert.date);
                    return (
                      <React.Fragment key={i}>
                        <Text style={styles.skillText}>
                          • {name}
                          {desc && desc !== "-" ? ` | ${desc}` : ""}
                          {date ? ` (${date})` : ""}
                        </Text>
                      </React.Fragment>
                    );
                  })}
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
                    {useTarget ? "Awards" : "수상 경력"}
                  </Text>
                  {awards.map((award: any, i: number) => {
                    const name = useTarget
                      ? award.name_target
                      : award.name_source;
                    const desc = useTarget
                      ? award.description_target
                      : award.description_source;
                    const date = formatDate(award.date);
                    return (
                      <React.Fragment key={i}>
                        <Text style={styles.skillText}>
                          • {name}
                          {desc && desc !== "-" ? ` | ${desc}` : ""}
                          {date ? ` (${date})` : ""}
                        </Text>
                      </React.Fragment>
                    );
                  })}
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
                    {useTarget ? "Languages" : "외국어"}
                  </Text>
                  {languages.map((lang: any, i: number) => {
                    const name = useTarget
                      ? lang.name_target
                      : lang.name_source;
                    const desc = useTarget
                      ? lang.description_target
                      : lang.description_source;
                    return (
                      <React.Fragment key={i}>
                        <Text style={styles.skillText}>
                          • {name}
                          {desc && desc !== "-" ? ` (${desc})` : ""}
                        </Text>
                      </React.Fragment>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};
