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

interface ModernPdfProps {
  personalInfo?: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
}

export const ModernPdf = ({
  personalInfo,
  experiences = [],
  educations = [],
  skills = [],
}: ModernPdfProps) => {
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
            {personalInfo?.phone && (
              <>
                <Text>•</Text>
                <Text>{personalInfo.phone}</Text>
              </>
            )}
            {personalInfo?.links?.map((link: any, i: number) => (
              // @ts-ignore
              <View
                key={i}
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text>•</Text>
                <Link src={link.url} style={styles.linkText}>
                  <Text style={{ color: "#374151", fontWeight: "bold" }}>
                    {link.label}:{" "}
                  </Text>
                  {link.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </Link>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleBar} />
            <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
          </View>
          <Text style={styles.summaryText}>
            Results-driven Frontend Developer with 4+ years of experience in
            building responsive web applications. Proven track record of
            improving user experience and team productivity through innovative
            solutions.
          </Text>
        </View>

        {/* Experience */}
        {experiences.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleBar} />
              <Text style={styles.sectionTitle}>WORK EXPERIENCE</Text>
            </View>
            <View style={styles.expContainer}>
              {experiences.map((exp) => (
                // @ts-ignore
                <View key={exp.id}>
                  <View style={styles.expHeader}>
                    <View>
                      <Text style={styles.companyName}>{exp.companyEn}</Text>
                      <Text style={styles.position}>{exp.positionEn}</Text>
                    </View>
                    <Text style={styles.period}>{exp.period}</Text>
                  </View>
                  <View style={styles.bulletList}>
                    {exp.bulletsEn?.map((bullet: string, idx: number) => (
                      // @ts-ignore
                      <View key={idx} style={styles.bulletItem}>
                        <View style={styles.bulletIconContainer}>
                          <Svg width={7} height={7} viewBox="0 0 24 24">
                            <Path d="M8 5v14l11-7z" fill="#2563eb" />
                          </Svg>
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
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleBar} />
              <Text style={styles.sectionTitle}>TECHNICAL SKILLS</Text>
            </View>
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
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleBar} />
              <Text style={styles.sectionTitle}>EDUCATION</Text>
            </View>
            <View style={{ gap: 12 }}>
              {educations.map((edu) => (
                // @ts-ignore
                <View key={edu.id} style={styles.eduItem}>
                  <View>
                    <Text style={styles.companyName}>
                      {edu.school_name_en || edu.school_name}
                    </Text>
                    <Text
                      style={{ fontSize: 10.5, color: "#4b5563", marginTop: 2 }}
                    >
                      {edu.degree_en || edu.degree}, {edu.major_en || edu.major}
                    </Text>
                  </View>
                  <Text style={styles.period}>
                    {edu.start_date} - {edu.end_date}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};
