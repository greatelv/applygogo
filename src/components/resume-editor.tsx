"use client";

import { useFieldArray, useForm } from "react-hook-form";
import {
  type Resume,
  type WorkExperience,
  type Education,
  type Skill,
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { updateResume } from "@/app/actions";
import { toast } from "sonner";
import { useState } from "react";
import dynamic from "next/dynamic";
import { type ResumePDFData } from "./resume-pdf";
import { useRouter } from "next/navigation";

// Dynamically import PDF button to avoid styling/DOM mismatch during SSR
const DownloadResumeButton = dynamic(() => import("./download-resume-button"), {
  ssr: false,
});

// Define the shape of the form data, handling JSON fields properly
export type ResumeFormData = {
  id: string;
  title: string;
  targetRole: string | null;
  workExperiences: {
    companyNameKr: string;
    companyNameEn: string | null;
    roleKr: string;
    roleEn: string | null;
    startDate: string;
    endDate: string;
    bulletsKr: string[];
    bulletsEn: string[];
    // Include id for keys in rendering if needed, but not strictly for update
    id?: string;
  }[];
  educations: {
    schoolName: string;
    major: string;
    degree: string;
    startDate: string;
    endDate: string;
    id?: string;
  }[];
  skills: {
    name: string;
    level: string | null;
    id?: string;
  }[];
};

interface ResumeEditorProps {
  initialData: Resume & {
    workExperiences: WorkExperience[];
    educations: Education[];
    skills: Skill[];
    user: {
      name: string | null;
      email: string | null;
      phoneNumber: string | null;
    };
  };
}

export function ResumeEditor({ initialData }: ResumeEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Transform initial data to match form shape (JSON handling)
  const defaultValues: ResumeFormData = {
    id: initialData.id,
    title: initialData.title,
    targetRole: initialData.targetRole,
    workExperiences: initialData.workExperiences.map((exp) => ({
      ...exp,
      bulletsKr: Array.isArray(exp.bulletsKr)
        ? (exp.bulletsKr as string[])
        : [],
      bulletsEn: Array.isArray(exp.bulletsEn)
        ? (exp.bulletsEn as string[])
        : [],
    })),
    educations: initialData.educations,
    skills: initialData.skills,
  };

  const { register, control, handleSubmit, watch } = useForm<ResumeFormData>({
    defaultValues,
  });

  const formData = watch();

  // Prepare data for PDF generation (merging form data with user info)
  const pdfData: ResumePDFData = {
    title: formData.title || initialData.title,
    targetRole: formData.targetRole,
    // @ts-ignore - mismatch between form shape and Prisma shape slightly but compatible for PDF
    workExperiences:
      formData.workExperiences?.map((exp) => ({
        ...exp,
        bulletsEn: exp.bulletsEn, // Ensure string[] is passed
      })) || [],
    educations: formData.educations || [],
    skills: formData.skills || [],
    user: initialData.user,
  };

  // Field Arrays for dynamic lists
  const {
    fields: workFields,
    append: appendWork,
    remove: removeWork,
  } = useFieldArray({
    control,
    name: "workExperiences",
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({
    control,
    name: "educations",
  });

  const {
    fields: skillFields, // Fixed: was using eduFields copy paste error previously? No, it was correct in previous file content
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: "skills",
  });

  const onSubmit = async (data: ResumeFormData) => {
    setIsSaving(true);
    try {
      await updateResume(data);
      toast.success("이력서가 저장되었습니다.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">이력서 편집</h2>
          <p className="text-muted-foreground">
            AI가 분석한 내용을 검토하고 수정하세요.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DownloadResumeButton
            data={pdfData}
            fileName={`${formData.title || "Resume"}.pdf`}
          />
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                저장하기
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>이력서 제목</Label>
              <Input {...register("title")} />
            </div>
            <div className="space-y-2">
              <Label>목표 직무 (Target Role)</Label>
              <Input
                {...register("targetRole")}
                placeholder="예: Frontend Developer"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="experience" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="experience">경력 (Experience)</TabsTrigger>
            <TabsTrigger value="education">학력 (Education)</TabsTrigger>
            <TabsTrigger value="skills">스킬 (Skills)</TabsTrigger>
          </TabsList>

          <TabsContent value="experience" className="space-y-4 mt-4">
            {workFields.map((field, index) => (
              <Card key={field.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 text-muted-foreground hover:text-destructive"
                  onClick={() => removeWork(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardHeader>
                  <CardTitle className="text-base">경력 #{index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  {/* Basic Info Split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        회사명 (KR)
                      </Label>
                      <Input
                        {...register(`workExperiences.${index}.companyNameKr`)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Company Name (EN)
                      </Label>
                      <Input
                        {...register(`workExperiences.${index}.companyNameEn`)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        직무 (KR)
                      </Label>
                      <Input {...register(`workExperiences.${index}.roleKr`)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Role (EN)
                      </Label>
                      <Input {...register(`workExperiences.${index}.roleEn`)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        시작일
                      </Label>
                      <Input
                        {...register(`workExperiences.${index}.startDate`)}
                        placeholder="YYYY.MM"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        종료일
                      </Label>
                      <Input
                        {...register(`workExperiences.${index}.endDate`)}
                        placeholder="YYYY.MM or Present"
                      />
                    </div>
                  </div>

                  {/* Bullets using nested Field Array component would be cleaner, but simple Input map for now to MVP */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>상세 성과 (KR)</Label>
                      {/* For simplicity in MVP, we treat bullets as a single textarea joined by newlines, or handled by a specialized component. 
                          Let's try a simple approach first: Textarea that we split/join on submit? 
                          Actually, react-hook-form handles objects well. Let's provide a Textarea for editing RAW bullets line-by-line.
                      */}
                      {/* Note: This is a simplification. Ideally individual inputs. 
                          But keeping it simple: We will map string[] to boolean? No, let's use a specialized sub-component if possible.
                          Or, simply render them as a set of inputs. */}
                      <BulletedListEditor
                        control={control}
                        name={`workExperiences.${index}.bulletsKr`}
                        label="Korean Bullets"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Achievements (EN)</Label>
                      <BulletedListEditor
                        control={control}
                        name={`workExperiences.${index}.bulletsEn`}
                        label="English Bullets"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                appendWork({
                  companyNameKr: "",
                  companyNameEn: "",
                  roleKr: "",
                  roleEn: "",
                  startDate: "",
                  endDate: "",
                  bulletsKr: [],
                  bulletsEn: [],
                  id: "temp-" + Date.now(),
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> 경력 추가
            </Button>
          </TabsContent>

          <TabsContent value="education" className="space-y-4 mt-4">
            {eduFields.map((field, index) => (
              <Card key={field.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 text-muted-foreground hover:text-destructive"
                  onClick={() => removeEdu(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardHeader>
                  <CardTitle className="text-base">학력 #{index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>학교명</Label>
                    <Input {...register(`educations.${index}.schoolName`)} />
                  </div>
                  <div className="space-y-2">
                    <Label>전공</Label>
                    <Input {...register(`educations.${index}.major`)} />
                  </div>
                  <div className="space-y-2">
                    <Label>학위</Label>
                    <Input {...register(`educations.${index}.degree`)} />
                  </div>
                  <div className="space-y-2">
                    <Label>기간</Label>
                    <div className="flex gap-2">
                      <Input
                        {...register(`educations.${index}.startDate`)}
                        placeholder="Start"
                      />
                      <Input
                        {...register(`educations.${index}.endDate`)}
                        placeholder="End"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                appendEdu({
                  schoolName: "",
                  major: "",
                  degree: "",
                  startDate: "",
                  endDate: "",
                  id: "temp-" + Date.now(),
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> 학력 추가
            </Button>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>기술 스택</CardTitle>
                <CardDescription>보유한 기술을 나열하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {skillFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        {...register(`skills.${index}.name`)}
                        placeholder="Skill Name"
                      />
                      <Input
                        {...register(`skills.${index}.level`)}
                        placeholder="Level"
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        onClick={() => removeSkill(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() =>
                    appendSkill({
                      name: "",
                      level: "",
                      id: "temp-" + Date.now(),
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> 스킬 추가
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </form>
  );
}

// Helper component for editing string arrays (bullets)
// This is a simplified version using useFieldArray would be better but requires passing control/name dynamically properly typed.
// For now, let's just make it a textarea that joins with newlines for simplicity?
// No, separate inputs allow for better granular control.
function BulletedListEditor({
  control,
  name,
  label,
}: {
  control: any;
  name: string;
  label: string;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2">
          {/* We need to use valid array path here. 
              The parent name passed is like "workExperiences.0.bulletsKr"
          */}
          <Input
            // @ts-ignore - dynamic naming is tricky with typed RHF
            {...control.register(`${name}.${index}`)}
            className="text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground h-8"
        onClick={() => append("")}
      >
        <Plus className="mr-2 h-3 w-3" /> Add Item
      </Button>
    </div>
  );
}
