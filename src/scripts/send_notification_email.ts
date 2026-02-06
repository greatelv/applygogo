import "dotenv/config";
import nodemailer from "nodemailer";
import { prisma } from "../lib/prisma.js";

async function main() {
  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error(
      "❌ GMAIL_USER and GMAIL_APP_PASSWORD environment variables are required.",
    );
    console.error("Please add them to your .env file.");
    console.log(`
[Guide] How to get Google App Password:
1. Go to Google Account > Security.
2. Enable 2-Step Verification.
3. Search for "App passwords".
4. Create a new app password (e.g. named "ApplyGoGo").
5. Copy the 16-character password and set it as GMAIL_APP_PASSWORD in .env
    `);
    process.exit(1);
  }

  // SMTP Transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  // 대상 유저 조회
  const BENEFIT_START_DATE = new Date("2026-01-18T00:00:00+09:00");

  // PASS_BETA_3DAY 플랜을 가지고 있고, 최근에 생성된 유저들 조회
  const users = await prisma.user.findMany({
    where: {
      plan_type: "PASS_BETA_3DAY",
      created_at: {
        gte: BENEFIT_START_DATE,
      },
    },
    select: {
      email: true,
      name: true,
    },
  });

  console.log(`Found ${users.length} users to send email.`);

  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    try {
      console.log(`Sending email to ${user.email} ...`);

      const mailOptions = {
        from: `"ApplyGoGo Team" <${GMAIL_USER}>`,
        to: user.email,
        subject:
          "[ApplyGoGo] 🎉 베타 런칭 기념 3일 무제한 이용권이 지급되었습니다!",
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">ApplyGoGo</h1>
            </div>
            
            <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <h2 style="margin-top: 0; font-size: 24px;">안녕하세요${user.name ? `, ${user.name}님` : ""}!</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
                ApplyGoGo의 베타 서비스에 가입해 주셔서 진심으로 감사드립니다.<br>
                회원님께 감사의 마음을 담아 <strong>3일 무제한 이용권</strong>을 선물로 드립니다.
              </p>
              
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin: 32px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; font-weight: 600;">🎁 지급된 혜택</p>
                <div style="font-size: 20px; font-weight: bold; color: #2563eb;">3일 무제한 이용권 + 50 크레딧</div>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">(지금 즉시 사용 가능)</p>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
                이제 <strong>프리미엄 템플릿</strong>과 <strong>AI 무제한 재번역 기능</strong>을 마음껏 활용하여<br>
                글로벌 스탠다드에 맞는 완벽한 영문 이력서를 완성해보세요.
              </p>

              <div style="text-align: center; margin-top: 40px;">
                <a href="https://applygogo.com" style="display: inline-block; background-color: #2563eb; color: white; font-weight: bold; padding: 14px 32px; border-radius: 6px; text-decoration: none; transition: background-color 0.2s;">
                  지금 바로 이력서 만들기
                </a>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af;">
              <p>본 메일은 발신 전용입니다. 문의사항은 고객센터를 이용해 주세요.</p>
              <p>&copy; 2026 ApplyGoGo. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Sent to ${user.email}`);
      successCount++;

      // 구글 SMTP 제한 방지를 위한 짧은 딜레이 wait
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to send to ${user.email}:`, error);
      failCount++;
    }
  }

  console.log("---------------------------------------------------");
  console.log(`Job finished. Success: ${successCount}, Fail: ${failCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // process.exit()을 명시적으로 호출하지 않으면 커넥션 풀 등의 문제로 걸릴 수 있으므로 추가 고려
  });
