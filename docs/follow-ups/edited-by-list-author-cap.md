# 고친 참석자 목록이 authorIds 3명 캡에 걸려 일부 편집자를 놓칠 수 있음

## 증상

`EditedByList`(components/meeting-notes/edited-by-list.tsx)는 `line.authorIds`를 모아 "고친 참석자"를 표시하는데, `authorIds`는 `store.ts`의 `updateLine`에서 줄마다 최근 3명까지만 유지되도록 캡되어 있다(`.slice(0, 3)`). 한 줄을 4명 이상이 순차적으로 고치면, 가장 먼저 고친 사람이 그 줄의 `authorIds`에서 밀려난다. 그 사람이 다른 줄을 고치지 않았다면 "고친 참석자" 목록에서 완전히 빠진다.

## 근거

`docs/specs/meeting-note-coauthoring/spec.md`의 "실제로 고친 참석자 목록" 섹션은 "그 회의록의 어느 줄이든 한 번이라도 고친 참석자"를 보여준다고 되어 있어, 이 캡으로 인한 누락은 그 문구와 어긋난다.

## 다음 단계

줄별로 편집자 이력을 별도로(캡 없이) 유지하거나, 회의록 단위로 "한 번이라도 쓴 참석자 id 집합"을 store에 따로 저장해 `authorIds` 캡과 분리하는 방향을 검토한다.
