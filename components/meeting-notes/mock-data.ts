import type { MeetingNote } from "./types"

export const initialMeetingNotes: MeetingNote[] = [
  {
    id: "1",
    title: "3분기 로드맵 킥오프",
    date: "2026-08-25",
    participants: ["김서연", "박도윤", "이하은"],
    summary:
      "3분기 주요 기능의 우선순위를 정하고 담당자를 배정했습니다. 다음 체크인은 9월 1일입니다.",
  },
  {
    id: "2",
    title: "디자인 시스템 리뷰",
    date: "2026-08-22",
    participants: ["최지우", "정민준"],
    summary:
      "버튼과 배지 컴포넌트의 색상 토큰을 정리했습니다. 카드 컴포넌트는 다음 스프린트에 다룹니다.",
  },
  {
    id: "3",
    title: "고객 피드백 공유",
    date: "2026-08-18",
    participants: ["김서연", "이하은", "박도윤", "정민준"],
    summary:
      "지난주 인터뷰에서 나온 주요 불편 사항을 정리했습니다. 온보딩 플로우 개선이 최우선 과제입니다.",
  },
]
