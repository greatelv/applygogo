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
}

export const ClassicPdf = ({
  personalInfo,
  experiences = [],
  educations = [],
  skills = [],
  additionalItems = [],
}: ClassicPdfProps) => {
  // Filter out empty items first
  const validExperiences = experiences.filter(
    (exp) => exp.company?.trim() || exp.companyEn?.trim()
  );
  const validEducations = educations.filter(
    (edu) => edu.school_name?.trim() || edu.school_name_en?.trim()
  );
  const validItems = additionalItems.filter(
    (i) => i.name_kr?.trim() || i.name_en?.trim()
  );
  const certifications = validItems.filter((i) => i.type === "CERTIFICATION");
  const awards = validItems.filter((i) => i.type === "AWARD");
  const languages = validItems.filter((i) => i.type === "LANGUAGE");
  const others = validItems.filter(
    (i) => !["CERTIFICATION", "AWARD", "LANGUAGE"].includes(i.type)
  );
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
        {personalInfo?.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {validExperiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROFESSIONAL EXPERIENCE</Text>
            <View style={styles.expContainer}>
              {validExperiences.map((exp) => (
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
        {validEducations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            <View style={styles.eduContainer}>
              {validEducations.map((edu) => (
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
                  {certifications.map((cert: any, i: number) => {
                    const name = cert.name_en || cert.name;
                    const desc = cert.description_en || cert.description;
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
                    Awards
                  </Text>
                  {awards.map((award: any, i: number) => {
                    const name = award.name_en || award.name;
                    const desc = award.description_en || award.description;
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
                    Languages
                  </Text>
                  {languages.map((lang: any, i: number) => {
                    const name = lang.name_en || lang.name;
                    const desc = lang.description_en || lang.description;
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
