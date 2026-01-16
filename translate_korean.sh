#!/bin/bash
# Translate remaining Korean text to English

find src/app/components -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' \
  -e 's/업로드/Upload/g' \
  -e 's/편집/Edit/g' \
  -e 's/완료/Complete/g' \
  -e 's/처리/Processing/g' \
  -e 's/이력서 관리/Resumes/g' \
  -e 's/이력서/Resume/g' \
  -e 's/설정/Settings/g' \
  -e 's/도움말/Help/g' \
  -e 's/서비스 소개/Service Info/g' \
  -e 's/기능 요청 및 의견/Feature Request \& Feedback/g' \
  -e 's/새 이력서 만들기/Create New Resume/g' \
  -e 's/언어 설정/Language/g' \
  -e 's/메뉴/Menu/g' \
  -e 's/무료/Free/g' \
  -e 's/7일 이용권/7-Day Pass/g' \
  -e 's/30일 이용권/30-Day Pass/g' \
  -e 's/베타 무제한/Beta Unlimited/g' \
  -e 's/템플릿 선택/Template Selection/g' \
  -e 's/AI 처리/AI Processing/g'

echo "Korean text translation completed"
