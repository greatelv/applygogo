"use client";

import { useState } from "react";
import {
  ArrowRight,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  X,
  Pencil,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  bullets: string[];
}

interface TranslatedExperience extends Experience {
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
  name_kr: string;
  name_en: string;
  email: string;
  phone: string;
  links: { label: string; url: string }[];
  summary?: string;
  summary_kr?: string;
}

export type ItemType =
  | "CERTIFICATION"
  | "AWARD"
  | "LANGUAGE"
  | "ACTIVITY"
  | "OTHER";

export interface AdditionalItem {
  id: string;
  type: ItemType;
  name_kr: string;
  name_en?: string;
  description_kr?: string;
  description_en?: string;
  date?: string;
}

interface ResumeEditPageProps {
  resumeTitle: string;
  initialPersonalInfo?: PersonalInfo;
  initialExperiences?: TranslatedExperience[];
  initialEducations?: Education[];
  initialSkills?: Skill[];
  initialAdditionalItems?: AdditionalItem[];
  isEditingExisting?: boolean;
  quota?: number;
  isLoading?: boolean;
  onNext: (data: {
    personalInfo: PersonalInfo;
    experiences: TranslatedExperience[];
    educations: Education[];
    skills: Skill[];
    additionalItems: AdditionalItem[];
  }) => void;
  onBack: () => void;
  onRetranslate?: () => void;
}

