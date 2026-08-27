# lock/unlock이 "줄 없음"을 "다른 사람 잠금"과 같은 에러로 답함

## 증상

`lockLine`/`unlockLine`([lib/meeting-notes/store.ts](../../lib/meeting-notes/store.ts))이 줄이 존재하지 않을 때도 `{ ok: false }`를 반환하고, 이를 감싼 라우트([lock/route.ts](../../app/api/meeting-notes/[slug]/lines/[lineId]/lock/route.ts), [unlock/route.ts](../../app/api/meeting-notes/[slug]/lines/[lineId]/unlock/route.ts))는 이를 무조건 409(LOCKED/UNLOCK_FAILED)로 응답한다.

## 재현 조건

줄이 삭제되는 기능이 아직 없어 정상 사용 흐름에서는 발생하지 않는다. 다만 잘못된 lineId로 호출하거나, 향후 줄 삭제 기능이 추가되면 "존재하지 않음"과 "다른 사람이 잠금"이 모두 같은 409로 뭉뚱그려져 클라이언트가 원인을 구분할 수 없다.

## 제안

`lockLine`/`unlockLine`이 "줄 없음"과 "잠금 충돌"을 구분해 반환하고, 라우트가 전자는 404로 응답하도록 나눈다.
