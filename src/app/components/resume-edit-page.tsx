"use client";

import Link from "next/link";
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
  GripVertical,
} from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { motion, AnimatePresence } from "motion/react";
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
  Experience,
  TranslatedExperience,
  Education,
  Skill,
  PersonalInfo,
  ItemType,
  AdditionalItem,
} from "./resume-edit/types";
import { ItemTypes } from "./resume-edit/constants";

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
  isLoading = false, // Default to false
  onNext,
  onBack,
  onRetranslate,
  onDeductCredit,
}: ResumeEditPageProps) {
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
    newSkill,

    // Setters
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
            한글 내용을 수정하고 <strong>[동기화 후 재번역]</strong> 버튼을
            누르면 AI가 변경된 내용에 맞춰 다시 번역해줍니다. 불필요한 항목은
            휴지통 아이콘을 눌러 삭제하세요.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Personal Info */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">기본 정보</h2>
          <p className="text-sm text-muted-foreground">
            이름, 연락처, 프로페셔널 요약 등 필수 인적 사항을 관리합니다.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-6 py-4 border-b border-border relative">
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  {isTranslating.personal ? "처리 중..." : "동기화 후 재번역"}
                </span>
              </Button>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Korean Info */}
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground font-semibold mb-1 lg:hidden">
                  한글 (원본)
                </p>
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
                    className="text-lg sm:text-xl font-semibold outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[36px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
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
                      className="text-base sm:text-sm outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[24px]"
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
                      className="text-base sm:text-sm outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[24px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
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
                            data-placeholder="링크 URL"
                            className="text-base sm:text-sm outline-none px-2 py-1 rounded transition-colors hover:bg-accent focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text text-muted-foreground col-span-2 break-all empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
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
                <p className="text-xs text-muted-foreground font-semibold mb-1 lg:hidden">
                  English (번역)
                </p>
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
                      className="text-base sm:text-sm outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text break-all min-h-[24px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
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
                      className="text-base sm:text-sm outline-none px-2 py-1 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text"
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
                            data-placeholder="Link URL"
                            className="text-base sm:text-sm outline-none px-2 py-1 rounded transition-colors hover:bg-accent focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text text-muted-foreground col-span-2 break-all empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
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
                  <p className="text-xs text-muted-foreground font-semibold mb-1 lg:hidden">
                    한글 (원본)
                  </p>
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
                    className="w-full text-base sm:text-sm outline-none px-2 py-2 -mx-2 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[60px] whitespace-pre-wrap leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30"
                  >
                    {personalInfo.summary_kr}
                  </div>
                </div>

                {/* English Summary */}
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1 lg:hidden">
                    English (번역)
                  </p>
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
                    className={`w-full text-base sm:text-sm outline-none px-2 py-2 -mx-2 rounded transition-all duration-1000 hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[60px] whitespace-pre-wrap leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30 ${
                      highlightedPersonal.summary
                        ? "bg-yellow-100 dark:bg-yellow-500/20 ring-1 ring-yellow-400/50"
                        : ""
                    }`}
                  >
                    {personalInfo.summary}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Experiences */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">경력</h2>
            <p className="text-sm text-muted-foreground">
              주요 경력사항과 업무 성과를 최신순으로 작성해주세요.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleAddExperience}
            className="h-9 px-4 shadow-sm text-sm font-semibold"
          >
            <Plus className="size-4 mr-1.5" />
            항목 추가
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
            />
          ))}

          {/* Educations */}
          <div className="mt-12">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">학력사항</h2>
                <p className="text-sm text-muted-foreground">
                  최종 학력부터 학위 및 전공 정보를 입력해주세요.
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleAddEducation}
                className="h-9 px-4 shadow-sm text-sm font-semibold"
              >
                <Plus className="size-4 mr-1.5" />
                항목 추가
              </Button>
            </div>
            <div className="space-y-6">
              {educations.length === 0 && (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    위의{" "}
                    <span className="font-medium text-foreground">
                      + 항목 추가
                    </span>{" "}
                    버튼을 눌러 학력을 추가해주세요.
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
                />
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">기술 스택</h2>
              <p className="text-sm text-muted-foreground">
                보유한 핵심 기술 및 도구들을 태그로 관리해보세요.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
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
                    className="h-9 sm:h-8 text-base sm:text-sm w-full sm:w-32"
                  />
                  <Button
                    onClick={handleAddSkill}
                    variant="secondary"
                    size="sm"
                    className="h-9 sm:h-8 px-3 sm:px-2"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Items */}
          <div className="mt-12">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">추가 정보</h2>
                <p className="text-sm text-muted-foreground">
                  자격증, 수상경력, 언어, 활동, 기타 정보를 추가할 수 있습니다.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleAddAdditionalItem("CERTIFICATION")}
                className="h-9 px-4 shadow-sm text-sm font-semibold"
              >
                <Plus className="size-4 mr-1.5" />
                항목 추가
              </Button>
            </div>
            <div className="space-y-8">
              {additionalItems.length === 0 && (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    위의{" "}
                    <span className="font-medium text-foreground">
                      + 항목 추가
                    </span>{" "}
                    버튼을 눌러 자격증, 수상, 활동 등을 추가해주세요.
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
          className="flex-1 h-12 sm:h-auto text-base"
          disabled={isLoading}
        >
          {isEditingExisting ? "새로 만들기" : "이전"}
        </Button>

        <Button
          onClick={() => {
            // Filter empty data before proceeding (Compact)
            const compactedPersonalInfo = {
              ...personalInfo,
              links: personalInfo.links.filter(
                (link) => link.url && link.url.trim() !== ""
              ),
            };

            const compactedExperiences = experiences.filter(
              (exp) =>
                (exp.company && exp.company.trim() !== "") ||
                (exp.companyEn && exp.companyEn.trim() !== "")
            );

            const compactedEducations = educations.filter(
              (edu) =>
                (edu.school_name && edu.school_name.trim() !== "") ||
                (edu.school_name_en && edu.school_name_en.trim() !== "")
            );

            const compactedSkills = skills.filter(
              (skill) => skill.name && skill.name.trim() !== ""
            );

            const compactedAdditionalItems = additionalItems.filter(
              (item) =>
                (item.name_kr && item.name_kr.trim() !== "") ||
                (item.name_en && item.name_en.trim() !== "")
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
          className="flex-1 h-12 sm:h-auto text-base"
          isLoading={isLoading}
        >
          {isLoading ? (
            "처리 중..."
          ) : (
            <>
              다음
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
            {alertConfig.showCheckout && (
              <Button
                asChild
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Link href="/settings">이용권 구매하기</Link>
              </Button>
            )}
            <AlertDialogAction
              onClick={() =>
                setAlertConfig((prev) => ({
                  ...prev,
                  open: false,
                  showCheckout: false,
                }))
              }
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
