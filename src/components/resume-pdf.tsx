import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
// Define schema for the data passed to PDF (decoupled from Prisma for flexibility)
export type ResumePDFData = {
  title: string;
  targetRole: string | null;
  workExperiences: {
    companyNameKr: string;
    companyNameEn: string | null;
    roleKr: string;
    roleEn: string | null;
    startDate: string;
    endDate: string;
    bulletsEn: unknown; // Handle JSON or string[]
  }[];
  educations: {
    schoolName: string;
    major: string;
    degree: string;
    startDate: string;
    endDate: string;
  }[];
  skills: {
    name: string;
    level: string | null;
  }[];
  user: {
    name: string | null;
    email: string | null;
    phoneNumber?: string | null;
  };
};

/* 
  Figma Design Token Implementation:
  - Primary Color: #030213 (Deep Navy)
  - Secondary/Text: #4B5563 (Gray-600 equivalent) for body, #111827 (Gray-900) for headings
  - Spacing: 8px grid based
*/
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#374151", // Gray-700
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#030213", // Deep Navy
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#030213", // Deep Navy
    marginBottom: 8,
    fontWeight: "medium",
  },
  contactRow: {
    flexDirection: "row",
    gap: 12,
  },
  contactItem: {
    fontSize: 10,
    color: "#6B7280", // Gray-500
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#030213",
    borderBottomWidth: 1,
    borderBottomColor: "#030213",
    paddingBottom: 4,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  // Experience Item
  expItem: {
    marginBottom: 12,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  companyName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  expRole: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#030213",
  },
  date: {
    fontSize: 9,
    color: "#6B7280",
    textAlign: "right",
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: "#4B5563",
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: "#4B5563",
  },
  // Skills
  skillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillItem: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 9,
    color: "#374151",
  },
});

interface ResumePDFProps {
  data: ResumePDFData;
}

export const ResumePDF = ({ data }: ResumePDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.user.name || "Candidate Name"}</Text>
          <Text style={styles.role}>{data.targetRole || "Target Role"}</Text>
          <View style={styles.contactRow}>
            <Text style={styles.contactItem}>{data.user.email}</Text>
            {data.user.phoneNumber && (
              <Text style={styles.contactItem}>• {data.user.phoneNumber}</Text>
            )}
          </View>
        </View>

        {/* Experience Section */}
        {data.workExperiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.workExperiences.map((exp, index) => (
              <View key={index} style={styles.expItem}>
                <View style={styles.expHeader}>
                  <Text style={styles.companyName}>
                    {exp.companyNameEn || exp.companyNameKr}
                  </Text>
                  <Text style={styles.date}>
                    {exp.startDate} - {exp.endDate}
                  </Text>
                </View>
                <Text style={styles.expRole}>{exp.roleEn || exp.roleKr}</Text>

                {/* Bullets */}
                {(exp.bulletsEn && Array.isArray(exp.bulletsEn)
                  ? (exp.bulletsEn as string[])
                  : []
                ).map((bullet, idx) => (
                  <View key={idx} style={styles.bulletPoint}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education Section */}
        {data.educations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.educations.map((edu, index) => (
              <View key={index} style={styles.expItem}>
                <View style={styles.expHeader}>
                  <Text style={styles.companyName}>{edu.schoolName}</Text>
                  <Text style={styles.date}>
                    {edu.startDate} - {edu.endDate}
                  </Text>
                </View>
                <Text style={styles.expRole}>
                  {edu.degree} in {edu.major}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills Section */}
        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillContainer}>
              {data.skills.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>
                  {skill.name} {skill.level ? `(${skill.level})` : ""}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};