export function ResumeEditPage({
  resumeTitle,
  initialPersonalInfo,
  initialExperiences,
  initialEducations,
  initialSkills,
  initialAdditionalItems,
  isEditingExisting,
  quota,
  isLoading = false, // Default to false
  onNext,
  onBack,
  onRetranslate,
}: ResumeEditPageProps) {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(
    initialPersonalInfo || {
      name_kr: "",
      name_en: "",
      email: "",
      phone: "",
      links: [],
      summary: "",
      summary_kr: "",
    }
  );
  const [experiences, setExperiences] = useState<TranslatedExperience[]>(
    initialExperiences || []
  );
  const [educations, setEducations] = useState<Education[]>(
    initialEducations || []
  );
  const [skills, setSkills] = useState<Skill[]>(initialSkills || []);
  const [additionalItems, setAdditionalItems] = useState<AdditionalItem[]>(
    initialAdditionalItems || []
  );

  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>(
    {}
  );
  const [highlightedBullets, setHighlightedBullets] = useState<
    Record<string, number[]>
  >({});
  const [highlightedPersonal, setHighlightedPersonal] = useState<
    Record<string, boolean>
  >({});
  const [newSkill, setNewSkill] = useState("");

  // Handlers for New Sections
  // Handlers for Additional Items
  const handleAdditionalItemChange = (
    id: string,
    field: keyof AdditionalItem,
    value: any
  ) => {
    setAdditionalItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddAdditionalItem = (type: ItemType = "CERTIFICATION") => {
    setAdditionalItems((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        type,
        name_kr: "",
        name_en: "",
        description_kr: "",
        description_en: "",
        date: "",
      },
    ]);
  };

  const handleRemoveAdditionalItem = (id: string) => {
    setAdditionalItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Experience Handlers
  const handleExperienceChange = (
    id: string,
    field: keyof TranslatedExperience,
    value: string
  ) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const handleBulletEdit = (
    expId: string,
    index: number,
    value: string,
    isEnglish: boolean
  ) => {
    setExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id !== expId) return exp;

        if (isEnglish) {
          const newBulletsEn = [...exp.bulletsEn];
          newBulletsEn[index] = value;
          return { ...exp, bulletsEn: newBulletsEn };
        } else {
          const newBullets = [...exp.bullets];
          newBullets[index] = value;
          return { ...exp, bullets: newBullets };
        }
      })
    );
  };

  const handleAddBullet = (expId: string) => {
    setExperiences((prev) =>
      prev.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              bullets: [...exp.bullets, ""],
              bulletsEn: [...exp.bulletsEn, ""],
            }
          : exp
      )
    );
  };

  const handleRemoveBullet = (expId: string, index: number) => {
    setExperiences((prev) =>
      prev.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              bullets: exp.bullets.filter((_, i) => i !== index),
              bulletsEn: exp.bulletsEn.filter((_, i) => i !== index),
            }
          : exp
      )
    );
  };

  const handleRetranslateExperience = async (expId: string) => {
    const currentExp = experiences.find((e) => e.id === expId);
    const initialExp = initialExperiences?.find((e) => e.id === expId);

    if (!currentExp) return;

    // Check for changes
    const isCompanyChanged = currentExp.company !== initialExp?.company;
    const isPositionChanged = currentExp.position !== initialExp?.position;
    const isPeriodChanged = currentExp.period !== initialExp?.period;

    // Find changed or added bullets (Korean only)
    const changedBullets: { index: number; text: string }[] = [];
    currentExp.bullets.forEach((bullet, index) => {
      const initialBullet = initialExp?.bullets[index];
      // If content is different from original (and not empty)
      if (bullet !== initialBullet && bullet.trim()) {
        changedBullets.push({ index, text: bullet });
      }
    });

    if (
      !isCompanyChanged &&
      !isPositionChanged &&
      !isPeriodChanged &&
      changedBullets.length === 0
    ) {
      alert(
        "변경된 한글 내용이 없습니다. 한글 경력사항을 수정한 후 재번역을 클릭해주세요."
      );
      return;
    }

    setIsTranslating((prev) => ({ ...prev, [expId]: true }));

    try {
      const promises = [];

      // 1. Metadata translation (Company, Position, Period)
      if (isCompanyChanged || isPositionChanged || isPeriodChanged) {
        const textsToTranslate = [];
        if (isCompanyChanged) textsToTranslate.push(currentExp.company);
        if (isPositionChanged) textsToTranslate.push(currentExp.position);
        if (isPeriodChanged) textsToTranslate.push(currentExp.period);

        promises.push(
          fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              texts: textsToTranslate,
              type: "general",
            }),
          }).then((res) => res.json())
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // 2. Bullets translation
      if (changedBullets.length > 0) {
        promises.push(
          fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              texts: changedBullets.map((item) => item.text),
              type: "bullets",
            }),
          }).then((res) => res.json())
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // @ts-ignore
      const [metaResult, bulletsResult] = await Promise.all(promises);

      setExperiences((prev) =>
        prev.map((exp) => {
          if (exp.id !== expId) return exp;
          let newItem = { ...exp };

          // Handle metadata update
          if (metaResult) {
            const { translatedTexts } = metaResult;
            let tIndex = 0;
            if (isCompanyChanged) newItem.companyEn = translatedTexts[tIndex++];
            if (isPositionChanged)
              newItem.positionEn = translatedTexts[tIndex++];
            if (isPeriodChanged) newItem.period = translatedTexts[tIndex++];
          }

          // Handle bullets update
          if (bulletsResult) {
            const { translatedTexts } = bulletsResult;
            const newBulletsEn = [...newItem.bulletsEn];
            changedBullets.forEach((item, i) => {
              newBulletsEn[item.index] = translatedTexts[i];
            });
            newItem.bulletsEn = newBulletsEn;
          }
          return newItem;
        })
      );

      // Highlight logic...
      setHighlightedBullets((prev) => {
        const newState = { ...prev };
        if (changedBullets.length > 0) {
          newState[expId] = changedBullets.map((item) => item.index);
        }
        return newState;
      });

      setTimeout(() => {
        setHighlightedBullets((prev) => {
          const newState = { ...prev };
          delete newState[expId];
          return newState;
        });
      }, 2000);
    } catch (error) {
      console.error(error);
      alert("번역 중 오류가 발생했습니다.");
    } finally {
      setIsTranslating((prev) => ({ ...prev, [expId]: false }));
    }
  };

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: any) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleTranslatePersonalInfo = async () => {
    setIsTranslating((prev) => ({ ...prev, personal: true }));
    try {
      // Collect name, summary, and all link labels that need translation
      const textsToTranslate = [personalInfo.name_kr];
      const hasSummary = !!personalInfo.summary_kr;

      if (hasSummary && personalInfo.summary_kr) {
        textsToTranslate.push(personalInfo.summary_kr);
      }

      personalInfo.links.forEach((link: any) => {
        textsToTranslate.push(link.label);
      });

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: textsToTranslate,
          type: "general",
        }),
      });

      if (!response.ok) throw new Error("Translation failed");

      const { translatedTexts } = await response.json();

      setPersonalInfo((prev) => {
        const newLinks = [...prev.links];

        let summaryEn = prev.summary;
        let linkStartIndex = 1;

        if (hasSummary) {
          summaryEn = translatedTexts[1];
          linkStartIndex = 2;
        }

        // translatedTexts[0] is name, [1 or 2+] are link labels
        translatedTexts
          .slice(linkStartIndex)
          .forEach((translatedLabel: string, i: number) => {
            newLinks[i] = { ...newLinks[i], label: translatedLabel };
          });

        return {
          ...prev,
          name_en: translatedTexts[0],
          summary: summaryEn,
          links: newLinks,
        };
      });

      // Highlight fields
      setHighlightedPersonal({ name: true, links: true });
      setTimeout(() => setHighlightedPersonal({}), 2000);
    } catch (error) {
      console.error(error);
      alert("기본 정보 번역 중 오류가 발생했습니다.");
    } finally {
      setIsTranslating((prev) => ({ ...prev, personal: false }));
    }
  };

  // Education Handlers
  const handleEducationChange = (
    id: string,
    field: keyof Education,
    value: string
  ) => {
    setEducations((prev) =>
      prev.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const handleRetranslateAdditionalItem = async (id: string) => {
    const item = additionalItems.find((i) => i.id === id);
    if (!item) return;

    setIsTranslating((prev) => ({ ...prev, [id]: true }));

    try {
      const textsToTranslate = [item.name_kr, item.description_kr].filter(
        Boolean
      );

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: textsToTranslate,
          type: "general",
        }),
      });

      if (!response.ok) throw new Error("Translation failed");

      const { translatedTexts } = await response.json();

      setAdditionalItems((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          return {
            ...i,
            name_en: translatedTexts[0] || i.name_en,
            description_en: translatedTexts[1] || i.description_en,
          };
        })
      );
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleTranslateEducation = async (eduId: string) => {
    const edu = educations.find((e) => e.id === eduId);
    if (!edu) return;

    setIsTranslating((prev) => ({ ...prev, [`edu-${eduId}`]: true }));

    try {
      // Translate School, Major, Degree
      const textsToTranslate = [edu.school_name, edu.major, edu.degree].filter(
        Boolean
      );

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: textsToTranslate,
          type: "general",
        }),
      });

      if (!response.ok) throw new Error("Translation failed");

      const { translatedTexts } = await response.json();

      setEducations((prev) =>
        prev.map((e) => {
          if (e.id !== eduId) return e;
          return {
            ...e,
            school_name_en: translatedTexts[0] || e.school_name_en,
            major_en: translatedTexts[1] || e.major_en,
            degree_en: translatedTexts[2] || e.degree_en,
          };
        })
      );
    } catch (error) {
      console.error(error);
      alert("학력 번역 중 오류가 발생했습니다.");
    } finally {
      setIsTranslating((prev) => ({ ...prev, [`edu-${eduId}`]: false }));
    }
  };

  // Skills Handlers
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const skill: Skill = {
      id: `new-${Date.now()}`,
      name: newSkill.trim(),
    };
    setSkills((prev) => [...prev, skill]);
    setNewSkill("");
  };

  const handleRemoveSkill = (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl mb-2">편집</h1>
        <p className="text-sm text-muted-foreground">
          AI가 분석한 내용을 검토하고 수정하세요.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg p-4 mb-8 flex items-start gap-3">
        <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded-full mt-0.5">
          <Pencil className="size-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
            내용을 클릭하여 직접 수정할 수 있습니다
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
            한글 내용을 수정하고 <strong>[동기화 후 번역]</strong> 버튼을 누르면
            AI가 변경된 내용에 맞춰 다시 번역해줍니다. 불필요한 항목은 휴지통
            아이콘을 눌러 삭제하세요.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Personal Info */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">기본 정보</h2>
        </div>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-6 py-4 border-b border-border relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">
                  한글 (원본)
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">
                  English (번역)
                </p>
              </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTranslatePersonalInfo}
                disabled={isTranslating.personal}
                className="text-muted-foreground hover:text-foreground"
              >
                {isTranslating.personal ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                <span className="hidden lg:inline ml-2">
                  {isTranslating.personal ? "처리 중..." : "동기화 후 번역"}
                </span>
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Korean Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase">
                    이름
                  </label>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handlePersonalInfoChange(
                        "name_kr",
                        e.currentTarget.textContent || ""
                      )
                    }
                    data-placeholder="이름 (한국어)"
                    className="text-xl font-semibold outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[36px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {personalInfo.name_kr}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase">
                      이메일
                    </label>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handlePersonalInfoChange(
                          "email",
                          e.currentTarget.textContent || ""
                        )
                      }
                      className="text-sm outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[24px]"
                    >
                      {personalInfo.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase">
                      전화번호
                    </label>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handlePersonalInfoChange(
                          "phone",
                          e.currentTarget.textContent || ""
                        )
                      }
                      data-placeholder="전화번호"
                      className="text-sm outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[24px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                    >
                      {personalInfo.phone}
                    </div>
                  </div>
                </div>

                {/* Links KR (Original rendering style but shared logic) */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase">
                    링크
                  </label>
                  <div className="space-y-2">
                    {personalInfo.links.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 group p-2 rounded -mx-2 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const newLinks = [...personalInfo.links];
                              newLinks[index] = {
                                ...link,
                                label: e.currentTarget.textContent || "",
                              };
                              handlePersonalInfoChange("links", newLinks);
                            }}
                            data-placeholder="링크 라벨"
                            className="text-sm outline-none px-2 py-1 rounded transition-colors hover:bg-accent focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text col-span-1 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                          >
                            {link.label}
                          </div>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const newLinks = [...personalInfo.links];
                              newLinks[index] = {
                                ...link,
                                url: e.currentTarget.textContent || "",
                              };
                              handlePersonalInfoChange("links", newLinks);
                            }}
                            data-placeholder="링크 URL"
                            className="text-sm outline-none px-2 py-1 rounded transition-colors hover:bg-accent focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text text-muted-foreground col-span-2 break-all empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                          >
                            {link.url}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newLinks = personalInfo.links.filter(
                              (_, i) => i !== index
                            );
                            handlePersonalInfoChange("links", newLinks);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 rounded shrink-0"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* English Info */}
              <div className="space-y-4">
                {/* Name EN */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase">
                    Name
                  </label>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handlePersonalInfoChange(
                        "name_en",
                        e.currentTarget.textContent || ""
                      )
                    }
                    data-placeholder="Name (English)"
                    className={`font-semibold text-lg outline-none px-2 py-1 -mx-2 rounded transition-all duration-1000 hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30 ${
                      highlightedPersonal.name
                        ? "bg-yellow-100 dark:bg-yellow-500/20 ring-1 ring-yellow-400/50"
                        : ""
                    }`}
                  >
                    {personalInfo.name_en}
                  </div>
                </div>

                {/* Shared Contact Info (EN Side) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase">
                      Email
                    </label>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handlePersonalInfoChange(
                          "email",
                          e.currentTarget.textContent || ""
                        )
                      }
                      data-placeholder="이메일 주소"
                      className="text-sm outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text break-all min-h-[24px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                    >
                      {personalInfo.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase">
                      Phone
                    </label>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handlePersonalInfoChange(
                          "phone",
                          e.currentTarget.textContent || ""
                        )
                      }
                      className="text-sm outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text"
                    >
                      {personalInfo.phone}
                    </div>
                  </div>
                </div>

                {/* Shared Links (EN Side) */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase">
                    Links
                  </label>
                  <div className="space-y-2">
                    {personalInfo.links.map((link, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 group p-2 rounded -mx-2 transition-all duration-1000 ${
                          highlightedPersonal.links
                            ? "bg-yellow-100 dark:bg-yellow-500/20 ring-1 ring-yellow-400/50"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const newLinks = [...personalInfo.links];
                              newLinks[index] = {
                                ...link,
                                label: e.currentTarget.textContent || "",
                              };
                              handlePersonalInfoChange("links", newLinks);
                            }}
                            data-placeholder="Link Label"
                            className="text-sm outline-none px-2 py-1 rounded transition-colors hover:bg-accent focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text col-span-1 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                          >
                            {link.label}
                          </div>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const newLinks = [...personalInfo.links];
                              newLinks[index] = {
                                ...link,
                                url: e.currentTarget.textContent || "",
                              };
                              handlePersonalInfoChange("links", newLinks);
                            }}
                            data-placeholder="Link URL"
                            className="text-sm outline-none px-2 py-1 rounded transition-colors hover:bg-accent focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text text-muted-foreground col-span-2 break-all empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                          >
                            {link.url}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newLinks = personalInfo.links.filter(
                              (_, i) => i !== index
                            );
                            handlePersonalInfoChange("links", newLinks);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 rounded shrink-0"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Consolidated Add Link Button */}
            <div className="mt-6 mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handlePersonalInfoChange("links", [
                    ...personalInfo.links,
                    { label: "", url: "" },
                  ]);
                }}
                className="w-full"
              >
                <Plus className="size-4 mr-2" /> 링크 추가 (Add Link)
              </Button>
            </div>

            {/* Summary Section */}
            <div className="mt-8 border-t border-border pt-6">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-4">
                Professional Summary
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Korean Summary */}
                <div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handlePersonalInfoChange(
                        "summary_kr",
                        e.currentTarget.textContent || ""
                      )
                    }
                    data-placeholder="Professional Summary (Korean) - 전문적인 요약을 입력하세요."
                    className="w-full text-sm outline-none px-2 py-2 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[60px] whitespace-pre-wrap leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {personalInfo.summary_kr}
                  </div>
                </div>

                {/* English Summary */}
                <div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handlePersonalInfoChange(
                        "summary",
                        e.currentTarget.textContent || ""
                      )
                    }
                    data-placeholder="Professional Summary (English) - Write a professional summary."
                    className="w-full text-sm outline-none px-2 py-2 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[60px] whitespace-pre-wrap leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {personalInfo.summary}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Experiences */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">경력</h2>
        </div>
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="bg-card border border-border rounded-lg overflow-hidden"
          >
            <div className="bg-muted/50 px-6 py-4 border-b border-border relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    한글 (원본)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    English (번역)
                  </p>
                </div>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRetranslateExperience(exp.id)}
                  disabled={isTranslating[exp.id]}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isTranslating[exp.id] ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  <span className="hidden lg:inline ml-2">
                    {isTranslating[exp.id] ? "처리 중..." : "동기화 후 번역"}
                  </span>
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Korean Bullets */}
                <div>
                  <div className="mb-4 space-y-1">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleExperienceChange(
                          exp.id,
                          "company",
                          e.currentTarget.textContent || ""
                        )
                      }
                      data-placeholder="회사명"
                      className="font-semibold text-xl outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text inline-block min-w-[100px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                    >
                      {exp.company}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleExperienceChange(
                            exp.id,
                            "position",
                            e.currentTarget.textContent || ""
                          )
                        }
                        data-placeholder="직무"
                        className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                      >
                        {exp.position}
                      </div>
                      <span className="text-muted-foreground select-none">
                        •
                      </span>
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleExperienceChange(
                            exp.id,
                            "period",
                            e.currentTarget.textContent || ""
                          )
                        }
                        data-placeholder="기간 (예: 2020.01 - 2023.12)"
                        className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                      >
                        {exp.period}
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {exp.bullets.map((bullet, index) => (
                      <li key={index} className="flex gap-4 text-sm group">
                        <span className="text-muted-foreground flex-shrink-0">
                          •
                        </span>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleBulletEdit(
                              exp.id,
                              index,
                              e.currentTarget.textContent || "",
                              false
                            )
                          }
                          data-placeholder="업무 성과 및 활동 내용"
                          className="flex-1 text-muted-foreground outline-none px-2 py-1 -mx-2 -my-1 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[24px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                        >
                          {bullet}
                        </div>
                        <button
                          onClick={() => handleRemoveBullet(exp.id, index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* English Bullets */}
                <div>
                  <div className="mb-4 space-y-1">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleExperienceChange(
                          exp.id,
                          "companyEn",
                          e.currentTarget.textContent || ""
                        )
                      }
                      data-placeholder="Company Name (EN)"
                      className="font-semibold text-xl outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text inline-block min-w-[100px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                    >
                      {exp.companyEn}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleExperienceChange(
                            exp.id,
                            "positionEn",
                            e.currentTarget.textContent || ""
                          )
                        }
                        data-placeholder="Position (EN)"
                        className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                      >
                        {exp.positionEn}
                      </div>
                      <span className="text-muted-foreground select-none">
                        •
                      </span>
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleExperienceChange(
                            exp.id,
                            "period",
                            e.currentTarget.textContent || ""
                          )
                        }
                        data-placeholder="Period (EN)"
                        className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                      >
                        {exp.period}
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {exp.bulletsEn.map((bullet, index) => (
                      <li key={index} className="flex gap-4 text-sm group">
                        <span className="text-muted-foreground flex-shrink-0">
                          •
                        </span>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleBulletEdit(
                              exp.id,
                              index,
                              e.currentTarget.textContent || "",
                              true
                            )
                          }
                          data-placeholder="Achievements and activities (EN)"
                          className={`flex-1 outline-none px-2 py-1 -mx-2 -my-1 rounded transition-all duration-1000 hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[24px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30 ${
                            highlightedBullets[exp.id]?.includes(index)
                              ? "bg-yellow-100 dark:bg-yellow-500/20 ring-1 ring-yellow-400/50"
                              : ""
                          }`}
                        >
                          {bullet}
                        </div>
                        <button
                          onClick={() => handleRemoveBullet(exp.id, index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBullet(exp.id)}
                  className="w-full"
                >
                  <Plus className="size-4" /> 항목 추가
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Educations */}
        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">학력사항</h2>
          </div>
          <div className="space-y-6">
            {educations.map((edu) => (
              <div
                key={edu.id}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                <div className="bg-muted/50 px-6 py-4 border-b border-border relative">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">
                        한글 (원본)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">
                        English (번역)
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 right-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTranslateEducation(edu.id)}
                      disabled={isTranslating[`edu-${edu.id}`]}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {isTranslating[`edu-${edu.id}`] ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="size-4" />
                      )}
                      <span className="ml-2 hidden lg:inline">
                        {isTranslating[`edu-${edu.id}`]
                          ? "처리 중..."
                          : "동기화 후 번역"}
                      </span>
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Korean Education */}
                    <div className="space-y-1">
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleEducationChange(
                            edu.id,
                            "school_name",
                            e.currentTarget.textContent || ""
                          )
                        }
                        data-placeholder="학교명 (예: 한국대학교)"
                        className="font-semibold text-xl outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text min-w-[100px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                      >
                        {edu.school_name}
                      </div>
                      {((edu.major && edu.major !== "-") ||
                        (edu.degree && edu.degree !== "-")) && (
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleEducationChange(
                                edu.id,
                                "major",
                                e.currentTarget.textContent || ""
                              )
                            }
                            data-placeholder="전공 (예: 경영학)"
                            className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                          >
                            {edu.major}
                          </div>
                          <span className="text-muted-foreground select-none">
                            •
                          </span>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleEducationChange(
                                edu.id,
                                "degree",
                                e.currentTarget.textContent || ""
                              )
                            }
                            data-placeholder="학위 (예: 학사)"
                            className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text min-w-[30px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                          >
                            {edu.degree}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleEducationChange(
                              edu.id,
                              "start_date",
                              e.currentTarget.textContent || ""
                            )
                          }
                          data-placeholder="입학일 (예: 2016.03)"
                          className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text min-w-[60px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                        >
                          {edu.start_date}
                        </div>
                        <span className="text-muted-foreground select-none">
                          ~
                        </span>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleEducationChange(
                              edu.id,
                              "end_date",
                              e.currentTarget.textContent || ""
                            )
                          }
                          data-placeholder="졸업일 (예: 2020.02)"
                          className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text min-w-[60px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                        >
                          {edu.end_date}
                        </div>
                      </div>
                    </div>

                    {/* English Education */}
                    <div className="space-y-1">
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleEducationChange(
                            edu.id,
                            "school_name_en",
                            e.currentTarget.textContent || ""
                          )
                        }
                        data-placeholder="School Name (EN)"
                        className="font-semibold text-xl outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text min-w-[100px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                      >
                        {edu.school_name_en || edu.school_name}
                      </div>
                      {((edu.major_en && edu.major_en !== "-") ||
                        (edu.degree_en && edu.degree_en !== "-")) && (
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleEducationChange(
                                edu.id,
                                "major_en",
                                e.currentTarget.textContent || ""
                              )
                            }
                            data-placeholder="Major (EN)"
                            className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 transition-colors cursor-text min-w-[50px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                          >
                            {edu.major_en || edu.major}
                          </div>
                          <span className="text-muted-foreground select-none">
                            •
                          </span>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleEducationChange(
                                edu.id,
                                "degree_en",
                                e.currentTarget.textContent || ""
                              )
                            }
                            data-placeholder="Degree (EN)"
                            className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[30px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                          >
                            {edu.degree_en || edu.degree}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleEducationChange(
                              edu.id,
                              "start_date",
                              e.currentTarget.textContent || ""
                            )
                          }
                          data-placeholder="Start Date (EN)"
                          className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[60px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                        >
                          {edu.start_date}
                        </div>
                        <span className="text-muted-foreground select-none">
                          ~
                        </span>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleEducationChange(
                              edu.id,
                              "end_date",
                              e.currentTarget.textContent || ""
                            )
                          }
                          data-placeholder="End Date (EN)"
                          className="outline-none hover:bg-accent/50 focus:bg-accent rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-text min-w-[60px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                        >
                          {edu.end_date}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">기술 스택</h2>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill.id}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm font-medium gap-2 pr-1.5 h-8"
                >
                  {skill.name}
                  <button
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="hover:bg-destructive/10 hover:text-destructive rounded-full p-0.5 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}

              <div className="flex gap-2 max-w-xs relative top-0.5">
                <Input
                  placeholder="새 기술 스택"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="h-8 text-sm w-32"
                />
                <Button
                  onClick={handleAddSkill}
                  variant="secondary"
                  size="sm"
                  className="h-8 px-2"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Items */}
        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">추가 정보</h2>
            <p className="text-sm text-muted-foreground">
              자격증, 수상경력, 언어, 활동, 기타 정보를 추가할 수 있습니다.
            </p>
          </div>
          <div className="space-y-8">
            {additionalItems.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-lg overflow-hidden group"
              >
                <div className="bg-muted/50 px-6 py-4 border-b border-border relative">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">
                        한글 (원본)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">
                        English (번역)
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRetranslateAdditionalItem(item.id)}
                      disabled={isTranslating[item.id]}
                      className="text-muted-foreground hover:text-foreground h-8 px-2"
                    >
                      {isTranslating[item.id] ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="size-4" />
                      )}
                      <span className="hidden lg:inline ml-2 text-xs">
                        {isTranslating[item.id]
                          ? "처리 중..."
                          : "동기화 후 번역"}
                      </span>
                    </Button>
                    <button
                      onClick={() => handleRemoveAdditionalItem(item.id)}
                      className="p-1.5 hover:bg-destructive/10 rounded text-destructive flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="size-4" />
                      <span className="text-xs hidden lg:inline">삭제</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left: Original (KR) */}
                    <div className="space-y-4">
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleAdditionalItemChange(
                            item.id,
                            "name_kr",
                            e.currentTarget.textContent || ""
                          )
                        }
                        data-placeholder="활동/자격증/수상 명칭 (예: 정보처리기사)"
                        className="text-base font-semibold outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent cursor-text min-h-[1.5rem] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                      >
                        {item.name_kr}
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2">
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleAdditionalItemChange(
                                item.id,
                                "description_kr",
                                e.currentTarget.textContent || ""
                              )
                            }
                            data-placeholder="발급기관, 상세 내용, 점수 등 (예: 한국산업인력공단)"
                            className="text-sm text-muted-foreground outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent cursor-text min-h-[1.25rem] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                          >
                            {item.description_kr}
                          </div>
                        </div>
                        <div className="col-span-1">
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleAdditionalItemChange(
                                item.id,
                                "date",
                                e.currentTarget.textContent || ""
                              )
                            }
                            data-placeholder="YYYY.MM"
                            className="text-sm text-muted-foreground font-medium outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent cursor-text min-h-[1.25rem] text-right empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                          >
                            {item.date}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Translated (EN) */}
                    <div className="space-y-4">
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleAdditionalItemChange(
                            item.id,
                            "name_en",
                            e.currentTarget.textContent || ""
                          )
                        }
                        data-placeholder="Item Name (EN)"
                        className="text-base font-semibold outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent cursor-text min-h-[1.5rem] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                      >
                        {item.name_en}
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2">
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleAdditionalItemChange(
                                item.id,
                                "description_en",
                                e.currentTarget.textContent || ""
                              )
                            }
                            data-placeholder="Description/Issuer/Level (EN)"
                            className="text-sm text-muted-foreground outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent cursor-text min-h-[1.25rem] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                          >
                            {item.description_en}
                          </div>
                        </div>
                        <div className="col-span-1">
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              handleAdditionalItemChange(
                                item.id,
                                "date",
                                e.currentTarget.textContent || ""
                              )
                            }
                            data-placeholder="YYYY.MM"
                            className="text-sm text-muted-foreground font-medium outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent cursor-text min-h-[1.25rem] text-right empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                          >
                            {item.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => handleAddAdditionalItem("CERTIFICATION")}
                className="w-full h-11 border-dashed hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
              >
                <Plus className="size-4 mr-2" />
                항목 추가 (Add Item)
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          size="lg"
          className="flex-1"
          disabled={isLoading}
        >
          {isEditingExisting ? "새로 만들기" : "이전"}
        </Button>

        <Button
          onClick={() =>
            onNext({
              personalInfo,
              experiences,
              educations,
              skills,
              additionalItems,
            })
          }
          size="lg"
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            <>
              다음
              <ArrowRight className="size-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
