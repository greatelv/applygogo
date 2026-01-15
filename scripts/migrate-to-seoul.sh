#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== 지원고고 DB 마이그레이션: 싱가폴 → 서울 ===${NC}\n"

# 데이터베이스 연결 정보
SOURCE_DB='postgresql://postgres.aiwwrzngxhmrbhdixwwr:Tkjeon3670!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'
TARGET_DB='postgresql://postgres.hvvtfbacktphxaedifeq:Tkjeon3670!@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'

# PATH 설정
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"

echo -e "${YELLOW}[1/3] 싱가폴 DB에서 데이터 덤프 중...${NC}"
pg_dump "$SOURCE_DB" \
    --data-only \
    --no-owner \
    --no-privileges \
    --column-inserts \
    --file=./scripts/db-dump.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 데이터 덤프 완료 (./scripts/db-dump.sql)${NC}\n"
else
    echo -e "${RED}✗ 데이터 덤프 실패${NC}"
    exit 1
fi

echo -e "${YELLOW}[2/3] 서울 DB로 데이터 복원 중...${NC}"
psql "$TARGET_DB" < ./scripts/db-dump.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 데이터 복원 완료${NC}\n"
else
    echo -e "${RED}✗ 데이터 복원 실패 (일부 데이터는 복원되었을 수 있습니다)${NC}\n"
fi

echo -e "${YELLOW}[3/3] 데이터 검증 중...${NC}"
echo "싱가폴 DB 사용자 수:"
psql "$SOURCE_DB" -t -c "SELECT COUNT(*) FROM users;"

echo "서울 DB 사용자 수:"
psql "$TARGET_DB" -t -c "SELECT COUNT(*) FROM users;"

echo ""
echo -e "${GREEN}=== 데이터 마이그레이션 완료! ===${NC}"
echo -e "${BLUE}다음 단계:${NC}"
echo "1. Storage 파일 마이그레이션: npx tsx scripts/migrate-storage.ts"
echo "2. .env 파일의 DATABASE_URL을 서울 DB로 변경"
echo "3. 애플리케이션 재시작 및 테스트"
