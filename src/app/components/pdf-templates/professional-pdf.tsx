import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Svg,
  Path,
} from "@react-pdf/renderer";
import { registerFonts } from "./modern-pdf";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "NotoSansKR",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#1f2937", // gray-800
    flexDirection: "row", // 2-column layout
  },
  leftColumn: {
    width: "32%",
    paddingRight: 15,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb", // gray-200
  },
  rightColumn: {
    width: "68%",
    paddingLeft: 15,
  },
  // Header (Top of right column usually, or across both?
  // For standard 2-col professional, name/title usually top.
  // Let's put Name/Title atop the Right Column or have a full width header?
  // User requested "Sidebar" for left. Let's do Sidebar (Left) + Main (Right).
  // Name usually goes in Main or Sidebar. Let's put Name in Main for impact.

  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827", // gray-900
    marginBottom: 4,
    lineHeight: 1.2,
  },
  jobTitle: {
    fontSize: 14,
    color: "#2563eb", // blue-600
    marginBottom: 16,
    fontWeight: "medium",
  },

  // Section Styles
  section: {
    marginBottom: 20,
  },
  sidebarSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    paddingBottom: 2,
  },
  sidebarTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937", // blue-600
    paddingBottom: 2,
  },

  // Contact Info (Sidebar)
  contactItem: {
    marginBottom: 6,
    fontSize: 9,
    color: "#4b5563", // gray-600
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },

  // Content Text
  text: {
    fontSize: 10,
    color: "#374151", // gray-700
    marginBottom: 2,
  },

  // Experience
  expItem: {
    marginBottom: 12,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  companyName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  position: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4b5563",
  },
  period: {
    fontSize: 9,
    color: "#6b7280",
  },
  // Bullets
  bulletList: {
    marginLeft: 0,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bulletPoint: {
    width: 10,
    fontSize: 10,
    color: "#2563eb",
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: "#374151",
    lineHeight: 1.4,
  },

  // Skills (Sidebar)
  skillItem: {
    marginBottom: 4,
    fontSize: 9.5,
    color: "#374151",
  },

  // Education (Sidebar or Main? Usually Sidebar in 2-col if space permits, else Main.
  // Let's put Education in Sidebar usually for Professional templates)
  eduItem: {
    marginBottom: 10,
  },
  schoolName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  degree: {
    fontSize: 9,
    color: "#4b5563",
    marginTop: 1,
  },
  eduDate: {
    fontSize: 8.5,
    color: "#9ca3af",
    marginTop: 1,
  },
});

// Helper to format date
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

interface ProfessionalPdfProps {
  personalInfo?: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  additionalItems?: any[];
}

export const ProfessionalPdf = ({
  personalInfo,
  experiences = [],
  educations = [],
  skills = [],
  additionalItems = [],
}: ProfessionalPdfProps) => {
  const validExperiences = experiences.filter(
    (e) => e.company?.trim() || e.companyEn?.trim()
  );
  const validEducations = educations.filter(
    (e) => e.school_name?.trim() || e.school_name_en?.trim()
  );
  const validSkills = skills.filter((s) => s.name?.trim());

  const certifications = additionalItems.filter(
    (i) => i.type === "CERTIFICATION"
  );
  const awards = additionalItems.filter((i) => i.type === "AWARD");
  const languages = additionalItems.filter((i) => i.type === "LANGUAGE");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Left Column (Sidebar) */}
        <View style={styles.leftColumn}>
          {/* Contact Info (If sidebar based, putting contact here is good) */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>Contact</Text>
            {personalInfo?.email && (
              <Text style={styles.contactItem}>{personalInfo.email}</Text>
            )}
            {personalInfo?.phone && (
              <Text style={styles.contactItem}>{personalInfo.phone}</Text>
            )}
            {personalInfo?.links?.map((link: any, i: number) =>
              link.url ? (
                // @ts-ignore
                <View key={i} style={styles.contactItem}>
                  <Link src={link.url} style={styles.link}>
                    {link.label || "Link"}
                  </Link>
                </View>
              ) : null
            )}
          </View>

          {/* Education */}
          {validEducations.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Education</Text>
              {validEducations.map((edu, i) => (
                // @ts-ignore
                <View key={i} style={styles.eduItem}>
                  <Text style={styles.schoolName}>
                    {edu.school_name_en || edu.school_name}
                  </Text>
                  <Text style={styles.degree}>
                    {edu.degree_en || edu.degree}
                    {(edu.degree_en || edu.degree) &&
                    (edu.major_en || edu.major)
                      ? ", "
                      : ""}
                    {edu.major_en || edu.major}
                  </Text>
                  <Text style={styles.eduDate}>
                    {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Skills */}
          {validSkills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Skills</Text>
              {validSkills.map((skill, i) => (
                // @ts-ignore
                <Text key={i} style={styles.skillItem}>
                  • {skill.name}
                </Text>
              ))}
            </View>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Languages</Text>
              {languages.map((lang: any, i: number) => (
                // @ts-ignore
                <View key={i} style={{ marginBottom: 4 }}>
                  <Text
                    style={{
                      fontSize: 9.5,
                      color: "#374151",
                      fontWeight: "bold",
                    }}
                  >
                    {lang.name_en || lang.name}
                  </Text>
                  {(lang.description_en || lang.description) && (
                    <Text style={{ fontSize: 8.5, color: "#6b7280" }}>
                      {lang.description_en || lang.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Certifications (Small ones) */}
          {certifications.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Certifications</Text>
              {certifications.map((cert: any, i: number) => (
                // @ts-ignore
                <View key={i} style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 9, color: "#374151" }}>
                    {cert.name_en || cert.name}
                  </Text>
                  <Text style={{ fontSize: 8, color: "#9ca3af" }}>
                    {formatDate(cert.date)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Right Column (Main) */}
        <View style={styles.rightColumn}>
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.name}>
              {personalInfo?.name_en || personalInfo?.name_kr || "Name"}
            </Text>
            {/* Use most recent role as title or just keep it simple */}
            {validExperiences[0]?.positionEn && (
              <Text style={styles.jobTitle}>
                {validExperiences[0].positionEn}
              </Text>
            )}
          </View>

          {/* Summary */}
          {personalInfo?.summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Summary</Text>
              <Text
                style={{
                  ...styles.text,
                  lineHeight: 1.5,
                  textAlign: "justify",
                }}
              >
                {personalInfo.summary}
              </Text>
            </View>
          )}

          {/* Experience */}
          {validExperiences.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Work Experience</Text>
              {validExperiences.map((exp, i) => (
                // @ts-ignore
                <View key={i} style={styles.expItem}>
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
                      <View key={idx} style={styles.bulletItem}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Awards (Main body usually) */}
          {awards.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Honors & Awards</Text>
              {awards.map((award: any, i: number) => (
                // @ts-ignore
                <View key={i} style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                    {award.name_en || award.name}
                  </Text>
                  <Text style={{ fontSize: 9, color: "#4b5563" }}>
                    {award.description_en || award.description}
                    {award.date ? ` | ${formatDate(award.date)}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
