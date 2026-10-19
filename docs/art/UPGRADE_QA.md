# Eira / combat upgrade QA — 2026-10-18

## 제작 기록

1. 사용자 참고 아트를 art/reference/valkyrie.png에 보관.
2. 내장 이미지 생성 도구로 무기 없는 고해상도 기준 캐릭터 생성; 실제 투명 알파 확인.
3. Idle → Walk → Run → Slash → Rising → Kick → Jump → Slash2 → Air → Reactions → Guard 순으로 별도 시트 생성. Run 첫 시안의 가장자리 여유가 부족해 재생성본 채택.
4. 검과 HUD 얼굴 초상을 별도로 생성. 칼의 형상·길이는 한 이미지로 고정.
5. 11개 시트 / 72개 독립 포즈를 384×384로 정렬. 누운 포즈가 캔버스를 넘는 검증 실패를 발견하고 전체 시트 스케일을 보정한 뒤 재검사.
6. 고해상도 원본과 게임용 파생 파일을 분리. 기존 48×64 캐릭터는 fallback으로만 유지.
7. 실제 타이틀·전투·디버그 화면에서 디테일과 손 연결을 확인. HUD 얼굴 확대와 디버그 pivot 표기를 보정.

## 규칙 변경

- 250ms 내 동일 방향 재입력 + 유지로 1.7배 달리기. 반복 키 이벤트/중복 WASD·방향키 alias는 더블탭으로 취급하지 않음. Release/opposite/attack/guard/jump/hit/blur/pause cancels.
- AI 접근 속도 상향, Grunt 초기 burst, Flank/Retreat 상태, ally separation, 공격 예고 이후 방향·깊이 고정. Guard는 전진 방어 후 반격. 최대 2개 공격 예약에 Guard도 포함.
- 대상별 launch/air-hit budget. 두 번째 launch 35%, 세 번째 또는 추가 air hits 3회 도달 시 강제 다운. 바닥 접촉만으로 예산 초기화 금지. 다운/회복 중 피격 금지, 기상 후 0.5초 보호.
- Boss는 띄워지지 않고 0.13초 짧은 Hit만 적용. Rising recovery는 기존 22 frames, cancelInto 없음.

## 검증 범위

Model tests cover alpha atlas metadata and every selected animation/state, weapon pivot and invariant tip distance, input edges/aliases/cancellation, AI direction commitment/flanking/retreat, juggle limits and 30/60/144Hz wall-edge wake-up. Existing input-only full stage clear remains enabled, with no HP or damage overrides.

Browser tests cover actual double-tap running and attack interruption, Shift removal, legacy keyboard combat, pause/restart, nested production URL, missing PNG fallbacks and the animation workbench. Runtime/console errors are checked. Screenshots are inspected rather than accepted solely because tests pass.

## 명시된 범위 / 제한

- 72 independent generated poses are not 72 independently hand-drawn production animation frames. Subtle proportions, braid/cloth shapes and some equipment details vary between AI-generated keyposes. No manual in-between animation is claimed.
- Fall/Land share jump poses; Recovery combines existing down/crouch/idle poses; Death reuses the down sequence. These mappings are explicit in eira.ts.
- Enemy visuals/backgrounds remain original procedural art; this change improves their behavior, not their art.
- Automated browser target is Chromium. Human difficulty playtesting, subjective audio review, other browsers and remote Pages deployment remain outside verified results.
- Original generation outputs and the unused run draft are kept; assets:generate does not overwrite the new assets.


## 최종 실행 결과

- npm run verify: PASS — legacy/v2 PNG 검사, ESLint, strict TypeScript, 9개 파일의 43개 Vitest 테스트, production build.
- npm run test:e2e: PASS — Chromium 6개 테스트, 15.8초. 실제 더블탭/공격 취소/Shift 제거, 동작 검수 페이지까지 포함.
- 입력만으로 일반 웨이브 3개 + 보스 / 13명 클리어 회귀 테스트 통과. 체력·공격력·적 체력 우회 없음.
- 스크린샷 직접 확인: 새 타이틀, 전투/디버그, run/rising/reaction 검수 페이지. 투명 체크무늬에서 배경 잔상/잘림/인접 캐릭터 혼입을 확인했고 받아들일 수 있는 상태로 판정.
- 새 master 원본은 1024×1536, 런타임 시트는 384×384 고정 셀, 검은 512×171. source 원본을 별도로 보존하며 런타임 파일에서 원본을 복원하지 않음.
- Vite build: 34 modules, main JS 1,249.86 kB / gzip 347.42 kB, CSS 10.02 kB / gzip 3.06 kB. 고해상도 캐릭터 패키지는 약 11 MB이므로 최초 네트워크 로딩 시간은 연결 속도에 영향을 받음.
- 개발 서버 http://localhost:5173/ 및 art-review.html 응답 확인. 실제 GitHub Pages 배포는 이번 작업에 포함하지 않음.
