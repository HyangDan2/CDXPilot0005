# 생성 프롬프트 세트 — Eira v0.2

사용 도구: **내장 image_gen**, 투명 배경 옵션 활성화. CLI/API fallback은 사용하지 않았습니다. 아래는 각 호출의 공통 조건과 동작 지시를 정리한 재현용 프롬프트 세트입니다. 원본 생성 결과도 함께 보관하므로 재생성 없이 패킹할 수 있습니다.

## 공통 디자인 조건

Exact reference Valkyrie Eira. Preserve adult heroic proportions and determined blue-eyed face, long thick silver-blue braid with red tie, white feather-wing helmet with round ornate gold bosses, deep cobalt plate armor with fine gold trim, ivory layered battle skirt with gold embroidery and tassels, blue/gold armored boots. Premium crisp detailed pixel-art JRPG rendering, consistent upper-left light, no chibi simplification, no painterly blur. Actual transparent alpha, no background/ground/shadow, text, labels or grid lines. Complete feather/braid/limb silhouettes inside each frame, generous blank margins. Same head/body scale and camera in all frames. Body-only poses with empty weapon fist; sword is rigged separately.

## 요청 순서와 산출물

| 단계 | 참조        | 추가 포즈/구도 지시                                                                                                             | 보관 파일                     |
| ---- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 1    | 사용자 원본 | One full body, right-facing three-quarter battle stance, body only, detailed master                                             | eira-master-v1.png            |
| 2    | 기준 master | 3×2, six subtle idle breathing/cloth/braid poses, same baseline                                                                 | eira-idle.png                 |
| 3    | 기준 master | 4×2, eight walk-cycle poses: contact/down/passing/up for each leg                                                               | eira-walk.png                 |
| 4    | 기준 master | 4×2, eight fast run poses, forward lean, alternating legs and trailing braid/cloth                                              | eira-run-v1.png (비채택 시안) |
| 4b   | 기준 master | Regenerate run with smaller per-cell occupancy, large outer border and full feathers/feet                                       | eira-run.png                  |
| 5    | 기준 master | 3×2 six slash poses: anticipation, coil, forward sweep, extension, downward follow-through, ready                               | eira-slash.png                |
| 6    | 기준 master | 3×2 six rising poses: crouch, low coil, upward torso, raised empty fist, high follow-through, recovery                          | eira-rising.png               |
| 7    | 기준 master | 3×2 six kick poses: guard, knee raise, extension, full kick, retract, ready                                                     | eira-kick.png                 |
| 8    | 기준 master | 3×2 six jump/land poses: crouch, push-off, ascend, tuck/apex, descent, soft landing                                             | eira-jump.png                 |
| 9    | 기준 master | 3×2 six second-slash/backhand poses: low forward, across waist, coil, reverse sweep, high finish, ready                         | eira-slash2.png               |
| 10   | 기준 master | 3×2 six air-attack poses: tucked ready, fist back, twist/forward, downward cut, extend legs, descend                            | eira-air.png                  |
| 11   | 기준 master | 4×2: top four hit recoils; bottom four backward fall/side-lying knockdown poses. Non-graphic, no blood                          | eira-reaction.png             |
| 12   | 기준 master | 3×2 six guard breathing poses, empty closed fist forward at chest for vertical sword, no shield                                 | eira-guard.png                |
| 13   | 사용자 원본 | One precisely horizontal straight silver longsword, point right, ornate gold crossguard/pommel, navy grip. No hand or character | oathblade-v2.png              |
| 14   | 기준 master | One head-and-shoulders square portrait, clear adult face and blue eyes, same helm/pauldrons, no frame                           | eira-portrait.png             |

모든 파일은 `art/generated/` 아래에 있습니다. 시트들은 앞선 저해상도 시트를 반복 편집하지 않고 공통 고해상도 master를 직접 참조했습니다. 검은 원본 사용자 참고 아트에서 디자인을 가져왔으며 독립 PNG로 고정합니다. 생성된 raw RGB 미리보기의 배경색과 실제 알파 채널은 다르게 보일 수 있어 PNG 바이트와 체크무늬 배경에서 함께 확인했습니다.

## 품질 확인 방식

- 전체 생성 결과의 얼굴, 깃털, 장식, 포즈 흐름을 순서대로 검토.
- 큰 움직임의 경계 문제를 피하기 위해 달리기 재생성; 원본은 비파괴 보관.
- 알파 연결 성분 단위 추출로 격자를 넘는 땋은 머리/손을 보존.
- 개별 손 좌표와 발 원점은 사람이 검토한 source-space 값을 사용.
- 패킹 시 경계 침범은 오류로 중단; 누운 포즈의 캔버스 초과를 스케일 보정으로 해결.
- 최종 게임 크기와 384px 검수 페이지를 비교. 해상도를 높여도 작은 화면에서 모든 장식이 동일하게 보인다는 보장은 하지 않습니다.
