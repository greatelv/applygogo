import { FileUpload } from "@/components/file-upload";
import { uploadResume } from "@/app/actions";

export default function NewResumePage() {
  return (
    <div className="container max-w-2xl py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          이력서 업로드
        </h1>
        <p className="text-muted-foreground">
          가지고 계신 국문 이력서(PDF)를 업로드해주세요.
          <br />
          AI가 내용을 분석하여 영문 이력서 초안을 만들어드립니다.
        </p>
      </div>

      <FileUpload action={uploadResume} />
    </div>
  );
}
