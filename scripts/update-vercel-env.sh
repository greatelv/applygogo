#!/bin/bash

# .env 파일 경로 (절대 경로 사용 권장)
ENV_FILE="/Users/kei/workspaces/applygogo/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo ".env file not found at $ENV_FILE"
    exit 1
fi

echo "Starting environment variable update for Vercel Production..."

while IFS= read -r line || [ -n "$line" ]; do
    # 주석이나 빈 줄 무시
    if [[ $line =~ ^# ]] || [[ -z $line ]]; then
        continue
    fi

    # KEY=VALUE 파싱
    key=$(echo "$line" | cut -d '=' -f 1)
    value=$(echo "$line" | cut -d '=' -f 2-)
    
    # 값의 앞뒤 따옴표 제거 (단순 제거, 복잡한 케이스는 생략)
    value="${value%\"}"
    value="${value#\"}"
    
    echo "Processing $key..."
    
    # 기존 키 삭제 시도 (조용히)
    npx vercel env rm "$key" production -y 2>/dev/null || true
    
    # 새 키 추가 (표준 입력으로 전달하여 특수문자 안전 처리)
    echo -n "$value" | npx vercel env add "$key" production
    
done < "$ENV_FILE"

echo "Success! All variables processed."
