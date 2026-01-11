"use client";

import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const params = useSearchParams();
  const status = params.get("status") ?? "unknown";
  const api = params.get("api") ?? "Unknown API";

  // 에러 상태에 따른 메시지 설정
  const getErrorMessage = () => {
    if (status === "404") {
      return "요청한 리소스를 찾을 수 없습니다.";
    }
    if (status === "500") {
      return "서버에서 오류가 발생했습니다.";
    }
    return "에러가 발생했습니다.";
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-10">
      <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-red-700">에러 발생</h1>
        <p className="mt-2 text-sm text-brand-700">
          axios 인터셉터의 전역 에러 핸들링에 의해 이 페이지로 리다이렉트되었습니다.
        </p>
        
        <div className="mt-6 space-y-3 rounded-lg border border-brand-200 bg-brand-50 p-4">
          <p className="text-sm">
            <span className="font-medium text-brand-900">에러 상태:</span>{" "}
            <span className="font-semibold text-red-600">{status}</span>
          </p>
          <p className="text-sm">
            <span className="font-medium text-brand-900">발생 API:</span>{" "}
            <span className="font-semibold text-brand-700">{decodeURIComponent(api)}</span>
          </p>
          <p className="text-sm text-brand-700">{getErrorMessage()}</p>
        </div>

        <a
          className="mt-6 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          href="/"
        >
          홈으로 돌아가기
        </a>
      </div>
    </main>
  );
}
