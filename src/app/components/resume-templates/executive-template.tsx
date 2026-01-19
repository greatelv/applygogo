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

interface ExecutiveTemplateProps {
  personalInfo?: any;
  experiences: any[];
  educations?: any[];
  skills?: any[];
  additionalItems?: any[];
}

export function ExecutiveTemplate({
  personalInfo,
  experiences,
  educations = [],
  skills = [],
  additionalItems = [],
}: ExecutiveTemplateProps) {
  const certifications = additionalItems.filter(
    (i) => i.type === "CERTIFICATION",
  );
  const awards = additionalItems.filter((i) => i.type === "AWARD");
  const languages = additionalItems.filter((i) => i.type === "LANGUAGE");

  return (
    <div className="bg-white text-slate-800 min-h-full font-sans text-[10.5pt] leading-relaxed">
      {/* Dark Header */}
      <div className="bg-slate-900 text-white py-10 px-10 mb-8">
        <h1 className="text-4xl font-bold mb-2 tracking-wide text-white">
          {personalInfo?.name_target || personalInfo?.name_source || "Name"}
        </h1>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-300 items-center mt-3">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && (
            <>
              <span className="text-slate-600">|</span>
              <span>{personalInfo.phone}</span>
            </>
          )}
          {personalInfo?.links
            ?.filter((l: any) => l.url)
            .map((link: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-slate-600">|</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {link.label || "Link"}
                </a>
              </div>
            ))}
        </div>
      </div>

      <div className="px-10 pb-10">
        {/* Summary */}
        {personalInfo?.summary_target || personalInfo?.summary_source ? (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-3 uppercase tracking-widest">
              Executive Summary
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {personalInfo.summary_target || personalInfo.summary_source}
            </p>
          </div>
        ) : null}

        {/* Experience */}
        {experiences.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-4 uppercase tracking-widest">
              Professional Experience
            </h2>
            <div className="space-y-6">
              {experiences.map((exp: any) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flexflex-col">
                      <div className="font-bold text-slate-900 text-[11.5pt]">
                        {exp.company_name_target}
                      </div>
                      <div className="text-slate-700 font-bold text-[10.5pt]">
                        {exp.role_target}
                      </div>
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      {formatDate(exp.period.split(" - ")[0])} -{" "}
                      {formatDate(exp.period.split(" - ")[1])}
                    </div>
                  </div>
                  <ul className="space-y-2 mt-2">
                    {exp.bullets_target?.map((bullet: string, idx: number) => (
                      <li key={idx} className="flex gap-3 pl-1">
                        <span
                          className="text-slate-900 mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-900 flex-shrink-0 block"
                          style={{ width: "4px", height: "4px" }}
                        />
                        <span className="text-slate-600 flex-1">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {educations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-4 uppercase tracking-widest">
              Education
            </h2>
            <div className="space-y-3">
              {educations.map((edu: any) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900">
                      {edu.school_name_target || edu.school_name_source}
                    </div>
                    <div className="text-slate-700 text-sm">
                      {edu.degree_target || edu.degree_source}
                      {(edu.degree_target || edu.degree_source) &&
                      (edu.major_target || edu.major_source)
                        ? ", "
                        : ""}
                      {edu.major_target || edu.major_source}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
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
            <h2 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-4 uppercase tracking-widest">
              Core Competencies
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: any) => (
                <span
                  key={skill.id}
                  className="bg-slate-100 text-slate-900 px-3 py-1 rounded text-sm font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional */}
        {(certifications.length > 0 ||
          awards.length > 0 ||
          languages.length > 0) && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-4 uppercase tracking-widest">
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certifications.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">
                    Certifications
                  </h4>
                  <ul className="space-y-1">
                    {certifications.map((item: any) => (
                      <li key={item.id} className="text-sm text-slate-600">
                        • {item.name_target || item.name_source}{" "}
                        {item.date ? `(${formatDate(item.date)})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {awards.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">
                    Awards
                  </h4>
                  <ul className="space-y-1">
                    {awards.map((item: any) => (
                      <li key={item.id} className="text-sm text-slate-600">
                        • {item.name_target || item.name_source}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {languages.length > 0 && (
                <div className="col-span-1 md:col-span-2">
                  <h4 className="font-bold text-slate-900 text-sm mb-2">
                    Languages
                  </h4>
                  <div className="flex gap-4 flex-wrap">
                    {languages.map((item: any) => (
                      <span key={item.id} className="text-sm text-slate-600">
                        • {item.name_target || item.name_source}
                        {(item.description_target || item.description_source) &&
                          ` (${item.description_target || item.description_source})`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
