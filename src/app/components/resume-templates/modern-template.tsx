// Helper to format date YYYY-MM -> MMM YYYY
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  if (dateStr.toLowerCase() === "present" || dateStr.toLowerCase() === "현재")
    return "Present";

  try {
    const [year, month] = dateStr.split(/[-.]/);
    if (!year || !month) return dateStr;
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  bullets: string[];
  companyEn: string;
  positionEn: string;
  bulletsEn: string[];
}

interface Education {
  id: string;
  school_name: string;
  school_name_en?: string;
  major: string;
  major_en?: string;
  degree: string;
  degree_en?: string;
  start_date: string;
  end_date: string;
}

interface Skill {
  id: string;
  name: string;
  level?: string | null;
}

interface Certification {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
}

interface Award {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
}

interface Language {
  id: string;
  name: string;
  level?: string;
  score?: string;
}

interface PersonalInfo {
  name_kr?: string;
  name_en?: string;
  email?: string;
  phone?: string;
  links?: { label: string; url: string }[];
  summary?: string;
}

interface ModernTemplateProps {
  personalInfo?: PersonalInfo;
  experiences: Experience[];
  educations?: Education[];
  skills?: Skill[];
  additionalItems?: any[];
}

export function ModernTemplate({
  personalInfo,
  experiences,
  educations = [],
  skills = [],
  additionalItems = [],
}: ModernTemplateProps) {
  const certifications = additionalItems.filter(
    (i) => i.type === "CERTIFICATION"
  );
  const awards = additionalItems.filter((i) => i.type === "AWARD");
  const languages = additionalItems.filter((i) => i.type === "LANGUAGE");
  const others = additionalItems.filter(
    (i) => !["CERTIFICATION", "AWARD", "LANGUAGE"].includes(i.type)
  );
  return (
    <div className="bg-white text-black p-8 min-h-[800px] font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          {personalInfo?.name_en || personalInfo?.name_kr || "이름 없음"}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && (
            <>
              <span>•</span>
              <span>{personalInfo.phone}</span>
            </>
          )}
          {personalInfo?.links
            ?.filter((link) => link.label && link.url)
            .map((link, i) => (
              <span key={i} className="flex gap-2">
                <span>•</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  <span className="font-semibold text-gray-700">
                    {link.label}:
                  </span>{" "}
                  {link.url
                    ? link.url.replace(/^https?:\/\//, "").replace(/\/$/, "")
                    : ""}
                </a>
              </span>
            ))}
        </div>
      </div>

      {/* Professional Summary */}
      {personalInfo?.summary && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-600"></div>
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-600"></div>
            WORK EXPERIENCE
          </h2>
          <div className="space-y-5">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{exp.companyEn}</h3>
                    <p className="text-sm text-blue-600 font-medium">
                      {exp.positionEn}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                    {formatDate(exp.period.split(" - ")[0])} -{" "}
                    {formatDate(exp.period.split(" - ")[1])}
                  </span>
                </div>
                <ul className="space-y-1.5 ml-4">
                  {exp.bulletsEn.map((bullet, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-700 flex gap-2"
                    >
                      <span className="text-blue-600 flex-shrink-0">▸</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-600"></div>
            TECHNICAL SKILLS
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {educations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-600"></div>
            EDUCATION
          </h2>
          <div className="space-y-4">
            {educations.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">
                    {edu.school_name_en || edu.school_name}
                  </h3>
                  {((edu.degree_en && edu.degree_en !== "-") ||
                    (edu.degree && edu.degree !== "-") ||
                    (edu.major_en && edu.major_en !== "-") ||
                    (edu.major && edu.major !== "-")) && (
                    <p className="text-sm text-gray-600">
                      {edu.degree_en || edu.degree}
                      {(edu.degree_en || edu.degree) &&
                        (edu.major_en || edu.major) &&
                        ", "}
                      {edu.major_en || edu.major}
                    </p>
                  )}
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                  {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications & Awards & Languages */}
      {(certifications.length > 0 ||
        awards.length > 0 ||
        languages.length > 0) && (
        <div>
          <h2 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-600"></div>
            ADDITIONAL INFORMATION
          </h2>
          <div className="space-y-4">
            {certifications.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">
                  Certifications
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {certifications.map((cert) => (
                    <li key={cert.id}>
                      {cert.name_en || cert.name}{" "}
                      {cert.description_en || cert.description
                        ? `| ${cert.description_en || cert.description}`
                        : ""}{" "}
                      {cert.date ? `(${formatDate(cert.date)})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {awards.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Awards</h3>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {awards.map((award) => (
                    <li key={award.id}>
                      {award.name_en || award.name}{" "}
                      {award.description_en || award.description
                        ? `| ${award.description_en || award.description}`
                        : ""}{" "}
                      {award.date ? `(${formatDate(award.date)})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                  {languages.map((lang, index) => (
                    <span key={lang.id} className="flex items-center">
                      {index > 0 && (
                        <span className="mr-4 text-gray-300">|</span>
                      )}
                      <span className="font-medium mr-1">
                        {lang.name_en || lang.name}
                      </span>
                      {(lang.description_en || lang.description) && (
                        <span className="text-gray-500">
                          ({lang.description_en || lang.description})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
