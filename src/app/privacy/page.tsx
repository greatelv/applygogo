export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <section>
          <p>
            케익코퍼레이션(이하 "회사")은 정보통신망 이용촉진 및 정보보호 등에
            관한 법률, 개인정보보호법 등 관련 법령에 따라 이용자의 개인정보를
            보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기
            위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            제1조 (개인정보의 수집 및 이용 목적)
          </h2>
          <p>
            회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는
            개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이
            변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할
            예정입니다.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <span className="font-medium text-foreground">
                회원 가입 및 관리:
              </span>{" "}
              회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정
              이용 방지와 비인가 사용 방지, 가입 의사 확인, 연령확인, 불만처리
              등 민원처리, 고지사항 전달
            </li>
            <li>
              <span className="font-medium text-foreground">서비스 제공:</span>{" "}
              AI 이력서 생성, 번역, 요약, PDF 변환, 콘텐츠 제공, 맞춤 서비스
              제공
            </li>
            <li>
              <span className="font-medium text-foreground">
                마케팅 및 광고에의 활용:
              </span>{" "}
              신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보
              제공 및 참여기회 제공
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            제2조 (수집하는 개인정보의 항목)
          </h2>
          <p>
            회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를
            수집하고 있습니다.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>필수항목: 이름, 이메일 주소, 프로필 이미지 (소셜 로그인 시)</li>
            <li>
              서비스 이용 과정에서 수집되는 정보: 접속 로그, 쿠키, 접속 IP 정보,
              이력서 데이터(경력, 학력, 기술 스택 등)
            </li>
            <li>
              결제 시 수집되는 정보: 카드사명, 카드번호(일부), 결제 승인 내역
              (PG사를 통해 처리됨)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            제3조 (개인정보의 보유 및 이용 기간)
          </h2>
          <p>
            회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
            개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
            개인정보를 처리·보유합니다.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              회원 가입 및 관리: 회원 탈퇴 시까지 (단, 관계 법령에 위반에 따른
              수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지)
            </li>
            <li>
              재화 또는 서비스 제공: 재화·서비스 공급완료 및 요금결제·정산 완료
              시까지
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            제4조 (개인정보의 파기절차 및 방법)
          </h2>
          <p>
            회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당
            정보를 지체 없이 파기합니다. 전자적 파일 형태의 정보는 기록을 재생할
            수 없는 기술적 방법을 사용하여 삭제합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            제5조 (개인정보 보호책임자)
          </h2>
          <p>
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
            처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와
            같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <div className="mt-4 p-4 bg-muted rounded-md text-sm">
            <p>
              <span className="font-semibold">책임자:</span> 전태경 대표
            </p>
            <p>
              <span className="font-semibold">담당부서:</span> 개인정보보호팀
            </p>
            <p>
              <span className="font-semibold">이메일:</span>{" "}
              patakeique@gmail.com
            </p>
          </div>
        </section>

        <hr className="my-8 border-border" />

        <div className="text-sm">
          <p>공고일자: 2026년 1월 9일</p>
          <p>시행일자: 2026년 1월 9일</p>
        </div>
      </div>
    </div>
  );
}
