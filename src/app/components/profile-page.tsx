"use client";

import { useState } from "react";
import { User, Mail, Calendar, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ProfilePageProps {
  userName: string;
  userEmail: string;
  userImage?: string;
  plan: "FREE" | "STANDARD" | "PRO";
  createdAt?: string;
  onDeleteAccount?: () => void;
}

const planConfig = {
  FREE: { label: "Free", variant: "outline" as const },
  STANDARD: { label: "Standard", variant: "secondary" as const },
  PRO: { label: "Pro", variant: "default" as const },
};

export function ProfilePage({
  userName,
  userEmail,
  userImage,
  plan,
  createdAt = "2024-01-01",
  onDeleteAccount,
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const config = planConfig[plan];

  const handleSave = () => {
    // 프로필 업데이트 로직
    setIsEditing(false);
    alert("프로필이 업데이트되었습니다.");
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "정말 계정을 삭제하시겠습니까? 모든 데이터가 영구적으로 삭제됩니다."
      )
    ) {
      onDeleteAccount?.();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl mb-2">내 프로필</h1>
        <p className="text-sm text-muted-foreground">
          계정 정보 및 플랜을 확인하세요
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex items-start gap-6">
            <Avatar className="size-24">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      이름
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      저장
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(userName);
                      }}
                      size="sm"
                    >
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-semibold">{userName}</h2>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{userEmail}</p>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    size="sm"
                  >
                    프로필 수정
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">계정 정보</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <User className="size-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">사용자 이름</p>
                <p className="text-sm text-muted-foreground">{userName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <Mail className="size-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">이메일</p>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <Calendar className="size-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">가입일</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(createdAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Trash2 className="size-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-destructive">계정 삭제</h3>
              <p className="text-sm text-muted-foreground mb-4">
                계정 삭제 시 모든 데이터가 영구적으로 삭제됩니다
              </p>

              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="size-4" />
                계정 삭제
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
