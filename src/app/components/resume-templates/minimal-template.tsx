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

interface MinimalTemplateProps {
  experiences: Experience[];
}

export function MinimalTemplate({ experiences }: MinimalTemplateProps) {
  return (
    <div className="bg-white text-black p-8 min-h-[800px] font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-light mb-1 text-gray-900 tracking-tight">John Doe</h1>
          <p className="text-gray-500 text-sm mb-4">Frontend Developer</p>
          <div className="flex gap-3 text-xs text-gray-500">
            <span>john.doe@email.com</span>
            <span>+82 10-1234-5678</span>
            <span>Seoul</span>
          </div>
        </div>

        {/* About */}
        <div className="mb-10">
          <p className="text-sm text-gray-700 leading-relaxed font-light">
            Frontend Developer specializing in React and TypeScript with 4+ years 
            of experience building elegant, user-centric web applications.
          </p>
        </div>

        {/* Experience */}
        <div className="mb-10">
          <h2 className="text-xs font-semibold mb-6 text-gray-400 tracking-widest uppercase">
            Experience
          </h2>
          <div className="space-y-8">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative">
                <div className="flex justify-between items-baseline mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{exp.companyEn}</h3>
                    <p className="text-sm text-gray-500">{exp.positionEn}</p>
                  </div>
                  <span className="text-xs text-gray-400 tabular-nums">{exp.period}</span>
                </div>
                <ul className="space-y-2">
                  {exp.bulletsEn.map((bullet, index) => (
                    <li key={index} className="text-sm text-gray-600 leading-relaxed font-light">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-10">
          <h2 className="text-xs font-semibold mb-4 text-gray-400 tracking-widest uppercase">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "Vue.js", "Tailwind CSS", "Git", "Figma", "VS Code"].map(
              (skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 text-xs text-gray-700 bg-gray-50 rounded-full border border-gray-200"
                >
                  {skill}
                </span>
              )
            )}
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-xs font-semibold mb-4 text-gray-400 tracking-widest uppercase">
            Education
          </h2>
          <div className="flex justify-between items-baseline">
            <div>
              <h3 className="font-medium text-gray-900">Korea University</h3>
              <p className="text-sm text-gray-500">BS in Computer Science</p>
            </div>
            <span className="text-xs text-gray-400 tabular-nums">2016 - 2020</span>
          </div>
        </div>
      </div>
    </div>
  );
}
