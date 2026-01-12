/**
 * ============================================================================
 * 레이어: UI 레이어 (Presentation Layer)
 * ============================================================================
 * 
 * 📦 사용 라이브러리:
 *   - React Hook Form: 폼 상태 관리
 *   - Zod: 폼 입력값 유효성 검사 (스키마 검증)
 *   - TanStack Query (useQuery): API 호출 상태 관리 (loading, error, success)
 *   - Zustand (useAuthStore): 전역 토큰 상태 읽기/쓰기
 * 
 * 🔗 연결 레이어:
 *   - API 호출 레이어 (src/api/demo.ts): API 호출 함수 사용
 *   - 전역 상태 레이어 (src/store/auth.ts): 토큰 상태 관리
 * 
 * 역할:
 * - 사용자 인터페이스 렌더링
 * - 폼 입력 처리 및 검증
 * - API 호출 상태 표시
 * - 사용자 인터랙션 처리
 * 
 * 아키텍처 흐름:
 *   1. 사용자가 폼 입력 → Zod로 검증 → Zustand에 저장
 *   2. 사용자가 버튼 클릭 → API 호출 함수 실행
 *   3. API 호출 함수 → 통합 API 클라이언트 → 서버 API
 *   4. 응답 상태 → useQuery로 관리 → UI에 반영
 */

"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
// 📦 Zod: 스키마 검증 라이브러리 - 토큰 입력 폼의 유효성 검사에 사용
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// 📦 Zustand: 전역 상태 관리 - 토큰 상태를 읽고 쓰는 데 사용
import { useAuthStore } from "@/store/auth";
// 📦 TanStack Query (useQuery): 데이터 페칭 및 캐싱 - API 호출 상태 관리에 사용
import { useQuery, type QueryStatus } from "@tanstack/react-query";
import {
  fetchClientProfile,
  fetchClientProfileWithStatus,
  fetchClientProfile401,
  fetchHqSummary,
  fetchHqSummaryWithStatus,
  fetchHqSummary401,
  fetchVendorOrders,
  fetchVendorOrdersWithStatus,
  fetchVendorOrders401
} from "@/api/demo";

/**
 * 📦 Zod 사용 위치: 토큰 입력 폼 검증 스키마
 * 
 * Zod를 사용하여 Access Token과 Refresh Token의 유효성을 검사합니다.
 * - 최소 3자 이상 입력 필요
 * - React Hook Form의 zodResolver와 연결되어 폼 제출 시 자동 검증
 */
const tokenSchema = z.object({
  accessToken: z.string().min(3, "Access token is required"),
  refreshToken: z.string().min(3, "Refresh token is required")
});

// Zod 스키마로부터 TypeScript 타입 자동 추론
type TokenForm = z.infer<typeof tokenSchema>;

