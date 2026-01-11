import { NextResponse } from "next/server";

/**
 * 본사 ERP API - Summary 엔드포인트
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
    return NextResponse.json({ message: "HQ ERP not found" }, { status: 404 });
  }
  if (status === "500") {
    return NextResponse.json({ message: "HQ ERP error" }, { status: 500 });
  }

  // 정상 응답
  return NextResponse.json({ message: "HQ ERP summary ok" });
}
