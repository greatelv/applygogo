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

interface ProfessionalTemplateProps {
  personalInfo?: any;
  experiences: any[];
  educations?: any[];
  skills?: any[];
  additionalItems?: any[];
}

export function ProfessionalTemplate({
  personalInfo,
  experiences,
  educations = [],
  skills = [],
  additionalItems = [],
}: ProfessionalTemplateProps) {
  const certifications = additionalItems.filter(
    (i) => i.type === "CERTIFICATION",
  );
  const awards = additionalItems.filter((i) => i.type === "AWARD");
  const languages = additionalItems.filter((i) => i.type === "LANGUAGE");

  return (
    <div className="bg-white text-gray-800 min-h-full font-sans flex text-[10pt] leading-relaxed">
      {/* Left Sidebar ~30% */}
      <div className="w-[32%] bg-white pr-6 border-r border-gray-200 pt-8 pb-8 pl-8">
        {/* Contact */}
        <div className="mb-8 font-sans">
          <h3 className="text-xs font-bold text-gray-900 border-b border-gray-800 pb-1 mb-3 uppercase tracking-wider">
            Contact
          </h3>
          <div className="space-y-1.5 text-xs text-gray-600">
            {personalInfo?.email && (
              <div className="break-all">{personalInfo.email}</div>
            )}
            {personalInfo?.phone && <div>{personalInfo.phone}</div>}
            {personalInfo?.links
              ?.filter((l: any) => l.url)
              .map((link: any, i: number) => (
                <div key={i} className="pt-0.5">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline break-all block"
                  >
                    {link.label || "Link"}
                  </a>
                </div>
              ))}
          </div>
        </div>

        {/* Education */}
        {educations.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-800 pb-1 mb-3 uppercase tracking-wider">
              Education
            </h3>
            <div className="space-y-4 text-xs">
              {educations.map((edu: any) => (
                <div key={edu.id}>
                  <div className="font-bold text-gray-900">
                    {edu.school_name_target || edu.school_name_source}
                  </div>
                  <div className="text-gray-600">
                    {edu.degree_target || edu.degree_source}
                    {(edu.degree_target || edu.degree_source) &&
                    (edu.major_target || edu.major_source)
                      ? ", "
                      : ""}
                    {edu.major_target || edu.major_source}
                  </div>
                  <div className="text-gray-400 text-[10px] mt-0.5 font-medium">
                    {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-800 pb-1 mb-3 uppercase tracking-wider">
              Skills
            </h3>
            <ul className="space-y-1">
              {skills.map((skill: any) => (
                <li key={skill.id} className="text-xs text-gray-600">
                  • {skill.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-800 pb-1 mb-3 uppercase tracking-wider">
              Languages
            </h3>
            <div className="space-y-2">
              {languages.map((lang: any) => (
                <div key={lang.id} className="text-xs">
                  <span className="font-semibold text-gray-700 block">
                    {lang.name_en || lang.name}
                  </span>
                  {(lang.description_en || lang.description) && (
                    <span className="text-gray-500 text-[10px]">
                      {lang.description_en || lang.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications (Sidebar Style) */}
        {certifications.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-800 pb-1 mb-3 uppercase tracking-wider">
              Certifications
            </h3>
            <div className="space-y-2 text-xs">
              {certifications.map((cert: any) => (
                <div key={cert.id}>
                  <span className="block text-gray-700">
                    {cert.name_target || cert.name_source}
                  </span>
                  {cert.date && (
                    <span className="text-[10px] text-gray-400">
                      {formatDate(cert.date)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Column ~70% */}
      <div className="flex-1 pt-8 pb-8 pr-8 pl-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">
            {personalInfo?.name_target || personalInfo?.name_source || "Name"}
          </h1>
          {/* Title Placeholder if specific field exists, usually use most recent job */}
          {experiences[0]?.position_target && (
            <div className="text-lg text-blue-600 font-medium">
              {experiences[0].position_target}
            </div>
          )}
        </div>

        {/* Summary */}
        {personalInfo?.summary && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide">
              Professional Summary
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed text-justify">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {experiences.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 mb-4 uppercase tracking-wide">
              Work Experience
            </h2>
            <div className="space-y-6">
              {experiences.map((exp: any) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div>
                      <span className="font-bold text-gray-900 text-[11pt] mr-2">
                        {exp.company_target}
                      </span>
                      <span className="text-gray-700 text-[10pt] font-medium">
                        {exp.position_target}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium italic shrink-0">
                      {formatDate(exp.period.split(" - ")[0])} -{" "}
                      {formatDate(exp.period.split(" - ")[1])}
                    </span>
                  </div>
                  <ul className="space-y-1.5 mt-2">
                    {exp.bullets_target?.map((bullet: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex gap-2 text-[9.5pt] text-gray-600 leading-snug"
                      >
                        <span className="text-blue-600 mt-0.5 text-xs">•</span>
                        <span className="flex-1">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards (Body) */}
        {awards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide">
              Honors & Awards
            </h2>
            <div className="space-y-2">
              {awards.map((award: any) => (
                <div key={award.id} className="text-sm">
                  <span className="font-bold text-gray-800">
                    {award.name_target || award.name_source}
                  </span>
                  <div className="text-gray-600 text-xs">
                    {award.description_target || award.description_source}
                    {award.date ? ` | ${formatDate(award.date)}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
