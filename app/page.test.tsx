import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("회의록 화면은 제목과 초기 회의록 목록을 보여준다", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: "회의록" })
  ).toBeInTheDocument();
  expect(screen.getByText("3분기 로드맵 킥오프")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /새 회의록/ })).toBeInTheDocument();
});
