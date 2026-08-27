# rich-text.ts의 isSelectionActive가 어디서도 호출되지 않음

## 증상

[rich-text.ts](../../components/meeting-notes/rich-text.ts)의 `isSelectionActive`가 export만 되고 사용처가 없다. `note-line.tsx`의 굵게/기울임/밑줄 토글은 이 함수 대신 top-level 노드 스타일만 보고 판단한다.

## 제안

정리하거나(삭제), 원래 의도대로 툴바 버튼의 활성 상태 표시(현재 선택 영역이 이미 굵게인지 등)에 실제로 연결한다.
