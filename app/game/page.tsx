'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GameIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-muted-foreground">이동 중...</div>
    </div>
  );
}
