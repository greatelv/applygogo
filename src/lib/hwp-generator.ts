/**
 * HWPML Standard Generator v6 (Mac Native Font Optimized)
 *
 * Strategy:
 * - Return to HWPML for high-quality native document structure.
 * - FONT: Explicitly use "Apple SD Gothic Neo" (Mac System Font) to ensure Bold rendering on macOS.
 * - LAYOUT: Use Tab-based layout for robust alignment without table rendering risks.
 */

const escapeXml = (unsafe: string | undefined | null) => {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
};

// --- HWPML Header ---
const HWP_HEADER = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<HWPML Version="2.1">
  <HEAD>
    <MAPPINGTABLE>
      <FACENAMELIST>
        <!-- Lang 0(Hangul): Malgun Gothic for Bold Compatibility -->
        <FACENAME Lang="0" Value="맑은 고딕"/><FACENAME Lang="1" Value="맑은 고딕"/><FACENAME Lang="2" Value="맑은 고딕"/>
        <FACENAME Lang="3" Value="맑은 고딕"/><FACENAME Lang="4" Value="맑은 고딕"/><FACENAME Lang="5" Value="맑은 고딕"/>
      </FACENAMELIST>
      <BORDERFILLLIST>
        <BORDERFILL Id="1"><SLASH Type="none"/><BACKSLASH Type="none"/><CROSSLASH Type="none"/></BORDERFILL>
        <BORDERFILL Id="2">
            <SLASH Type="none"/><BACKSLASH Type="none"/><CROSSLASH Type="none"/>
            <BOTTOMBORDER Type="solid" Width="0.5mm" Color="#000000"/>
        </BORDERFILL>
      </BORDERFILLLIST>
      <CHARSHAPELIST>
        <!-- Id=0: Normal Body -->
        <CHARSHAPE Id="0" Height="1000" TextColor="#000000" FaceNameIds="0 1 2" /> 
        
        <!-- Id=1: Huge Name (Bold="1" for XML compatibility) -->
        <CHARSHAPE Id="1" Height="2400" TextColor="#000000" FaceNameIds="0 1 2" Bold="1" />
        
        <!-- Id=2: Section Title (Bold) -->
        <CHARSHAPE Id="2" Height="1300" TextColor="#000000" FaceNameIds="0 1 2" Bold="1" />
        
        <!-- Id=3: Company Name (Bold) -->
        <CHARSHAPE Id="3" Height="1000" TextColor="#000000" FaceNameIds="0 1 2" Bold="1" />
        
        <!-- Id=4: Date (Gray) -->
        <CHARSHAPE Id="4" Height="900" TextColor="#555555" FaceNameIds="0 1 2" />
        
        <!-- Id=5: Role (Bold) -->
        <CHARSHAPE Id="5" Height="1000" TextColor="#000000" FaceNameIds="0 1 2" Bold="1" />
      </CHARSHAPELIST>
      <TABDEFLIST>
         <TABDEF Id="0" AutoTabLeft="false" AutoTabRight="false" />
         <!-- Tab at 40000 HWP Units (~Right Align) -->
         <TABDEF Id="1" AutoTabLeft="false" AutoTabRight="false">
             <TABITEM Pos="40000" Type="right" Leader="none" /> 
         </TABDEF>
      </TABDEFLIST>
      <PARASHAPELIST>
         <PARASHAPE Id="0" LineSpacing="160" LineSpacingType="percent" Align="justify" /> 
         <PARASHAPE Id="1" LineSpacing="160" LineSpacingType="percent" Align="center" /> 
         <PARASHAPE Id="2" LineSpacing="160" LineSpacingType="percent" Align="left" HeadingType="none" TabDefId="1" /> <!-- Tabbed Header -->
         <PARASHAPE Id="3" LineSpacing="140" LineSpacingType="percent" Align="left" MarginLeft="1500" TextIndent="-1000" /> <!-- Bullet -->
      </PARASHAPELIST>
      <STYLENAMELIST>
        <STYLENAME Id="0" Name="Normal" ParaShapeId="0" CharShapeId="0" NextStyleId="0" Lang="0" />
      </STYLENAMELIST>
    </MAPPINGTABLE>
  </HEAD>
  <BODY>
    <SECTION Id="0">
      <PAGEDEF Landscape="0" Width="59528" Height="84188" GutterType="left" MarginLeft="5669" MarginRight="5669" MarginTop="4252" MarginBottom="4252" MarginHeader="0" MarginFooter="0" MarginGutter="0"/>
`;

const HWP_FOOTER = `
    </SECTION>
  </BODY>
