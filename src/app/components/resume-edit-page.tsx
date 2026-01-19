"use client";

import { Link } from "@/i18n/routing";
import {
  ArrowRight,
  Plus,
  Trash2,
  Loader2,
  X,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTranslations, useLocale } from "next-intl";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

import {
  Education,
  Skill,
  PersonalInfo,
  ItemType,
  AdditionalItem,
  TranslatedExperience,
} from "./resume-edit/types";

interface ResumeEditPageProps {
  resumeId?: string | null;
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
  onDeductCredit?: (amount: number) => void;
}

import { DraggableAdditionalItem } from "./resume-edit/draggable-additional-item";
import { DraggableEducationItem } from "./resume-edit/draggable-education-item";
import { DraggableExperienceItem } from "./resume-edit/draggable-experience-item";
import { DraggableSkillItem } from "./resume-edit/draggable-skill-item";

import { useResumeEditor } from "./resume-edit/use-resume-editor";

export function ResumeEditPage({
  resumeId,
  resumeTitle,
  initialPersonalInfo,
  initialExperiences,
  initialEducations,
  initialSkills,
  initialAdditionalItems,
  isEditingExisting,
  quota,
  isLoading = false,
  onNext,
  onBack,
  onRetranslate,
  onDeductCredit,
}: ResumeEditPageProps) {
  const t = useTranslations("editPage");
  const locale = useLocale();

  const getSourceLabel = () => {
    if (locale === "en") return "English (Original)";
    if (locale === "ja") return "日本語 (Original)";
    return "한국어 (원본)";
  };

  const getTargetLabel = () => {
    if (locale === "en") return "한국어 (번역본)";
    if (locale === "ja") return "한국어 (번역본)";
    return "English (Translated)";
  };

  const {
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

    // Setters
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
    handleSkillChange,
    moveSkill,
    handleTranslateSkill,
  } = useResumeEditor({
    initialPersonalInfo,
    initialExperiences,
    initialEducations,
    initialSkills,
    initialAdditionalItems,
    resumeId,
    onDeductCredit,
  });

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl mb-2">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg p-4 mb-8 flex items-start gap-3">
        <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded-full mt-0.5">
          <Pencil className="size-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
            {t("guide.title")}
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
            {t.rich("guide.description", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Personal Info */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {t("sections.personal.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("sections.personal.description")}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-6 py-4 border-b border-border relative">
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">
                  {getSourceLabel()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">
                  {getTargetLabel()}
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
                  {isTranslating.personal
                    ? t("actions.processing")
                    : t("actions.retranslate")}
                </span>
              </Button>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Source Info */}
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground font-semibold mb-1 lg:hidden">
                  {getSourceLabel()}
                </p>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase">
                    {t("sections.personal.name")}
                  </label>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handlePersonalInfoChange(
                        "name_source",
                        e.currentTarget.textContent || "",
                      )
                    }
                    data-placeholder={t("sections.personal.name")}
                    className="text-lg sm:text-xl font-semibold outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[36px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {personalInfo.name_source}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase">
                      {t("sections.personal.email")}
                    </label>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handlePersonalInfoChange(
                          "email",
                          e.currentTarget.textContent || "",
                        )
                      }
                      className="text-base sm:text-sm outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[24px]"
                    >
                      {personalInfo.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase">
                      {t("sections.personal.phone")}
                    </label>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handlePersonalInfoChange(
                          "phone",
                          e.currentTarget.textContent || "",
                        )
                      }
                      data-placeholder={t("sections.personal.phone")}
                      className="text-base sm:text-sm outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[24px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                    >
                      {personalInfo.phone}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase">
                    {t("sections.personal.links")}
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
                            data-placeholder="Label"
                            className="text-base sm:text-sm outline-none px-2 py-1 rounded transition-colors hover:bg-accent focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text col-span-1 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
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
                            data-placeholder="URL"
                            className="text-base sm:text-sm outline-none px-2 py-1 rounded transition-colors hover:bg-accent focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text text-muted-foreground col-span-2 break-all empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                          >
                            {link.url}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newLinks = personalInfo.links.filter(
                              (_, i) => i !== index,
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

              {/* Target Info */}
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground font-semibold mb-1 lg:hidden">
                  {getTargetLabel()}
                </p>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase">
                    Name
                  </label>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handlePersonalInfoChange(
                        "name_target",
                        e.currentTarget.textContent || "",
                      )
                    }
                    data-placeholder="Name"
                    className={`font-semibold text-lg outline-none px-2 py-1 -mx-2 rounded transition-all duration-1000 hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30 ${
                      highlightedPersonal.name
                        ? "bg-yellow-100 dark:bg-yellow-500/20 ring-1 ring-yellow-400/50"
                        : ""
                    }`}
                  >
                    {personalInfo.name_target}
                  </div>
                </div>

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
                          e.currentTarget.textContent || "",
                        )
                      }
                      className="text-base sm:text-sm outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text break-all min-h-[24px]"
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
                          e.currentTarget.textContent || "",
                        )
                      }
                      className="text-base sm:text-sm outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text"
                    >
                      {personalInfo.phone}
                    </div>
                  </div>
                </div>

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
                            data-placeholder="Label"
                            className="text-base sm:text-sm outline-none px-2 py-1 rounded transition-colors hover:bg-accent focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text col-span-1 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
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
                            data-placeholder="URL"
                            className="text-base sm:text-sm outline-none px-2 py-1 rounded transition-colors hover:bg-accent focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text text-muted-foreground col-span-2 break-all empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                          >
                            {link.url}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newLinks = personalInfo.links.filter(
                              (_, i) => i !== index,
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
                <Plus className="size-4 mr-2" />{" "}
                {t("sections.personal.addLink")}
              </Button>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-4">
                {t("sections.personal.summary")}
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1 lg:hidden">
                    {getSourceLabel()}
                  </p>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handlePersonalInfoChange(
                        "summary_source",
                        e.currentTarget.textContent || "",
                      )
                    }
                    data-placeholder={t("sections.personal.summary")}
                    className="w-full text-base sm:text-sm outline-none px-2 py-2 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[60px] whitespace-pre-wrap leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {personalInfo.summary_source}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1 lg:hidden">
                    {getTargetLabel()}
                  </p>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handlePersonalInfoChange(
                        "summary_target",
                        e.currentTarget.textContent || "",
                      )
                    }
                    data-placeholder="Summary"
                    className={`w-full text-base sm:text-sm outline-none px-2 py-2 -mx-2 rounded transition-all duration-1000 hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[60px] whitespace-pre-wrap leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30 ${
                      highlightedPersonal.summary
                        ? "bg-yellow-100 dark:bg-yellow-500/20 ring-1 ring-yellow-400/50"
                        : ""
                    }`}
                  >
                    {personalInfo.summary_target}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Experiences */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">
              {t("sections.experience.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("sections.experience.description")}
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleAddExperience}
            className="h-9 px-4 shadow-sm text-sm font-semibold"
          >
            <Plus className="size-4 mr-1.5" />
            {t("sections.experience.addItem")}
          </Button>
        </div>
        <DndProvider backend={HTML5Backend}>
          {experiences.map((exp, index) => (
            <DraggableExperienceItem
              key={exp.id}
              index={index}
              exp={exp}
              moveExperience={moveExperience}
              isTranslating={!!isTranslating[exp.id]}
              onRetranslate={handleRetranslateExperience}
              onRemove={handleRemoveExperience}
              onChange={handleExperienceChange}
              onBulletEdit={handleBulletEdit}
              onAddBullet={handleAddBullet}
              onRemoveBullet={handleRemoveBullet}
              highlightedBullets={highlightedBullets[exp.id]}
              sourceLabel={getSourceLabel()}
              targetLabel={getTargetLabel()}
            />
          ))}

          {/* Educations */}
          <div className="mt-12">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  {t("sections.education.title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("sections.education.description")}
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleAddEducation}
                className="h-9 px-4 shadow-sm text-sm font-semibold"
              >
                <Plus className="size-4 mr-1.5" />
                {t("sections.education.addItem")}
              </Button>
            </div>
            <div className="space-y-6">
              {educations.length === 0 && (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t.rich("sections.education.empty", {
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </p>
                </div>
              )}
              {educations.map((edu, index) => (
                <DraggableEducationItem
                  key={edu.id}
                  index={index}
                  edu={edu}
                  moveEducation={moveEducation}
                  isTranslating={!!isTranslating[`edu-${edu.id}`]}
                  onTranslate={handleTranslateEducation}
                  onRemove={handleRemoveEducation}
                  onChange={handleEducationChange}
                  sourceLabel={getSourceLabel()}
                  targetLabel={getTargetLabel()}
                />
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="mt-12">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {t("sections.skills.title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("sections.skills.description")}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleAddSkill()}
                className="h-9 px-4 shadow-sm text-sm font-semibold"
              >
                <Plus className="size-4 mr-1.5" />
                {t("sections.skills.addItem")}
              </Button>
            </div>

            <div className="space-y-6">
              {skills.length === 0 && (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t.rich("sections.skills.empty", {
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </p>
                </div>
              )}
              {skills.map((skill, index) => (
                <DraggableSkillItem
                  key={skill.id}
                  index={index}
                  skill={skill}
                  moveSkill={moveSkill}
                  isTranslating={!!isTranslating[`skill-${skill.id}`]}
                  onTranslate={handleTranslateSkill}
                  onRemove={handleRemoveSkill}
                  onChange={handleSkillChange}
                  sourceLabel={getSourceLabel()}
                  targetLabel={getTargetLabel()}
                />
              ))}
            </div>
          </div>

          {/* Additional Items */}
          <div className="mt-12">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  {t("sections.additional.title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("sections.additional.description")}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleAddAdditionalItem("CERTIFICATION")}
                className="h-9 px-4 shadow-sm text-sm font-semibold"
              >
                <Plus className="size-4 mr-1.5" />
                {t("sections.additional.addItem")}
              </Button>
            </div>
            <div className="space-y-8">
              {additionalItems.length === 0 && (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t.rich("sections.additional.empty", {
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </p>
                </div>
              )}
              {additionalItems.map((item, index) => (
                <DraggableAdditionalItem
                  key={item.id}
                  index={index}
                  item={item}
                  moveAdditionalItem={moveAdditionalItem}
                  isTranslating={!!isTranslating[item.id]}
                  onRetranslate={handleRetranslateAdditionalItem}
                  onRemove={handleRemoveAdditionalItem}
                  onChange={handleAdditionalItemChange}
                  sourceLabel={getSourceLabel()}
                  targetLabel={getTargetLabel()}
                />
              ))}
            </div>
          </div>
        </DndProvider>
      </div>

      <div className="mt-12 flex gap-3 fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-50 sm:static sm:bg-transparent sm:border-0 sm:p-0">
        <Button
          variant="outline"
          onClick={onBack}
          size="lg"
          className="flex-1 h-12 sm:h-11 text-base"
          disabled={isLoading}
        >
          {isEditingExisting ? t("actions.createNew") : t("actions.previous")}
        </Button>

        <Button
          onClick={() => {
            // Filter empty data before proceeding (Compact)
            const compactedPersonalInfo = {
              ...personalInfo,
              links: personalInfo.links.filter(
                (link) => link.url && link.url.trim() !== "",
              ),
            };

            const compactedExperiences = experiences.filter(
              (exp) =>
                (exp.company_name_source &&
                  exp.company_name_source.trim() !== "") ||
                (exp.company_name_target &&
                  exp.company_name_target.trim() !== ""),
            );

            const compactedEducations = educations.filter(
              (edu) =>
                (edu.school_name_source &&
                  edu.school_name_source.trim() !== "") ||
                (edu.school_name_target &&
                  edu.school_name_target.trim() !== ""),
            );

            const compactedSkills = skills.filter(
              (skill) =>
                (skill.name_source && skill.name_source.trim() !== "") ||
                (skill.name_target && skill.name_target.trim() !== ""),
            );

            const compactedAdditionalItems = additionalItems.filter(
              (item) =>
                (item.name_source && item.name_source.trim() !== "") ||
                (item.name_target && item.name_target.trim() !== ""),
            );

            onNext({
              personalInfo: compactedPersonalInfo,
              experiences: compactedExperiences,
              educations: compactedEducations,
              skills: compactedSkills,
              additionalItems: compactedAdditionalItems,
            });
          }}
          size="lg"
          className="flex-1 h-12 sm:h-11 text-base"
          isLoading={isLoading}
        >
          {isLoading ? (
            t("actions.processing")
          ) : (
            <>
              {t("actions.next")}
              <ArrowRight className="size-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      <AlertDialog
        open={alertConfig.open}
        onOpenChange={(open) => setAlertConfig((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                if (alertConfig.showCheckout) {
                  // Navigate to pricing or handle logic
                }
                setAlertConfig((prev) => ({ ...prev, open: false }));
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