export default function HomePage() {
  const { accessToken, refreshToken, setTokens, clearTokens } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TokenForm>({
    // Zod 스키마를 React Hook Form과 연결 (폼 제출 시 자동 검증)
    resolver: zodResolver(tokenSchema),
    defaultValues: { accessToken: "demo-access", refreshToken: "demo-refresh" }
  });

  /**
   * 📦 TanStack Query (useQuery) 사용 위치: API 호출 상태 관리
   * 
   * useQuery를 사용하여 각 API 호출의 상태를 관리합니다.
   * - enabled: false로 설정하여 자동 호출 방지 (버튼 클릭 시에만 refetch)
   * - queryKey: 캐싱 및 상태 추적을 위한 고유 키
   * - queryFn: 실제 API 호출 함수
   * 
   * 각 쿼리는 status (idle, loading, error, success) 상태를 제공하여 UI에 반영할 수 있습니다.
   */
  const hqQuery = useQuery({ queryKey: ["hq-summary"], queryFn: fetchHqSummary, enabled: false });
  const clientQuery = useQuery({
    queryKey: ["client-profile"],
    queryFn: fetchClientProfile,
    enabled: false
  });
  const vendorQuery = useQuery({
    queryKey: ["vendor-orders"],
    queryFn: fetchVendorOrders,
    enabled: false
  });

  // 데모: 각 API 클라이언트에서 404/500 에러를 트리거하여 인터셉터 동작 확인
  const callHqError = async (status: "404" | "500") => {
    try {
      await fetchHqSummaryWithStatus(status);
    } catch (error) {
      // 에러는 인터셉터에서 처리되며, 404/500 시 /error 페이지로 리다이렉트됩니다
      console.log(`[HQ-ERP] ${status} 에러 발생 - 인터셉터가 처리합니다`);
    }
  };
  const callClientError = async (status: "404" | "500") => {
    try {
      await fetchClientProfileWithStatus(status);
    } catch (error) {
      console.log(`[Client-App] ${status} 에러 발생 - 인터셉터가 처리합니다`);
    }
  };
  const callVendorError = async (status: "404" | "500") => {
    try {
      await fetchVendorOrdersWithStatus(status);
    } catch (error) {
      console.log(`[Vendor-ERP] ${status} 에러 발생 - 인터셉터가 처리합니다`);
    }
  };

  // 401 테스트: Access Token에 "expired"가 포함되면 401 발생
  // 인터셉터가 자동으로 refresh token으로 재발급 후 재요청합니다
  const callHq401 = async () => {
    try {
      await fetchHqSummary401();
      alert("✅ 401 발생 → 토큰 재발급 → 재요청 성공!");
    } catch (error) {
      console.log("[HQ-ERP] 401 처리 실패");
    }
  };
  const callClient401 = async () => {
    try {
      await fetchClientProfile401();
      alert("✅ 401 발생 → 토큰 재발급 → 재요청 성공!");
    } catch (error) {
      console.log("[Client-App] 401 처리 실패");
    }
  };
  const callVendor401 = async () => {
    try {
      await fetchVendorOrders401();
      alert("✅ 401 발생 → 토큰 재발급 → 재요청 성공!");
    } catch (error) {
      console.log("[Vendor-ERP] 401 처리 실패");
    }
  };

  const currentTokens = useMemo(
    () => ({ accessToken: accessToken ?? "-", refreshToken: refreshToken ?? "-" }),
    [accessToken, refreshToken]
  );

  const onSubmit = (data: TokenForm) => {
    // 회의 시 시연을 위해 토큰을 수동으로 세팅하는 폼
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10">
      <section className="rounded-2xl border border-brand-200 bg-white/70 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Axios Interceptor Demo</h1>
        <p className="mt-2 text-sm text-brand-700">
          Next.js + React Hook Form, Zod, Zustand, Tailwind, TanStack Query 사용 예시
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">토큰 입력</h2>
          <p className="mt-1 text-sm text-brand-700">
            인터셉터가 Authorization 헤더를 붙이고, 401 시 refresh 로직을 실행합니다.
          </p>
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
            💡 401 테스트: Access Token에 <strong>"expired"</strong>를 입력하고 401 버튼을 클릭하세요!
          </p>

          <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
            <label className="text-sm font-medium">Access Token</label>
            <input
              className="rounded-lg border border-brand-200 px-3 py-2"
              placeholder="access-token"
              {...register("accessToken")}
            />
            {errors.accessToken ? (
              <span className="text-xs text-red-600">{errors.accessToken.message}</span>
            ) : null}

            <label className="mt-2 text-sm font-medium">Refresh Token</label>
            <input
              className="rounded-lg border border-brand-200 px-3 py-2"
              placeholder="refresh-token"
              {...register("refreshToken")}
            />
            {errors.refreshToken ? (
              <span className="text-xs text-red-600">{errors.refreshToken.message}</span>
            ) : null}

            <div className="mt-3 flex gap-2">
              <button
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                type="submit"
              >
                토큰 저장
              </button>
              <button
                className="rounded-lg border border-brand-300 px-4 py-2 text-sm"
                type="button"
                onClick={clearTokens}
              >
                토큰 초기화
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">현재 토큰 상태 (Zustand)</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="font-medium">Access:</span> {currentTokens.accessToken}
            </p>
            <p>
              <span className="font-medium">Refresh:</span> {currentTokens.refreshToken}
            </p>
            <p className="text-xs text-brand-600">
              토큰은 전역 상태로 관리되고, axios 인터셉터에서 항상 최신 값을 참조합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">API 분리 호출 데모</h2>
        <p className="mt-1 text-sm text-brand-700">
          본사 ERP, 고객 앱, 입점사 ERP API를 별도의 axios 인스턴스로 분리했습니다.
          각 카드의 버튼을 클릭하여 정상 호출 및 404/500 에러를 테스트할 수 있습니다.
        </p>
        <p className="mt-2 text-xs text-brand-600">
          💡 404/500 에러 발생 시 axios 인터셉터가 자동으로 /error 페이지로 리다이렉트합니다.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <ApiCard
            title="본사 ERP"
            description="/summary 호출"
            status={hqQuery.status}
            onClick={() => hqQuery.refetch()}
            on401={callHq401}
            on404={() => callHqError("404")}
            on500={() => callHqError("500")}
          />
          <ApiCard
            title="고객 앱"
            description="/profile 호출"
            status={clientQuery.status}
            onClick={() => clientQuery.refetch()}
            on401={callClient401}
            on404={() => callClientError("404")}
            on500={() => callClientError("500")}
          />
          <ApiCard
            title="입점사 ERP"
            description="/orders 호출"
            status={vendorQuery.status}
            onClick={() => vendorQuery.refetch()}
            on401={callVendor401}
            on404={() => callVendorError("404")}
            on500={() => callVendorError("500")}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">설명 포인트</h2>
        <ul className="mt-3 list-inside list-disc text-sm text-brand-700">
          <li>axios 인터셉터에서 404/500 공통 처리 및 안내</li>
          <li>401 발생 시 refresh token으로 재발급 후 재요청</li>
          <li>실패 시 에러 페이지로 이동하도록 처리</li>
        </ul>
      </section>
    </main>
  );
}

type ApiCardProps = {
  title: string;
  description: string;
  // 📦 TanStack Query의 QueryStatus 타입: 'idle' | 'loading' | 'error' | 'success'
  status: QueryStatus;
  onClick: () => void;
  on401: () => void;
  on404: () => void;
  on500: () => void;
};

function ApiCard({ title, description, status, onClick, on401, on404, on500 }: ApiCardProps) {
  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-xs text-brand-700">{description}</p>
      
      {/* 정상 API 호출 버튼 */}
      <button
        className="mt-3 w-full rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-brand-100"
        onClick={onClick}
      >
        정상 호출 ({status})
      </button>
      
      {/* 에러 테스트 버튼: 401/404/500 강제 발생 */}
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <button
          className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
          onClick={on401}
          title="Access Token에 'expired' 포함 시 401 발생 → 자동 refresh → 재요청"
        >
          🔵 401
        </button>
        <button
          className="rounded-lg border border-red-200 bg-red-50 px-2 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
          onClick={on404}
          title="404 에러 발생 → /error 페이지로 리다이렉트"
        >
          🔴 404
        </button>
        <button
          className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
          onClick={on500}
          title="500 에러 발생 → /error 페이지로 리다이렉트"
        >
          🟠 500
        </button>
      </div>
      <p className="mt-2 text-xs text-brand-600">
        401: 자동 refresh | 404/500: /error 이동
      </p>
    </div>
  );
}
