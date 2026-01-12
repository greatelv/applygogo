export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">이용약관</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            제1조 (목적)
          </h2>
          <p>
            본 약관은 케익코퍼레이션(이하 "회사")이 운영하는 지원고고
            서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무
            및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            제2조 (용어의 정의)
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              "서비스"라 함은 회사가 제공하는 AI 기반 이력서 변환 및 관련 제반
              서비스를 의미합니다.
            </li>
            <li>
              "회원"이라 함은 회사와 서비스 이용계약을 체결하고 회사가 제공하는
              서비스를 이용하는 자를 말합니다.
            </li>
            <li>
              "유료 서비스"라 함은 회사가 유료로 제공하는 각종 디지털 콘텐츠 및
              제반 서비스를 의미합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            제3조 (약관의 효력 및 변경)
          </h2>
          <p>
            회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에
            게시합니다. 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을
            개정할 수 있으며, 개정 시에는 적용일자 및 개정사유를 명시하여 현행
            약관과 함께 서비스 초기 화면에 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            제4조 (회원가입)
          </h2>
          <p>
            회원가입은 이용자가 약관 내용에 동의하고 가입 신청을 한 후, 회사가
            이러한 신청에 대하여 승낙함으로써 체결됩니다. 회사는 다음 각 호에
            해당하는 경우 승낙을 유보하거나 거절할 수 있습니다.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              가입 신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는
              경우
            </li>
            <li>타인의 명의를 도용한 경우</li>
            <li>
              허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은
              경우
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            제5조 (서비스의 제공 및 변경)
          </h2>
          <p>
            회사는 회원에게 AI 이력서 요약, 번역, PDF 변환 등의 서비스를
            제공합니다. 회사는 기술적 사양의 변경이나 기타 운영상의 필요에 따라
            제공하는 서비스의 내용을 변경할 수 있으며, 이 경우 변경 내용과 적용
            일자를 명시하여 사전에 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            제6조 (이용요금 및 결제)
          </h2>
          <p>
            서비스는 무료와 유료(이용권 등)로 구분되어 제공됩니다. 유료 서비스의
            이용 요금 및 결제 방식은 해당 서비스 페이지에 명시된 바에 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            제7조 (취소 및 환불 규정)
          </h2>
          <p>
            회사는 디지털 콘텐츠 및 서비스의 특성을 고려하여 다음과 같은 환불
            규정을 적용합니다.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>
              <strong>전액 환불:</strong> 유료 이용권 구매 후 7일 이내이며, 해당
              이용권을 통해 제공되는 크레딧을 전혀 사용하지 않았고 AI 처리 등
              서비스를 1회라도 이용하지 않은 경우에 한해 가능합니다.
            </li>
            <li>
              <strong>환불 불가:</strong> 구매 후 7일이 경과했거나, 1회 이상의
              크레딧 사용 또는 AI 처리가 발생한 경우에는 디지털 콘텐츠의 가치가
              현저히 감소한 것으로 간주하여 환불이 불가능합니다.
            </li>
            <li>
              <strong>부분 환불 없음:</strong> 본 서비스는 기간제 이용권 및
              크레딧 충전 방식으로 제공되므로 중도 해지에 따른 부분 환불은
              제공하지 않습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            제7조 (개인정보보호)
          </h2>
          <p>
            회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해
            노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의
            개인정보처리방침이 적용됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            제8조 (회원의 의무)
          </h2>
          <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>신청 또는 변경 시 허위 내용의 등록</li>
            <li>타인의 정보 도용</li>
            <li>회사가 게시한 정보의 변경</li>
            <li>서비스의 정당한 운영을 방해하는 행위</li>
          </ul>
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