</HWPML>
`;

const createPara = (
  text: string,
  options: {
    paraId?: number;
    charId?: number;
  } = {}
) => {
  const pId = options.paraId ?? 0;
  const cId = options.charId ?? 0;

  let contentXml = "";

  if (pId === 2 && text.includes("\t")) {
    const parts = text.split("\t");
    // Left Part
    contentXml += `<TEXT CharShapeId="${cId}"><CHAR>${escapeXml(
      parts[0]
    )}</CHAR></TEXT>`;

    if (parts[1]) {
      contentXml += `<TEXT CharShapeId="0"><CHAR>   </CHAR></TEXT>`;
      contentXml += `<TAB />`;
      contentXml += `<TEXT CharShapeId="4"><CHAR>${escapeXml(
        parts[1]
      )}</CHAR></TEXT>`; // Date
    }
  } else {
    contentXml = `<TEXT CharShapeId="${cId}"><CHAR>${escapeXml(
      text
    )}</CHAR></TEXT>`;
  }

  return `<P ParaShapeId="${pId}" StyleId="0">${contentXml}</P>`;
};

const createSectionTitle = (title: string) => {
  return `
    <P ParaShapeId="0"><TEXT CharShapeId="0"><CHAR></CHAR></TEXT></P>
    <TABLE Width="48189" Height="900" BorderFillId="1">
       <ROW>
         <CELL ColAddr="0" RowAddr="0" ColSpan="1" RowSpan="1" Width="48189" Height="900" BorderFillId="2">
             <P ParaShapeId="0"><TEXT CharShapeId="2"><CHAR>  ${escapeXml(
               title.toUpperCase()
             )}</CHAR></TEXT></P>
         </CELL>
       </ROW>
    </TABLE>
    <P ParaShapeId="0"><TEXT CharShapeId="0"><CHAR></CHAR></TEXT></P>
    `;
};

// --- Main Generator Functions ---

export const generateResumeHwpHtml = (resume: any) => {
  const { personalInfo, experiences, educations, skills, additionalItems } =
    resume;

  let body = "";

  // 1. Header
  const name =
    personalInfo?.name_translated || personalInfo?.name_original || "Resume";
  body += createPara(name, { paraId: 1, charId: 1 }); // Center, Bold
  body += createPara("", { paraId: 1 });

  const contacts = [];
  if (personalInfo?.email) contacts.push(personalInfo.email);
  if (personalInfo?.phone) contacts.push(personalInfo.phone);
  if (personalInfo?.links) {
    personalInfo.links.forEach((l: any) => {
      if (l.url) contacts.push(l.label || l.url.replace(/^https?:\/\//, ""));
    });
  }
  if (contacts.length > 0) {
    body += createPara(contacts.join("  |  "), { paraId: 1, charId: 0 });
  }
  body += createPara("", { paraId: 0 });

  // 2. Summary
  if (personalInfo?.summary) {
    body += createSectionTitle("Professional Summary");
    body += createPara(personalInfo.summary, { paraId: 0 });
  }

  // 3. Experience
  if (experiences?.length > 0) {
    body += createSectionTitle("Work Experience");

    experiences
      .filter((e: any) => e.company || e.companyTranslated)
      .forEach((exp: any) => {
        const company = exp.companyTranslated || exp.company;
        const start = formatDate(exp.period?.split(" - ")[0]);
        const end = formatDate(exp.period?.split(" - ")[1]) || "Present";
        const dateStr = start ? `${start} - ${end}` : "";

        body += createPara(`${company}\t${dateStr}`, { paraId: 2, charId: 3 });

        const position = exp.positionTranslated || exp.position;
        if (position) body += createPara(position, { paraId: 0, charId: 5 });

        if (exp.description) body += createPara(exp.description, { paraId: 0 });

        const bullets = exp.bulletsTranslated || exp.bullets || [];
        bullets.forEach((b: string) => {
          body += createPara(`•  ${b}`, { paraId: 3 });
        });

        body += createPara("", { paraId: 0 });
      });
  }

  // 4. Education
  if (educations?.length > 0) {
    body += createSectionTitle("Education");
    educations.forEach((edu: any) => {
      const school = edu.school_name_translated || edu.school_name;
      const start = formatDate(edu.start_date);
      const end = formatDate(edu.end_date) || "Present";
      const dateStr = start ? `${start} - ${end}` : "";

      body += createPara(`${school}\t${dateStr}`, { paraId: 2, charId: 3 });

      const degree = edu.degree_translated || edu.degree;
      const major = edu.major_translated || edu.major;
      if (degree || major) {
        const detail = [degree, major].filter(Boolean).join(", ");
        body += createPara(detail, { paraId: 0 });
      }
      body += createPara("", { paraId: 0 });
    });
  }

  // 5. Skills
  if (skills?.length > 0) {
    body += createSectionTitle("Skills");
    const skillList = skills.map((s: any) => s.name).join(", ");
    body += createPara(skillList, { paraId: 0 });
  }

  // 6. Additional
  if (additionalItems?.length > 0) {
    body += createSectionTitle("Additional Information");
    additionalItems.forEach((item: any) => {
      const type = item.type;
      const name = item.name_translated || item.name_original;
      const desc = item.description_translated || item.description_original;
      let text = `[${type}] ${name}`;
      if (desc) text += ` - ${desc}`;

      body += createPara(text, { paraId: 3 });
    });
  }

  return HWP_HEADER + body + HWP_FOOTER;
};

export const generateNarrativeHwpHtml = (resume: any, content: any) => {
  let body = "";

  body += createPara("자 기 소 개 서", { paraId: 1, charId: 1 });

  const name =
    resume.personalInfo?.name_translated ||
    resume.personalInfo?.name_original ||
    "지원자";
  body += createPara(`지원자 : ${name}`, { paraId: 1, charId: 0 });
  body += createPara("", { paraId: 0 });

  const sections = [
    { title: "핵심 역량 및 강점", content: content.core_competency },
    { title: "주요 성과", content: content.key_achievements },
    { title: "성장 과정", content: content.growth_process },
    { title: "입사 후 포부", content: content.motivation_and_goals },
  ];

  sections.forEach((sec) => {
    if (!sec.content) return;
    body += createSectionTitle(sec.title);
    body += createPara(sec.content, { paraId: 0 });
    body += createPara("", { paraId: 0 });
  });

  return HWP_HEADER + body + HWP_FOOTER;
};
