import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈 화면은 시작 안내 제목과 배포 링크를 보여준다", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: /page\.tsx 파일을 수정하세요/ })
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /지금 배포하기/ })).toHaveAttribute(
    "href",
    expect.stringContaining("vercel.com/new")
  );
});
