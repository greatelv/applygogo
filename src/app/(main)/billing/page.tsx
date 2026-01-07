"use strict";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreditCard, Zap } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">결제 관리</h2>
        <p className="text-muted-foreground">
          구독 상태와 결제 내역을 확인하세요.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" /> 구독 플랜
            </CardTitle>
            <CardDescription>현재 이용 중인 플랜입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">FREE</div>
            <p className="text-sm text-muted-foreground mb-4">
              월 3 크레딧 제공
            </p>
            <Button asChild className="w-full">
              <Link href="/pricing">플랜 업그레이드</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> 결제 수단
            </CardTitle>
            <CardDescription>등록된 결제 수단이 없습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              카드 관리 (준비중)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
