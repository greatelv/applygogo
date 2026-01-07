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

interface ModernTemplateProps {
  experiences: Experience[];
}

export function ModernTemplate({ experiences }: ModernTemplateProps) {
  return (
    <div className="bg-white text-black p-8 min-h-[800px] font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">John Doe</h1>
        <p className="text-xl text-gray-600 mb-3">Frontend Developer</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>john.doe@email.com</span>
          <span>•</span>
          <span>+82 10-1234-5678</span>
          <span>•</span>
          <span>Seoul, Korea</span>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-600"></div>
          PROFESSIONAL SUMMARY
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          Results-driven Frontend Developer with 4+ years of experience in building 
          responsive web applications. Proven track record of improving user experience 
          and team productivity through innovative solutions.
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
                  <p className="text-sm text-blue-600 font-medium">{exp.positionEn}</p>
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
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-600"></div>
          TECHNICAL SKILLS
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-semibold text-gray-900">Frontend:</span>
            <span className="text-gray-700 ml-2">React, TypeScript, Vue.js, Tailwind CSS</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900">Tools:</span>
            <span className="text-gray-700 ml-2">Git, Figma, VS Code, Webpack</span>
          </div>
        </div>
      </div>

      {/* Education */}
      <div>
        <h2 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-600"></div>
          EDUCATION
        </h2>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-900">Korea University</h3>
            <p className="text-sm text-gray-600">Bachelor of Computer Science</p>
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap ml-4">2016 - 2020</span>
        </div>
      </div>
    </div>
  );
}
