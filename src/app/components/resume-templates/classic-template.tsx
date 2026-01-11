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

interface ClassicTemplateProps {
  personalInfo?: PersonalInfo;
  experiences: Experience[];
  educations?: Education[];
  skills?: Skill[];
  additionalItems?: any[];
}

export function ClassicTemplate({
  personalInfo,
  experiences,
  educations = [],
  skills = [],
  additionalItems = [],
}: ClassicTemplateProps) {
  const certifications = additionalItems.filter(
    (i) => i.type === "CERTIFICATION"
  );
  const awards = additionalItems.filter((i) => i.type === "AWARD");
  const languages = additionalItems.filter((i) => i.type === "LANGUAGE");
  const others = additionalItems.filter(
    (i) => !["CERTIFICATION", "AWARD", "LANGUAGE"].includes(i.type)
  );
  return (
    <div className="bg-white text-black p-8 min-h-[800px] font-serif">
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-2 border-gray-800">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 tracking-wide uppercase">
          {personalInfo?.name_en || personalInfo?.name_kr || "이름 없음"}
        </h1>
        {/* <p className="text-lg text-gray-700 mb-2">Frontend Developer</p> */}
        <div className="text-sm text-gray-600 flex justify-center flex-wrap gap-2">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && (
            <>
              <span>|</span>
              <span>{personalInfo.phone}</span>
            </>
          )}
          {personalInfo?.links
            ?.filter((link) => link.label && link.url)
            .map((link, i) => (
              <span key={i} className="flex gap-2">
                <span>|</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  <span className="font-semibold">{link.label}:</span>{" "}
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
        <div className="mb-6">
          <h2 className="text-base font-bold mb-2 text-gray-900 tracking-wider border-b border-gray-300 pb-1">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-sm text-gray-800 leading-relaxed text-justify">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold mb-3 text-gray-900 tracking-wider border-b border-gray-300 pb-1">
            PROFESSIONAL EXPERIENCE
          </h2>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="mb-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-gray-900">{exp.companyEn}</h3>
                    <span className="text-xs text-gray-600 italic">
                      {formatDate(exp.period.split(" - ")[0])} -{" "}
                      {formatDate(exp.period.split(" - ")[1])}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 italic">
                    {exp.positionEn}
                  </p>
                </div>
                <ul className="space-y-1">
                  {exp.bulletsEn.map((bullet, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-800 flex gap-2 leading-relaxed"
                    >
                      <span className="flex-shrink-0">•</span>
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
        <div className="mb-6">
          <h2 className="text-base font-bold mb-2 text-gray-900 tracking-wider border-b border-gray-300 pb-1">
            TECHNICAL COMPETENCIES
          </h2>
          <div className="text-sm text-gray-800">
            <p>
              <span className="font-semibold">Skills:</span>{" "}
              {skills.map((s) => s.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Education */}
      {educations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold mb-2 text-gray-900 tracking-wider border-b border-gray-300 pb-1">
            EDUCATION
          </h2>
          <div className="space-y-3">
            {educations.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-bold text-gray-900">
                    {edu.school_name_en || edu.school_name}
                  </h3>
                  {((edu.degree_en && edu.degree_en !== "-") ||
                    (edu.degree && edu.degree !== "-") ||
                    (edu.major_en && edu.major_en !== "-") ||
                    (edu.major && edu.major !== "-")) && (
                    <p className="text-sm text-gray-700 italic">
                      {edu.degree_en || edu.degree}
                      {(edu.degree_en || edu.degree) &&
                        (edu.major_en || edu.major) &&
                        ", "}
                      {edu.major_en || edu.major}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-600 italic">
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
          <h2 className="text-base font-bold mb-2 text-gray-900 tracking-wider border-b border-gray-300 pb-1">
            ADDITIONAL INFORMATION
          </h2>
          <div className="space-y-3 text-sm text-gray-800">
            {certifications.length > 0 && (
              <div>
                <span className="font-semibold">Certifications: </span>
                {certifications.map((cert, i) => (
                  <span key={cert.id}>
                    {i > 0 && ", "}
                    {cert.name_en || cert.name}
                    {(cert.description_en || cert.description) &&
                      ` (${cert.description_en || cert.description})`}
                    {cert.date && ` - ${formatDate(cert.date)}`}
                  </span>
                ))}
              </div>
            )}
            {awards.length > 0 && (
              <div>
                <span className="font-semibold">Awards: </span>
                {awards.map((award, i) => (
                  <span key={award.id}>
                    {i > 0 && ", "}
                    {award.name_en || award.name}
                    {(award.description_en || award.description) &&
                      ` (${award.description_en || award.description})`}
                    {award.date && ` - ${formatDate(award.date)}`}
                  </span>
                ))}
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <span className="font-semibold">Languages: </span>
                {languages.map((lang, i) => (
                  <span key={lang.id}>
                    {i > 0 && ", "}
                    {lang.name_en || lang.name}{" "}
                    {(lang.description_en || lang.description) &&
                      `(${lang.description_en || lang.description})`}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
