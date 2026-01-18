import { useState } from "react";
import {
  AdditionalItem,
  Education,
  Experience,
  ItemType,
  PersonalInfo,
  Skill,
  TranslatedExperience,
} from "./types";

interface UseResumeEditorProps {
  initialPersonalInfo?: PersonalInfo;
  initialExperiences?: TranslatedExperience[];
  initialEducations?: Education[];
  initialSkills?: Skill[];
  initialAdditionalItems?: AdditionalItem[];
  resumeId?: string | null;
  onDeductCredit?: (amount: number) => void;
}

export const useResumeEditor = ({
  initialPersonalInfo,
  initialExperiences,
  initialEducations,
  initialSkills,
  initialAdditionalItems,
  resumeId,
  onDeductCredit,
}: UseResumeEditorProps) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(
    initialPersonalInfo || {
      name_kr: "",
      name_en: "",
      email: "",
      phone: "",
      links: [],
      summary: "",
      summary_kr: "",
    },
  );
  const [experiences, setExperiences] = useState<TranslatedExperience[]>(
    initialExperiences || [],
  );
  const [educations, setEducations] = useState<Education[]>(
    initialEducations || [],
  );
  const [skills, setSkills] = useState<Skill[]>(initialSkills || []);
  const [additionalItems, setAdditionalItems] = useState<AdditionalItem[]>(
    initialAdditionalItems || [],
  );

  // Baseline states for change detection (reset after successful translation)
  const [baselinePersonalInfo, setBaselinePersonalInfo] =
    useState<PersonalInfo>(
      initialPersonalInfo || {
        name_source: "",
        name_target: "",
        email: "",
        phone: "",
        links: [],
        summary_source: "",
        summary_target: "",
      },
    );
  const [baselineExperiences, setBaselineExperiences] = useState<
    TranslatedExperience[]
  >(initialExperiences || []);

  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>(
    {},
  );
  const [highlightedBullets, setHighlightedBullets] = useState<
    Record<string, number[]>
  >({});
  const [highlightedPersonal, setHighlightedPersonal] = useState<
    Record<string, boolean>
  >({});
  const [newSkill, setNewSkill] = useState("");

  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    showCheckout?: boolean;
  }>({
    open: false,
    title: "",
    description: "",
  });

  // Handlers for New Sections
  const handleAdditionalItemChange = (
    id: string,
    field: keyof AdditionalItem,
    value: any,
  ) => {
    setAdditionalItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleAddAdditionalItem = (type: ItemType = "CERTIFICATION") => {
    const newItem: AdditionalItem = {
      id: `add-${Date.now()}`,
      type,
      name_source: "",
      name_target: "",
      description_source: "",
      description_target: "",
      date: "",
    };
    setAdditionalItems((prev) => [newItem, ...prev]);
  };

  const handleRemoveAdditionalItem = (id: string) => {
    setAdditionalItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Experience Handlers
  const handleExperienceChange = (
    id: string,
    field: keyof TranslatedExperience,
    value: string,
  ) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    );
  };

  const handleBulletEdit = (
    expId: string,
    index: number,
    value: string,
    isEnglish: boolean,
  ) => {
    setExperiences((prev) =>
      prev.map((exp) => {
        if (isEnglish) {
          const newBulletsTarget = [...(exp.bullets_target || [])];
          newBulletsTarget[index] = value;
          return { ...exp, bullets_target: newBulletsTarget };
        } else {
          const newBulletsSource = [...exp.bullets_source];
          newBulletsSource[index] = value;
          return { ...exp, bullets_source: newBulletsSource };
        }
      }),
    );
  };

  const handleAddBullet = (expId: string) => {
    setExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id !== expId) return exp;
        return {
          ...exp,
          bullets_source: [...exp.bullets_source, ""],
          bullets_target: [...(exp.bullets_target || []), ""],
        };
      }),
    );
  };

  const handleRemoveBullet = (expId: string, index: number) => {
    setExperiences((prev) =>
      prev.map((exp) => {
        if (exp.id !== expId) return exp;
        return {
          ...exp,
          bullets_source: exp.bullets_source.filter((_, i) => i !== index),
          bullets_target: (exp.bullets_target || []).filter(
            (_, i) => i !== index,
          ),
        };
      }),
    );
  };

  const handleAddExperience = () => {
    const newExp: TranslatedExperience = {
      id: `new-${Date.now()}`,
      company_source: "",
      company_target: "",
      position_source: "",
      position_target: "",
      period: "",
      bullets_source: [""],
      bullets_target: [""],
    };
    setExperiences((prev) => [newExp, ...prev]);
    // Also add to baseline as empty so it doesn't trigger "changed" logic incorrectly if valid
    setBaselineExperiences((prev) => [newExp, ...prev]);
  };

  const handleAddEducation = () => {
    const newEdu: Education = {
      id: `new-${Date.now()}`,
      school_name_source: "",
      school_name_target: "",
      major_source: "",
      major_target: "",
      degree_source: "",
      degree_target: "",
      start_date: "",
      end_date: "",
    };
    setEducations((prev) => [newEdu, ...prev]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id));
    setBaselineExperiences((prev) => prev.filter((e) => e.id !== id));
  };

  const handleRemoveEducation = (id: string) => {
    setEducations((prev) => prev.filter((e) => e.id !== id));
  };

  const moveExperience = (dragIndex: number, hoverIndex: number) => {
    const dragItem = experiences[dragIndex];
    if (!dragItem) return;
    const newExperiences = [...experiences];
    newExperiences.splice(dragIndex, 1);
    newExperiences.splice(hoverIndex, 0, dragItem);
    setExperiences(newExperiences);
  };

  const moveEducation = (dragIndex: number, hoverIndex: number) => {
    const dragItem = educations[dragIndex];
    if (!dragItem) return;
    const newEducations = [...educations];
    newEducations.splice(dragIndex, 1);
    newEducations.splice(hoverIndex, 0, dragItem);
    setEducations(newEducations);
  };

  const moveAdditionalItem = (dragIndex: number, hoverIndex: number) => {
    const dragItem = additionalItems[dragIndex];
    if (!dragItem) return;
    const newItems = [...additionalItems];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, dragItem);
    setAdditionalItems(newItems);
  };

  const handleRetranslateExperience = async (expId: string) => {
    const currentExp = experiences.find((e) => e.id === expId);
    if (!currentExp) return;

    // 1. Cleanup and Trim
    const trimmedCompany = currentExp.company_source?.trim() || "";
    const trimmedPosition = currentExp.position_source?.trim() || "";
    const trimmedPeriod = currentExp.period?.trim() || "";
    const trimmedBullets = currentExp.bullets_source
      .map((b) => b?.trim() || "")
      .filter((b) => b.length > 0);

    // Check if empty (if everything is empty, maybe remove it?)
    if (
      !trimmedCompany &&
      !trimmedPosition &&
      !trimmedPeriod &&
      trimmedBullets.length === 0
    ) {
      handleRemoveExperience(expId);
      return;
    }

    // Update state with trimmed values
    const newBulletsSource = trimmedBullets.length > 0 ? trimmedBullets : [""];
    const newBulletsTarget =
      trimmedBullets.length > 0
        ? trimmedBullets.map((_, i) => currentExp.bullets_target?.[i] || "")
        : [""];

    setExperiences((prev) =>
      prev.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              company_source: trimmedCompany,
              position_source: trimmedPosition,
              period: trimmedPeriod,
              bullets_source: newBulletsSource,
              bullets_target: newBulletsTarget,
            }
          : exp,
      ),
    );

    const baselineExp = baselineExperiences.find((e) => e.id === expId);

    // Check for changes
    const isCompanyChanged = trimmedCompany !== baselineExp?.company_source;
    const isPositionChanged = trimmedPosition !== baselineExp?.position_source;
    const isPeriodChanged = trimmedPeriod !== baselineExp?.period;

    // Find changed or added bullets
    const changedBullets: { index: number; text: string }[] = [];
    newBulletsSource.forEach((bullet, index) => {
      const initialBullet = baselineExp?.bullets_source[index];
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
      setAlertConfig({
        open: true,
        title: "변경 사항 없음",
        description:
          "변경된 내용이 감지되지 않았습니다. 한글 내용을 수정한 후 다시 시도해 주세요.",
      });
      return;
    }

    setIsTranslating((prev) => ({ ...prev, [expId]: true }));

    try {
      const promises = [];

      // 1. Metadata translation
      if (isCompanyChanged || isPositionChanged || isPeriodChanged) {
        const textsToTranslate = [];
        if (isCompanyChanged) textsToTranslate.push(trimmedCompany);
        if (isPositionChanged) textsToTranslate.push(trimmedPosition);
        if (isPeriodChanged) textsToTranslate.push(trimmedPeriod);

        promises.push(
          fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              texts: textsToTranslate,
              type: "general",
              resumeId,
            }),
          }).then(async (res) => {
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              console.error("Experience Meta Translation Error:", {
                status: res.status,
                serverError: errorData.error,
                texts: textsToTranslate,
              });
              throw new Error(errorData.error || "Metadata translation failed");
            }
            return res.json();
          }),
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // 2. Bullets translation
      if (changedBullets.length > 0) {
        const bulletTexts = changedBullets.map((item) => item.text);
        promises.push(
          fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              texts: bulletTexts,
              type: "bullets",
              resumeId,
            }),
          }).then(async (res) => {
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              console.error("Experience Bullets Translation Error:", {
                status: res.status,
                serverError: errorData.error,
                texts: bulletTexts,
              });
              throw new Error(errorData.error || "Bullets translation failed");
            }
            return res.json();
          }),
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // @ts-ignore
      const [metaResult, bulletsResult] = await Promise.all(promises);

      // Construct new item state locally
      // Construct new item state locally
      let newItem = {
        ...currentExp,
        company_source: trimmedCompany,
        position_source: trimmedPosition,
        period: trimmedPeriod,
        bullets_source: newBulletsSource,
        bullets_target: newBulletsTarget,
      };

      if (metaResult) {
        const { translatedTexts } = metaResult;
        let tIndex = 0;
        if (isCompanyChanged)
          newItem.company_target = translatedTexts[tIndex++];
        if (isPositionChanged)
          newItem.position_target = translatedTexts[tIndex++];
        if (isPeriodChanged) newItem.period = translatedTexts[tIndex++]; // period is shared or not? assuming shared or target is same
      }

      if (bulletsResult) {
        const { translatedTexts } = bulletsResult;
        const updatedBulletsTarget = [...(newItem.bullets_target || [])];
        changedBullets.forEach((item, i) => {
          updatedBulletsTarget[item.index] = translatedTexts[i];
        });
        newItem.bullets_target = updatedBulletsTarget;
      }

      setExperiences((prev) => prev.map((e) => (e.id === expId ? newItem : e)));

      // Update baseline
      setBaselineExperiences((prev) => {
        const index = prev.findIndex((e) => e.id === expId);
        if (index >= 0) {
          const newBaseline = [...prev];
          newBaseline[index] = newItem;
          return newBaseline;
        }
        return [...prev, newItem];
      });

      // Highlight logic...
      setHighlightedBullets((prev) => {
        const newState = { ...prev };
        if (changedBullets.length > 0) {
          newState[expId] = changedBullets.map((item) => item.index);
        }
        return newState;
      });

      // Deduct credit
      onDeductCredit?.(1.0);

      setTimeout(() => {
        setHighlightedBullets((prev) => {
          const newState = { ...prev };
          delete newState[expId];
          return newState;
        });
      }, 2000);
    } catch (error: any) {
      console.error("handleRetranslateExperience Error:", error);
      const isCreditError = error.message?.includes("크레딧");
      setAlertConfig({
        open: true,
        title: isCreditError ? "크레딧 부족" : "오류 발생",
        description: error.message || "번역 중 오류가 발생했습니다.",
        showCheckout: isCreditError,
      });
    } finally {
      setIsTranslating((prev) => ({ ...prev, [expId]: false }));
    }
  };

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: any) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleTranslatePersonalInfo = async () => {
    // Check for changes against baseline
    const isNameChanged =
      personalInfo.name_source !== baselinePersonalInfo.name_source;
    const isSummaryChanged =
      personalInfo.summary_source !== baselinePersonalInfo.summary_source;

    // Check link changes
    let isLinksChanged =
      personalInfo.links.length !== baselinePersonalInfo.links.length;
    if (!isLinksChanged) {
      isLinksChanged = personalInfo.links.some((link, i) => {
        const baseLink = baselinePersonalInfo.links[i];
        return link.label !== baseLink.label;
      });
    }

    if (!isNameChanged && !isSummaryChanged && !isLinksChanged) {
      setAlertConfig({
        open: true,
        title: "변경 사항 없음",
        description:
          "변경된 내용이 감지되지 않았습니다. 한글 내용을 수정한 후 다시 시도해 주세요.",
      });
      return;
    }

    setIsTranslating((prev) => ({ ...prev, personal: true }));
    try {
      // Collect name, summary, and all link labels that need translation
      const textsToTranslate = [];
      textsToTranslate.push(personalInfo.name_source);

      const hasSummary = !!personalInfo.summary_source;
      if (hasSummary && personalInfo.summary_source) {
        textsToTranslate.push(personalInfo.summary_source);
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("PersonalInfo Translation API error details:", {
          status: response.status,
          statusText: response.statusText,
          serverError: errorData.error,
          inputTexts: textsToTranslate,
        });
        throw new Error(errorData.error || "Translation failed");
      }

      const { translatedTexts } = await response.json();

      let summaryTarget = personalInfo.summary_target;
      let linkStartIndex = 1;

      if (hasSummary) {
        summaryTarget = translatedTexts[1];
        linkStartIndex = 2;
      }

      const newLinks = [...personalInfo.links];
      translatedTexts
        .slice(linkStartIndex)
        .forEach((translatedLabel: string, i: number) => {
          newLinks[i] = { ...newLinks[i], label: translatedLabel };
        });

      const newPersonalInfo = {
        ...personalInfo,
        name_target: translatedTexts[0],
        summary_target: summaryTarget,
        links: newLinks,
      };

      setPersonalInfo(newPersonalInfo);

      // Update baseline to current state
      setBaselinePersonalInfo(newPersonalInfo);

      // Highlight changed fields
      setHighlightedPersonal({
        name: isNameChanged,
        links: isLinksChanged,
        summary: isSummaryChanged,
      });

      // Deduct credit
      onDeductCredit?.(1.0);

      setTimeout(() => setHighlightedPersonal({}), 2000);
    } catch (error: any) {
      console.error("HandleTranslatePersonalInfo Error:", error);
      const isCreditError = error.message?.includes("크레딧");
      setAlertConfig({
        open: true,
        title: isCreditError ? "크레딧 부족" : "오류 발생",
        description: error.message || "기본 정보 번역 중 오류가 발생했습니다.",
        showCheckout: isCreditError,
      });
    } finally {
      setIsTranslating((prev) => ({ ...prev, personal: false }));
    }
  };

  // Education Handlers
  const handleEducationChange = (
    id: string,
    field: keyof Education,
    value: string,
  ) => {
    setEducations((prev) =>
      prev.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    );
  };

  const handleRetranslateAdditionalItem = async (id: string) => {
    const item = additionalItems.find((i) => i.id === id);
    if (!item) return;

    // 1. Cleanup and Trim
    const trimmedName = item.name_source?.trim() || "";
    const trimmedDesc = item.description_source?.trim() || "";
    const trimmedDate = item.date?.trim() || "";

    // Check if empty
    if (!trimmedName && !trimmedDesc && !trimmedDate) {
      handleRemoveAdditionalItem(id);
      return;
    }

    // Update state with trimmed values
    setAdditionalItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              name_source: trimmedName,
              description_source: trimmedDesc,
              date: trimmedDate,
            }
          : i,
      ),
    );

    setIsTranslating((prev) => ({ ...prev, [id]: true }));

    try {
      const textsToTranslate = [
        item.name_source,
        item.description_source,
      ].filter(Boolean);

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: textsToTranslate,
          type: "general",
          resumeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("AdditionalItem Translation API error details:", {
          status: response.status,
          serverError: errorData.error,
          inputTexts: textsToTranslate,
        });
        throw new Error(errorData.error || "Translation failed");
      }

      const { translatedTexts } = await response.json();

      setAdditionalItems((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          return {
            ...i,
            name_target: translatedTexts[0] || i.name_target,
            description_target: translatedTexts[1] || i.description_target,
          };
        }),
      );
    } catch (error: any) {
      console.error("handleRetranslateAdditionalItem Error:", error);
      const isCreditError = error.message?.includes("크레딧");
      setAlertConfig({
        open: true,
        title: isCreditError ? "크레딧 부족" : "오류 발생",
        description: error.message || "번역 중 오류가 발생했습니다.",
        showCheckout: isCreditError,
      });
    } finally {
      setIsTranslating((prev) => ({ ...prev, [id]: false }));
      // Deduct credit
      onDeductCredit?.(1.0);
    }
  };

  const handleTranslateEducation = async (eduId: string) => {
    const edu = educations.find((e) => e.id === eduId);
    if (!edu) return;

    // 1. Cleanup and Trim
    const trimmedSchool = edu.school_name_source?.trim() || "";
    const trimmedMajor = edu.major_source?.trim() || "";
    const trimmedDegree = edu.degree_source?.trim() || "";
    const trimmedStart = edu.start_date?.trim() || "";
    const trimmedEnd = edu.end_date?.trim() || "";

    // Check if empty
    if (
      !trimmedSchool &&
      !trimmedMajor &&
      !trimmedDegree &&
      !trimmedStart &&
      !trimmedEnd
    ) {
      handleRemoveEducation(eduId);
      return;
    }

    // Update state with trimmed values
    setEducations((prev) =>
      prev.map((e) =>
        e.id === eduId
          ? {
              ...e,
              school_name_source: trimmedSchool,
              major_source: trimmedMajor,
              degree_source: trimmedDegree,
              start_date: trimmedStart,
              end_date: trimmedEnd,
            }
          : e,
      ),
    );

    setIsTranslating((prev) => ({ ...prev, [`edu-${eduId}`]: true }));

    try {
      // Translate School, Major, Degree
      const textsToTranslate = [
        edu.school_name_source,
        edu.major_source,
        edu.degree_source,
      ].filter(Boolean);

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: textsToTranslate,
          type: "general",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Education Translation API error details:", {
          status: response.status,
          serverError: errorData.error,
          inputTexts: textsToTranslate,
        });
        throw new Error(errorData.error || "Translation failed");
      }

      const { translatedTexts } = await response.json();

      setEducations((prev) =>
        prev.map((e) => {
          if (e.id !== eduId) return e;
          return {
            ...e,
            school_name_target: translatedTexts[0] || e.school_name_target,
            major_target: translatedTexts[1] || e.major_target,
            degree_target: translatedTexts[2] || e.degree_target,
          };
        }),
      );
    } catch (error: any) {
      console.error("handleTranslateEducation Error:", error);
      const isCreditError = error.message?.includes("크레딧");
      setAlertConfig({
        open: true,
        title: isCreditError ? "크레딧 부족" : "오류 발생",
        description: error.message || "학력 번역 중 오류가 발생했습니다.",
        showCheckout: isCreditError,
      });
    } finally {
      setIsTranslating((prev) => ({ ...prev, [`edu-${eduId}`]: false }));
      // Deduct credit
      onDeductCredit?.(1.0);
    }
  };

  // Skills Handlers
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const skill: Skill = {
      id: `new-${Date.now()}`,
      name: newSkill.trim(),
      level: "Intermediate", // Default level
    };
    setSkills((prev) => [...prev, skill]);
    setNewSkill("");
  };

  const handleRemoveSkill = (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  };

  return {
    // States
    personalInfo,
    experiences,
    educations,
    skills,
    additionalItems,
    isTranslating,
    alertConfig,
    highlightedBullets,
    highlightedPersonal,
    newSkill,

    // Setters (if needed directly by UI components, though handlers are preferred)
    setPersonalInfo,
    setSkills,
    setNewSkill,
    setAlertConfig,

    // Handlers
    handleAdditionalItemChange,
    handleAddAdditionalItem,
    handleRemoveAdditionalItem,
    handleExperienceChange,
    handleBulletEdit,
    handleAddBullet,
    handleRemoveBullet,
    handleAddExperience,
    handleAddEducation,
    handleRemoveExperience,
    handleRemoveEducation,
    moveExperience,
    moveEducation,
    moveAdditionalItem,
    handleRetranslateExperience,
    handlePersonalInfoChange,
    handleTranslatePersonalInfo,
    handleEducationChange,
    handleRetranslateAdditionalItem,
    handleTranslateEducation,
    handleAddSkill,
    handleRemoveSkill,
  };
};
