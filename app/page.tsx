import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-muted font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-10 py-32 px-16">
        <Image
          className="dark:invert h-5 w-[100px]"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-3 text-center">
          <Badge>shadcn 테마 적용됨</Badge>
          <h1 className="max-w-md text-3xl font-semibold leading-10 tracking-tight text-foreground">
            시작하려면{" "}
            <code className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-[0.9em]">
              page.tsx
            </code>{" "}
            파일을 수정하세요.
          </h1>
          <p className="max-w-md text-lg leading-8 text-muted-foreground">
            아래 카드는 새로 적용된 테마 색상과 shadcn 컴포넌트를 보여줍니다.
          </p>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>컴포넌트 미리보기</CardTitle>
            <CardDescription>
              버튼과 배지 색상이 테마에 맞춰 바뀝니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button>기본</Button>
              <Button variant="secondary">보조</Button>
              <Button variant="outline">아웃라인</Button>
              <Button variant="ghost">고스트</Button>
              <Button variant="destructive">위험</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>기본</Badge>
              <Badge variant="secondary">보조</Badge>
              <Badge variant="outline">아웃라인</Badge>
              <Badge variant="destructive">위험</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className={cn(buttonVariants({ size: "lg" }))}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert h-[14px] w-4"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            지금 배포하기
          </a>
          <a
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            문서
          </a>
        </div>
      </main>
    </div>
  );
}
