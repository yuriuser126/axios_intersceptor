/**
 * 레이어: 서버 API 레이어 (Server API Layer / Backend)
 * 
 * 사용 라이브러리: Next.js API Routes
 * 
 * 역할:
 * - 실제 HTTP 요청을 처리하는 서버 사이드 엔드포인트
 * - 데모용으로 401/404/500 에러를 시뮬레이션
 * - 통합 API 클라이언트에서 호출되는 실제 API 서버 역할
 * 
 * 아키텍처:
 *   통합 API 클라이언트 (lib/axios.ts) -> 서버 API 레이어 (app/api) <- 여기
 */

import { NextResponse } from "next/server";

/**
 * 입점사 ERP API - Orders 엔드포인트
 * 데모용: status 쿼리 파라미터로 404/500 에러를 시뮬레이션할 수 있습니다.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const authHeader = request.headers.get("authorization") ?? "";

  // 데모: Authorization 헤더에 "expired"가 포함되면 401 반환 (토큰 만료 시뮬레이션)
  if (authHeader.includes("expired")) {
    return NextResponse.json({ message: "Token expired" }, { status: 401 });
  }

  // 데모: status 쿼리 파라미터로 404/500 에러 강제 발생 (인터셉터 테스트용)
  if (status === "404") {
    return NextResponse.json({ message: "Vendor orders not found" }, { status: 404 });
  }
  if (status === "500") {
    return NextResponse.json({ message: "Vendor ERP error" }, { status: 500 });
  }

  // 정상 응답
  return NextResponse.json({ message: "Vendor orders ok" });
}
