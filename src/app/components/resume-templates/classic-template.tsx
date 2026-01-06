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

interface ClassicTemplateProps {
  experiences: Experience[];
}

export function ClassicTemplate({ experiences }: ClassicTemplateProps) {
  return (
    <div className="bg-white text-black p-8 min-h-[800px] font-serif">
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-2 border-gray-800">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 tracking-wide">JOHN DOE</h1>
        <p className="text-lg text-gray-700 mb-2">Frontend Developer</p>
        <div className="text-sm text-gray-600 space-x-2">
          <span>john.doe@email.com</span>
          <span>|</span>
          <span>+82 10-1234-5678</span>
          <span>|</span>
          <span>Seoul, Korea</span>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="mb-6">
        <h2 className="text-base font-bold mb-2 text-gray-900 tracking-wider border-b border-gray-300 pb-1">
          PROFESSIONAL SUMMARY
        </h2>
        <p className="text-sm text-gray-800 leading-relaxed text-justify">
          Accomplished Frontend Developer with over 4 years of progressive experience 
          in designing and implementing sophisticated web applications. Demonstrated 
          expertise in modern JavaScript frameworks and a proven ability to enhance 
          operational efficiency and user satisfaction.
        </p>
      </div>

      {/* Experience */}
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
                  <span className="text-xs text-gray-600 italic">{exp.period}</span>
                </div>
                <p className="text-sm text-gray-700 italic">{exp.positionEn}</p>
              </div>
              <ul className="space-y-1">
                {exp.bulletsEn.map((bullet, index) => (
                  <li key={index} className="text-sm text-gray-800 flex gap-2 leading-relaxed">
                    <span className="flex-shrink-0">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h2 className="text-base font-bold mb-2 text-gray-900 tracking-wider border-b border-gray-300 pb-1">
          TECHNICAL COMPETENCIES
        </h2>
        <div className="text-sm text-gray-800 space-y-1">
          <p>
            <span className="font-semibold">Frontend Technologies:</span>{" "}
            React, TypeScript, Vue.js, Tailwind CSS, HTML5, CSS3, JavaScript (ES6+)
          </p>
          <p>
            <span className="font-semibold">Development Tools:</span>{" "}
            Git, Figma, VS Code, Webpack, npm, Jest
          </p>
        </div>
      </div>

      {/* Education */}
      <div>
        <h2 className="text-base font-bold mb-2 text-gray-900 tracking-wider border-b border-gray-300 pb-1">
          EDUCATION
        </h2>
        <div className="flex justify-between items-baseline">
          <div>
            <h3 className="font-bold text-gray-900">Korea University</h3>
            <p className="text-sm text-gray-700 italic">Bachelor of Science in Computer Science</p>
          </div>
          <span className="text-xs text-gray-600 italic">2016 - 2020</span>
        </div>
      </div>
    </div>
  );
}
