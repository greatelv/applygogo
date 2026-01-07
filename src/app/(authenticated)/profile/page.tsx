"use client";

import { ProfilePage } from "../../components/profile-page";
import { useRouter } from "next/navigation";

// Mock data
const mockUser = {
  name: "홍길동",
  email: "hong@example.com",
  image: undefined,
};

export default function Page() {
  const router = useRouter();

  const handleDeleteAccount = () => {
    alert("계정 삭제 기능은 개발 예정입니다.");
  };

  return (
    <ProfilePage
      userName={mockUser.name}
      userEmail={mockUser.email}
      userImage={mockUser.image}
      plan="FREE"
      createdAt="2024-01-01"
      onDeleteAccount={handleDeleteAccount}
    />
  );
}
