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
  companyTranslated: string;
  positionTranslated: string;
  bulletsTranslated: string[];
}

interface Education {
  id: string;
  school_name: string;
  school_name_translated?: string;
  major: string;
  major_translated?: string;
  degree: string;
  degree_translated?: string;
  start_date: string;
  end_date: string;
}

interface Skill {
  id: string;
  name: string;
  level?: string | null;
}

interface PersonalInfo {
  name_original?: string;
  name_translated?: string;
  email?: string;
  phone?: string;
  links?: { label: string; url: string }[];
  summary?: string;
}

interface MinimalTemplateProps {
  personalInfo?: PersonalInfo;
  experiences: Experience[];
  educations?: Education[];
  skills?: Skill[];
  additionalItems?: any[];
}

export function MinimalTemplate({
  personalInfo,
  experiences,
  educations = [],
  skills = [],
  additionalItems = [],
}: MinimalTemplateProps) {
  const certifications = additionalItems.filter(
    (i) => i.type === "CERTIFICATION"
  );
  const awards = additionalItems.filter((i) => i.type === "AWARD");
  const languages = additionalItems.filter((i) => i.type === "LANGUAGE");
  // @ts-ignore
  const others = additionalItems.filter(
    (i) => !["CERTIFICATION", "AWARD", "LANGUAGE"].includes(i.type)
  );
  return (
    <div className="bg-white text-black p-8 min-h-full font-sans">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-light mb-1 text-gray-900 tracking-tight">
          {personalInfo?.name_translated ||
            personalInfo?.name_original ||
            "이름 없음"}
        </h1>
        {/* <p className="text-gray-500 text-sm mb-4">Frontend Developer</p> */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {personalInfo?.links
            ?.filter((link) => link.label && link.url)
            .map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-gray-600"
              >
                <span className="font-medium">{link.label}:</span>{" "}
                {link.url
                  ? link.url.replace(/^https?:\/\//, "").replace(/\/$/, "")
                  : ""}
              </a>
            ))}
        </div>
      </div>

      {/* About */}
      {personalInfo?.summary && (
        <div className="mb-10">
          <p className="text-sm text-gray-700 leading-relaxed font-light">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-semibold mb-6 text-gray-400 tracking-widest uppercase">
            Experience
          </h2>
          <div className="space-y-8">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative">
                <div className="flex justify-between items-baseline mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {exp.companyTranslated}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {exp.positionTranslated}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 tabular-nums">
                    {formatDate(exp.period.split(" - ")[0])} -{" "}
                    {formatDate(exp.period.split(" - ")[1])}
                  </span>
                </div>
                <ul className="space-y-2">
                  {exp.bulletsTranslated.map((bullet, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 leading-relaxed font-light"
                    >
                      {bullet}
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
        <div className="mb-10">
          <h2 className="text-xs font-semibold mb-4 text-gray-400 tracking-widest uppercase">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 text-xs text-gray-700 bg-gray-50 rounded-full border border-gray-200"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {educations.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-semibold mb-4 text-gray-400 tracking-widest uppercase">
            Education
          </h2>
          <div className="space-y-4">
            {educations.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {edu.school_name_translated || edu.school_name}
                  </h3>
                  {((edu.school_name_translated &&
                    edu.school_name_translated !== "-") ||
                    (edu.school_name && edu.school_name !== "-") ||
                    (edu.major_translated && edu.major_translated !== "-") ||
                    (edu.major && edu.major !== "-") ||
                    (edu.degree_translated && edu.degree_translated !== "-") ||
                    (edu.degree && edu.degree !== "-")) && (
                    <p className="text-sm text-gray-500">
                      {edu.degree_translated || edu.degree}
                      {(edu.degree_translated || edu.degree) &&
                        (edu.major_translated || edu.major) &&
                        ", "}
                      {edu.major_translated || edu.major}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 tabular-nums">
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
          <h2 className="text-xs font-semibold mb-4 text-gray-400 tracking-widest uppercase">
            Additional Information
          </h2>
          <div className="space-y-4">
            {certifications.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-900 mb-2">
                  Certifications
                </h3>
                <div className="flex flex-col gap-1">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="text-sm text-gray-600 font-light"
                    >
                      {cert.name_translated || cert.name_original}{" "}
                      {cert.description_translated || cert.description_original
                        ? `| ${
                            cert.description_translated ||
                            cert.description_original
                          }`
                        : ""}{" "}
                      {cert.date ? `(${formatDate(cert.date)})` : ""}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {awards.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-900 mb-2">
                  Awards
                </h3>
                <div className="flex flex-col gap-1">
                  {awards.map((award) => (
                    <div
                      key={award.id}
                      className="text-sm text-gray-600 font-light"
                    >
                      {award.name_translated || award.name_original}{" "}
                      {award.description_translated ||
                      award.description_original
                        ? `| ${
                            award.description_translated ||
                            award.description_original
                          }`
                        : ""}{" "}
                      {award.date ? `(${formatDate(award.date)})` : ""}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-900 mb-2">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 font-light">
                  {languages.map((lang, index) => (
                    <span key={lang.id} className="flex items-center">
                      {index > 0 && (
                        <span className="mr-4 text-gray-300">|</span>
                      )}
                      <span className="font-medium mr-1 text-gray-800">
                        {lang.name_translated || lang.name_original}
                      </span>
                      {(lang.description_translated ||
                        lang.description_original) && (
                        <span className="text-gray-400">
                          (
                          {lang.description_translated ||
                            lang.description_original}
                          )
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
