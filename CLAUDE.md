# 수학 홈스쿨 앱

## 프로젝트 개요
초등/중등 자녀를 위한 가족용 수학 홈스쿨링 관리 앱.
로컬에서 Vite dev server로 실행, Cloudflare Tunnel로 가족 공유.

## 실행 방법
\```bash
npm run dev                              # 로컬 개발 서버 (:5173)
cloudflared tunnel --url http://localhost:5173  # 외부 공유 URL 생성
\```

## 핵심 도메인 개념
- **학습 사이클**: 7단계 (예습→설명→피드백→보완학습→재설명→문제풀기→오답정리)
- **단계 상태**: idle → pending(아이 완료 요청) → approved/rejected(부모 처리)
- **포인트**: 단계 승인 시 적립, 상점 아이템 구매로 차감
- **알림**: 아이 요청 → 부모 알림 / 부모 처리 → 아이 알림

## 사용자 역할
- **child**: 학습 진행, 단계 완료 요청, 상점 이용
- **parent**: 단계 승인/반려+피드백, 단원 관리, 아이템 설정

## 기술 스택
- React + Vite
- Zustand (상태관리, localStorage persist)
- Tabler Icons webfont (CDN)
- CSS variables 기반 자체 스타일 (Tailwind 없음)

## 상태 구조 (Zustand store)
\```js
{
  members: [],       // {id, name, role:'child'|'parent', color, grade?}
  units: [],         // {id, name, desc, grade}
  progress: {},      // [childId][unitId][stepKey] = {status, feedbacks:[]}
  notifications: [], // {id, to, type, childId, unitId, stepKey, msg, time, read}
  shopItems: [],     // {id, name, pts, emoji}
  purchases: []      // {childId, itemId, pts, name, time}
}
\```

## 스타일 규칙
- CSS variables: --cp(primary), --cok(success), --ce(error), --cw(warn) 등 globals.css 참조
- 다크모드: prefers-color-scheme 자동 대응
- 모바일 우선 반응형

## 코딩 컨벤션
- 컴포넌트: 함수형 + hooks
- props drilling 대신 zustand store 직접 접근
- 파일명: PascalCase(컴포넌트), camelCase(hooks/utils)
- localStorage key: 'mhs4' (기존 데이터 호환 유지)
- 포인트는 항상 totalPts() 계산 (직접 저장 안 함)

## 현재 구현 상태
- [x] 가족 구성원 관리 (아이 여러 명 + 부모 각각)
- [x] 학년별 단원 관리 (초1-1 ~ 중3-2)
- [x] 7단계 학습 사이클 + 부모 승인 플로우
- [x] 단계별 피드백 스레드 (아이↔부모)
- [x] 포인트 적립 + 보상 상점
- [x] 알림 시스템

## 다음 개발 예정
- [ ] 주간 리포트 (부모용 통계)
- [ ] 학습 달력 뷰
- [ ] 단원 완료 축하 애니메이션
- [ ] 아이별 학습 통계 차트

## 참고: 기존 구현 파일
math_homeschool_v3.html — 단일 HTML로 된 초기 구현체.
React 전환 시 이 파일의 로직과 스타일을 참고할 것.
