# 진입 폼의 기본 선택 색이 다른 참석자 참여 후에도 안 바뀜

## 증상

[join-form.tsx](../../components/meeting-notes/join-form.tsx)의 `color` state가 마운트 시 `defaultColor`로만 초기화된다(`useState(defaultColor)`). `usedColors` prop이 SSE로 바뀌어 `defaultColor`가 재계산돼도 이미 선택된 `color` state는 갱신되지 않는다.

## 재현 조건

참석자가 진입 폼을 열어둔 채 오래 머무는 동안 다른 사람이 먼저 참여해 usedColors가 바뀌면, 화면에는 이미 다른 사람이 쓰는 색이 선택된 채로 남아 제출 시 COLOR_TAKEN 에러를 받는다. 서버가 최종 검증을 하므로 데이터 정합성은 깨지지 않고 에러 메시지만 뜬다.

## 제안

`usedColors`가 바뀌었을 때 사용자가 아직 색을 직접 고르지 않았다면(수동 선택 여부를 별도 플래그로 추적) `color` state를 새 `defaultColor`로 동기화한다.
