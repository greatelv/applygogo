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

interface PersonalInfo {
  name_kr?: string;
  name_en?: string;
  email?: string;
  phone?: string;
  links?: { label: string; url: string }[];
}

interface ModernTemplateProps {
  personalInfo?: PersonalInfo;
  experiences: Experience[];
  educations?: Education[];
  skills?: Skill[];
}

export function ModernTemplate({
  personalInfo,
  experiences,
  educations = [],
  skills = [],
}: ModernTemplateProps) {
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
          {personalInfo?.links?.map((link, i) => (
            <span key={i} className="flex gap-2">
              <span>•</span>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                {link.label}
              </a>
            </span>
          ))}
        </div>
      </div>

      {/* Professional Summary */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-600"></div>
          PROFESSIONAL SUMMARY
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          Results-driven Frontend Developer with 4+ years of experience in
          building responsive web applications. Proven track record of improving
          user experience and team productivity through innovative solutions.
        </p>
      </div>

      {/* Experience */}
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
                  {exp.period}
                </span>
              </div>
              <ul className="space-y-1.5 ml-4">
                {exp.bulletsEn.map((bullet, index) => (
                  <li key={index} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-blue-600 flex-shrink-0">▸</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

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
        <div>
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
                  <p className="text-sm text-gray-600">
                    {edu.degree_en || edu.degree}, {edu.major_en || edu.major}
                  </p>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                  {edu.start_date} - {edu.end_date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
