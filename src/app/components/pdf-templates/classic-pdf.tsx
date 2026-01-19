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
  const isKo = !useTarget;

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
            {(isKo ? personalInfo?.name_source : personalInfo?.name_target) ||
              "이름 없음"}
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
        {(isKo
          ? personalInfo?.summary_source
          : personalInfo?.summary_target) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isKo ? "핵심 요약" : "PROFESSIONAL SUMMARY"}
            </Text>
            <Text style={styles.summaryText}>
              {isKo ? personalInfo.summary_source : personalInfo.summary_target}
            </Text>
          </View>
        )}

        {/* Experience */}
        {validExperiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isKo ? "경력 사항" : "PROFESSIONAL EXPERIENCE"}
            </Text>
            <View style={styles.expContainer}>
              {validExperiences.map((exp) => (
                // @ts-ignore
                <View key={exp.id}>
                  <View style={styles.expItemHeader}>
                    <View style={styles.expRow}>
                      <Text style={styles.companyName}>
                        {isKo
                          ? exp.company_name_source
                          : exp.company_name_target}
                      </Text>
                      <Text style={styles.period}>
                        {formatDateLocale(exp.period.split(" - ")[0], isKo)} -{" "}
                        {formatDateLocale(exp.period.split(" - ")[1], isKo)}
                      </Text>
                    </View>
                    <Text style={styles.position}>
                      {isKo ? exp.role_source : exp.role_target}
                    </Text>
                  </View>
                  <View style={styles.bulletList}>
                    {(isKo ? exp.bullets_source : exp.bullets_target)?.map(
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
              {isKo ? "보유 기술" : "TECHNICAL COMPETENCIES"}
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
              {isKo ? "학력 사항" : "EDUCATION"}
            </Text>
            <View style={styles.eduContainer}>
              {validEducations.map((edu) => (
                // @ts-ignore
                <View key={edu.id} style={styles.eduItem}>
                  <View>
                    <Text style={styles.companyName}>
                      {isKo ? edu.school_name_source : edu.school_name_target}
                    </Text>
                    <Text style={styles.position}>
                      {isKo ? edu.degree_source : edu.degree_target},{" "}
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
          </View>
        )}

        {/* Certifications & Awards & Languages */}
        {(certifications.length > 0 ||
          awards.length > 0 ||
          languages.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isKo ? "추가 정보" : "ADDITIONAL INFORMATION"}
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
                    {isKo ? "자격증" : "Certifications"}
                  </Text>
                  {certifications.map((cert: any, i: number) => {
                    const name = isKo ? cert.name_source : cert.name_target;
                    const desc = isKo
                      ? cert.description_source
                      : cert.description_target;
                    const date = formatDateLocale(cert.date, isKo);
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
                    {isKo ? "수상 경력" : "Awards"}
                  </Text>
                  {awards.map((award: any, i: number) => {
                    const name = isKo ? award.name_source : award.name_target;
                    const desc = isKo
                      ? award.description_source
                      : award.description_target;
                    const date = formatDateLocale(award.date, isKo);
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
                    {isKo ? "언어" : "Languages"}
                  </Text>
                  {languages.map((lang: any, i: number) => {
                    const name = isKo ? lang.name_source : lang.name_target;
                    const desc = isKo
                      ? lang.description_source
                      : lang.description_target;
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
