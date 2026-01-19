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
    padding: 24, // p-8 (32px) -> ~24pt
    fontFamily: "NotoSansKR",
    fontSize: 10.5, // text-sm
    lineHeight: 1.625, // leading-relaxed
    color: "#000000",
  },
  header: {
    marginBottom: 24, // mb-8
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
    marginBottom: 24, // mb-8
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

interface MinimalPdfProps {
  personalInfo?: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  additionalItems?: any[];
}

export const MinimalPdf = ({
  personalInfo,
  experiences = [],
  educations = [],
  skills = [],
  additionalItems = [],
}: MinimalPdfProps) => {
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
            {personalInfo?.name_target ||
              personalInfo?.name_source ||
              "이름 없음"}
          </Text>
          <View style={styles.contactRow}>
            {personalInfo?.email && <Text>{personalInfo.email}</Text>}
            {personalInfo?.phone && <Text>{personalInfo.phone}</Text>}
            {personalInfo?.links
              ?.filter((link: any) => link.label && link.url)
              .map((link: any, i: number) => (
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
        {(personalInfo?.summary_target || personalInfo?.summary_source) && (
          <View style={styles.section}>
            <Text style={styles.summaryText}>
              {personalInfo.summary_target || personalInfo.summary_source}
            </Text>
          </View>
        )}

        {/* Experience */}
        {validExperiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <View style={styles.expContainer}>
              {validExperiences.map((exp) => (
                // @ts-ignore
                <View key={exp.id}>
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
                        <React.Fragment key={idx}>
                          <Text style={styles.bulletText}>{bullet}</Text>
                        </React.Fragment>
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
            <Text style={styles.sectionTitle}>Skills</Text>
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
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.eduContainer}>
              {validEducations.map((edu) => (
                // @ts-ignore
                <View key={edu.id} style={styles.eduItem}>
                  <View>
                    <Text style={styles.companyName}>
                      {edu.school_name_target || edu.school_name_source}
                    </Text>
                    <Text style={styles.position}>
                      {edu.degree_target || edu.degree_source},{" "}
                      {edu.major_target || edu.major_source}
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
                  {certifications.map((cert: any, i: number) => {
                    const name = cert.name_target || cert.name_source;
                    const desc =
                      cert.description_target || cert.description_source;
                    const date = formatDate(cert.date);
                    return (
                      <React.Fragment key={i}>
                        <Text style={styles.bulletText}>
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
                      fontSize: 10.5,
                      fontWeight: "medium",
                      marginBottom: 2,
                    }}
                  >
                    Awards
                  </Text>
                  {awards.map((award: any, i: number) => {
                    const name = award.name_target || award.name_source;
                    const desc =
                      award.description_target || award.description_source;
                    const date = formatDate(award.date);
                    return (
                      <React.Fragment key={i}>
                        <Text style={styles.bulletText}>
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
                    {languages.map((lang: any, i: number) => {
                      const name = lang.name_target || lang.name_source;
                      const desc =
                        lang.description_target || lang.description_source;
                      return (
                        <React.Fragment key={i}>
                          <Text style={styles.bulletText}>
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
