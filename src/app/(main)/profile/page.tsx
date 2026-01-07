"use strict";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">프로필 설정</h2>
        <p className="text-muted-foreground">계정 정보를 관리하세요.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>Google 계정에서 가져온 정보입니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>이름</Label>
            <Input value={user?.name || ""} disabled />
          </div>
          <div className="grid gap-2">
            <Label>이메일</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div className="grid gap-2">
            <Label>User ID</Label>
            <Input
              value={user?.id || ""}
              disabled
              className="font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <form action="/api/auth/signout" method="POST">
          <Button variant="destructive" type="submit">
            로그아웃
          </Button>
        </form>
      </div>
    </div>
  );
}
