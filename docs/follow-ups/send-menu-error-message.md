# 회의록 전송 실패와 클립보드 권한 실패가 같은 에러 메시지로 보임

## 증상

[send-menu.tsx](../../components/meeting-notes/send-menu.tsx)의 `handleClipboard`가 `onSendClipboard()`(서버 전송) 실패와 `navigator.clipboard.writeText()`(브라우저 클립보드 쓰기) 실패를 구분하지 않고 항상 "클립보드에 복사하지 못했습니다. 브라우저의 클립보드 권한을 확인해 주세요."를 보여준다.

## 재현 조건

서버가 400/404 등을 반환해 회의록 전송 자체가 실패해도 같은 메시지가 뜬다. 사용자는 실제 원인(서버 오류)을 모른 채 클립보드 권한만 확인하게 된다.

## 제안

두 실패를 분리해서 처리한다. `onSendClipboard()`와 `navigator.clipboard.writeText()`를 별도 try/catch로 감싸거나, 실패 지점을 표시하는 값을 던져 메시지를 구분한다.
