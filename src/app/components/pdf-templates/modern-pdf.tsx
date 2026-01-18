import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
  Svg,
  Path,
} from "@react-pdf/renderer";

// Export a function to register fonts with dynamic base URL
export const registerFonts = () => {
  let baseUrl = "";
  if (typeof window !== "undefined") {
    baseUrl = window.location.origin;
  } else if (typeof process !== "undefined" && process.cwd) {
    baseUrl = process.cwd() + "/public";
  }

  Font.register({
    family: "NotoSansKR",
    fonts: [
      { src: `${baseUrl}/fonts/NotoSansKR-Light.ttf`, fontWeight: 300 },
      { src: `${baseUrl}/fonts/NotoSansKR-Regular.ttf`, fontWeight: 400 },
      { src: `${baseUrl}/fonts/NotoSansKR-Bold.ttf`, fontWeight: 700 },
    ],
  });

  Font.register({
    family: "NotoSerifKR",
    fonts: [
      { src: `${baseUrl}/fonts/NotoSerifKR-Regular.ttf` },
      { src: `${baseUrl}/fonts/NotoSerifKR-Bold.ttf`, fontWeight: "bold" },
    ],
  });
};

const styles = StyleSheet.create({
  page: {
    padding: 24, // p-8 (32px) -> ~24pt
    fontFamily: "NotoSansKR",
    fontSize: 10.5, // text-sm (14px) -> ~10.5pt
    lineHeight: 1.625, // leading-relaxed
    color: "#000000",
  },
  header: {
    marginBottom: 24, // mb-8 (32px) -> 24pt
  },
  name: {
    fontSize: 27, // text-4xl
    fontWeight: "bold",
    marginBottom: 12, // Increased from 6pt to 12pt to prevent overlap
    color: "#111827",
    lineHeight: 1.2, // Increased line height slightly
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12, // gap-4 (16px) -> 12pt
    fontSize: 10.5, // text-sm
    color: "#4b5563", // text-gray-600
    alignItems: "center",
  },
  section: {
    marginBottom: 24, // mb-8 (32px) -> 24pt
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9, // mb-3 (12px) -> 9pt
    gap: 6, // gap-2 (8px) -> 6pt
  },
  sectionTitleBar: {
    width: 24, // w-8 (32px) -> 24pt
    height: 1.5, // h-0.5 (2px) -> 1.5pt
    backgroundColor: "#2563eb", // bg-blue-600
    marginTop: 3, // Visually center with text
  },
  sectionTitle: {
    fontSize: 13.5, // text-lg (18px) -> 13.5pt
    fontWeight: "bold",
    color: "#111827", // text-gray-900
  },
  summaryText: {
    fontSize: 10.5, // text-sm
    color: "#374151", // text-gray-700
    lineHeight: 1.625, // leading-relaxed
  },
  expItem: {
    marginBottom: 15, // space-y-5 (20px) but inside map... let's set item spacing
  },
  expContainer: {
    // to simulate space-y-5
    gap: 15, // 20px -> 15pt
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6, // mb-2 (8px) -> 6pt
  },
  companyName: {
    fontSize: 12, // Base size (16px) -> 12pt (h3 default)
    fontWeight: "bold",
    color: "#111827", // text-gray-900
    lineHeight: 1.25,
  },
  position: {
    fontSize: 10.5, // text-sm
    fontWeight: "medium",
    color: "#2563eb", // text-blue-600
    marginTop: 2, // Slight adjustment for alignment
  },
  period: {
    fontSize: 10.5, // text-sm
    color: "#6b7280", // text-gray-500
    marginLeft: 12, // ml-4 (16px) -> 12pt
  },
  bulletList: {
    marginLeft: 12, // ml-4 (16px) -> 12pt
    gap: 4.5, // space-y-1.5 (6px) -> 4.5pt
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6, // gap-2 -> 6pt
  },
  bulletIconContainer: {
    width: 10,
    height: 13.65, // Match text line height (fontSize 10.5 * lineHeight 1.3)
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bulletText: {
    flex: 1,
    fontSize: 10.5, // text-sm
    color: "#374151", // text-gray-700
    lineHeight: 1.3,
    marginTop: -1, // Shift text up more to perfectly align with bullet icon
  },
  skillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6, // gap-2 (8px) -> 6pt
  },
  skillBadge: {
    backgroundColor: "#f3f4f6", // bg-gray-100
    paddingVertical: 3, // py-1 (4px) -> 3pt
    paddingHorizontal: 9, // px-3 (12px) -> 9pt
    borderRadius: 9999, // rounded-full
    fontSize: 10.5, // text-sm
    fontWeight: "medium",
    color: "#374151", // text-gray-700
  },
  eduItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12, // space-y-4
  },
  linkText: {
    fontSize: 10.5,
    color: "#2563eb", // blue-600
    textDecoration: "none",
  },
  linkLabel: {
    fontWeight: "bold", // font-semibold
    color: "#374151", // text-gray-700
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

interface ModernPdfProps {
  personalInfo?: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  additionalItems?: any[];
  locale?: string;
}

export const ModernPdf = ({
  personalInfo,
  experiences = [],
  educations = [],
  skills = [],
  additionalItems = [],
  locale = "ko",
}: ModernPdfProps) => {
  const isKo = locale === "ko";

  // Filter out empty items first
  const validExperiences = experiences.filter(
    (exp) => exp.company?.trim() || exp.companyEn?.trim(),
  );
  const validEducations = educations.filter(
    (edu) => edu.school_name?.trim() || edu.school_name_en?.trim(),
  );
  const validItems = additionalItems.filter(
    (i) => i.name_kr?.trim() || i.name_en?.trim(),
  );
  const certifications = validItems.filter((i) => i.type === "CERTIFICATION");
  const awards = validItems.filter((i) => i.type === "AWARD");
  const languages = validItems.filter((i) => i.type === "LANGUAGE");

  const formatDateLocale = (dateStr?: string) => {
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {(isKo ? personalInfo?.name_kr : personalInfo?.name_en) ||
              personalInfo?.name_en ||
              personalInfo?.name_kr ||
              "이름 없음"}
          </Text>
          <View style={styles.contactRow}>
            {personalInfo?.email && <Text>{personalInfo.email}</Text>}
            {personalInfo?.phone && (
              <>
                <Text>•</Text>
                <Text>{personalInfo.phone}</Text>
              </>
            )}
            {personalInfo?.links
              ?.filter((link: any) => link.label && link.url)
              .map((link: any, i: number) => (
                <React.Fragment key={i}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text>•</Text>
                    <Link src={link.url} style={styles.linkText}>
                      <Text style={{ color: "#374151", fontWeight: "bold" }}>
                        {link.label}:{" "}
                      </Text>
                      {link.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </Link>
                  </View>
                </React.Fragment>
              ))}
          </View>
        </View>

        {/* Summary */}
        {(personalInfo?.summary || personalInfo?.summary_en) && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleBar} />
              <Text style={styles.sectionTitle}>
                {isKo ? "핵심 요약" : "PROFESSIONAL SUMMARY"}
              </Text>
            </View>
            <Text style={styles.summaryText}>
              {(isKo ? personalInfo.summary : personalInfo.summary_en) ||
                personalInfo.summary}
            </Text>
          </View>
        )}

        {/* Experience */}
        {validExperiences.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleBar} />
              <Text style={styles.sectionTitle}>
                {isKo ? "경력 사항" : "WORK EXPERIENCE"}
              </Text>
            </View>
            <View style={styles.expContainer}>
              {validExperiences.map((exp) => (
                <React.Fragment key={exp.id}>
                  <View>
                    <View style={styles.expHeader}>
                      <View>
                        <Text style={styles.companyName}>
                          {(isKo ? exp.company : exp.companyEn) ||
                            exp.companyEn}
                        </Text>
                        <Text style={styles.position}>
                          {(isKo ? exp.position : exp.positionEn) ||
                            exp.positionEn}
                        </Text>
                      </View>
                      <Text style={styles.period}>
                        {formatDateLocale(exp.period.split(" - ")[0])} -{" "}
                        {formatDateLocale(exp.period.split(" - ")[1])}
                      </Text>
                    </View>
                    <View style={styles.bulletList}>
                      {(
                        (isKo ? exp.bullets : exp.bulletsEn) || exp.bulletsEn
                      )?.map((bullet: string, idx: number) => (
                        <React.Fragment key={idx}>
                          <View style={styles.bulletItem}>
                            <View style={styles.bulletIconContainer}>
                              <Svg width={7} height={7} viewBox="0 0 24 24">
                                <Path d="M8 5v14l11-7z" fill="#2563eb" />
                              </Svg>
                            </View>
                            <Text style={styles.bulletText}>{bullet}</Text>
                          </View>
                        </React.Fragment>
                      ))}
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleBar} />
              <Text style={styles.sectionTitle}>
                {isKo ? "보유 기술" : "TECHNICAL SKILLS"}
              </Text>
            </View>
            <View style={styles.skillRow}>
              {skills.map((skill) => (
                <React.Fragment key={skill.id}>
                  <Text style={styles.skillBadge}>{skill.name}</Text>
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Education */}
        {validEducations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleBar} />
              <Text style={styles.sectionTitle}>
                {isKo ? "학력 사항" : "EDUCATION"}
              </Text>
            </View>
            <View style={{ gap: 12 }}>
              {validEducations.map((edu) => (
                <React.Fragment key={edu.id}>
                  <View style={styles.eduItem}>
                    <View>
                      <Text style={styles.companyName}>
                        {(isKo ? edu.school_name : edu.school_name_en) ||
                          edu.school_name_en ||
                          edu.school_name}
                      </Text>
                      {((edu.degree_en && edu.degree_en !== "-") ||
                        (edu.degree && edu.degree !== "-") ||
                        (edu.major_en && edu.major_en !== "-") ||
                        (edu.major && edu.major !== "-")) && (
                        <Text
                          style={{
                            fontSize: 10.5,
                            color: "#4b5563",
                            marginTop: 2,
                          }}
                        >
                          {(isKo ? edu.degree : edu.degree_en) ||
                            edu.degree_en ||
                            edu.degree}
                          {((isKo ? edu.degree : edu.degree_en) ||
                            edu.degree_en ||
                            edu.degree) &&
                            ((isKo ? edu.major : edu.major_en) ||
                              edu.major_en ||
                              edu.major) &&
                            ", "}
                          {(isKo ? edu.major : edu.major_en) ||
                            edu.major_en ||
                            edu.major}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.period}>
                      {formatDateLocale(edu.start_date)} -{" "}
                      {formatDateLocale(edu.end_date)}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Certifications & Awards & Languages */}
        {(certifications.length > 0 ||
          awards.length > 0 ||
          languages.length > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleBar} />
              <Text style={styles.sectionTitle}>
                {isKo ? "추가 정보" : "ADDITIONAL INFORMATION"}
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              {certifications.length > 0 && (
                <View style={{ marginBottom: 4 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 11,
                      marginBottom: 2,
                    }}
                  >
                    {isKo ? "자격증" : "Certifications"}
                  </Text>
                  {certifications.map((cert: any, i: number) => {
                    const name =
                      (isKo ? cert.name : cert.name_en) ||
                      cert.name_en ||
                      cert.name;
                    const desc =
                      (isKo ? cert.description : cert.description_en) ||
                      cert.description_en ||
                      cert.description;
                    const date = formatDateLocale(cert.date);
                    return (
                      <React.Fragment key={i}>
                        <Text style={{ fontSize: 10.5, color: "#374151" }}>
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
                <View style={{ marginBottom: 4 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 11,
                      marginBottom: 2,
                    }}
                  >
                    {isKo ? "수상 경력" : "Awards"}
                  </Text>
                  {awards.map((award: any, i: number) => {
                    const name =
                      (isKo ? award.name : award.name_en) ||
                      award.name_en ||
                      award.name;
                    const desc =
                      (isKo ? award.description : award.description_en) ||
                      award.description_en ||
                      award.description;
                    const date = formatDateLocale(award.date);
                    return (
                      <React.Fragment key={i}>
                        <Text style={{ fontSize: 10.5, color: "#374151" }}>
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
                      fontWeight: "bold",
                      fontSize: 11,
                      marginBottom: 2,
                    }}
                  >
                    {isKo ? "외국어" : "Languages"}
                  </Text>
                  <View
                    style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}
                  >
                    {languages.map((lang: any, i: number) => {
                      const name =
                        (isKo ? lang.name : lang.name_en) ||
                        lang.name_en ||
                        lang.name;
                      const desc =
                        (isKo ? lang.description : lang.description_en) ||
                        lang.description_en ||
                        lang.description;
                      return (
                        <React.Fragment key={i}>
                          <Text style={{ fontSize: 10.5, color: "#374151" }}>
                            • {name}
                            {desc && desc !== "-" ? ` (${desc})` : ""}
                          </Text>
                        </React.Fragment>
                      );
                    })}
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
