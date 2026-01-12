/**
 * ============================================================================
 * 레이어: 프로바이더 레이어 (Provider Layer)
 * ============================================================================
 * 
 * 📦 사용 라이브러리: TanStack Query (React Query)
 * 
 * 역할:
 * - TanStack Query의 QueryClientProvider를 설정
 * - 전역 쿼리 설정 (retry, staleTime 등)
 * - React 앱 전체에서 useQuery 훅 사용 가능하도록 제공
 * 
 * 사용 위치:
 * - src/app/layout.tsx: 앱 전체를 Providers로 감쌈
 * - src/app/page.tsx: useQuery 훅 사용
 * 
 * 설정:
 * - retry: 1 (에러 발생 시 1번 재시도)
 * - staleTime: 20초 (20초 동안 캐시된 데이터를 fresh로 간주)
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 1000 * 20
          }
        }
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
