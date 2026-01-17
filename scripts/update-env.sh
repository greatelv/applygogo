#!/bin/bash

# 1. 현재 브랜치 이름 가져오기
current_branch=$(git rev-parse --abbrev-ref HEAD)

echo "🔄 [Env Switch] Detected branch: '$current_branch'"

# 2. 브랜치에 따라 .env 및 .env.local 교체
# 로컬 개발 환경용(.env.local)은 존재할 때만 복사하여 로컬 설정을 덮어씁니다.

if [[ "$current_branch" == "epic/global" ]]; then
    echo "🌍 [Env Switch] Targeting Global Environment"
    
    # 1) Base Env (.env.global -> .env)
    if [[ -f .env.global ]]; then
        cp .env.global .env
        echo "   ✅ Copied .env.global -> .env"
    else
        echo "   ⚠️ Warning: .env.global not found!"
    fi

    # 2) Local Override (Generate .env.local directly)
    echo "# Local Overrides for Global Branch" > .env.local
    echo 'NEXT_PUBLIC_BASE_URL="http://localhost:3000/en"' >> .env.local
    echo 'AUTH_URL="http://localhost:3000/en"' >> .env.local
    echo 'AUTH_TRUST_HOST="http://localhost:3000/en"' >> .env.local
    echo "   ✅ Generated .env.local for Global Environment"

else
    echo "🇰🇷 [Env Switch] Targeting KR/Default Environment"

    # 1) Base Env (.env.kr -> .env)
    if [[ -f .env.kr ]]; then
        cp .env.kr .env
        echo "   ✅ Copied .env.kr -> .env"
    else
        echo "   ⚠️ Warning: .env.kr not found!"
    fi

    # 2) Local Override (Generate .env.local directly)
    # KR 환경의 기본 로컬 설정 (필요 시 수정)
    echo "# Local Overrides for KR Branch" > .env.local
    echo 'NEXT_PUBLIC_BASE_URL="http://localhost:3000"' >> .env.local
    echo 'AUTH_URL="http://localhost:3000"' >> .env.local
    echo 'AUTH_TRUST_HOST="http://localhost:3000"' >> .env.local
    echo "   ✅ Generated .env.local for KR Environment"
fi

echo "✨ Environment switch complete."
