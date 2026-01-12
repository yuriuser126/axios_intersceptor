/**
 * ============================================================================
 * 레이어: API 호출 함수 레이어 (API Call Functions Layer)
 * ============================================================================
 * 
 * 📦 사용 라이브러리: 없음 (순수 TypeScript 함수)
 * 🔗 연결 레이어:
 *   - 통합 API 클라이언트 (src/lib/axios.ts): hqApi, clientApi, vendorApi 사용
 *   - UI 레이어 (src/app/page.tsx): 이 함수들을 호출하여 API 요청
 * 
 * 역할:
 * - 각 API 엔드포인트별로 호출 함수를 정의
 * - 통합 API 클라이언트(lib/axios.ts)를 사용하여 실제 HTTP 요청 수행
 * - UI 레이어와 통합 API 클라이언트 사이의 중간 계층
 * 
 * 구조:
 * - 본사 ERP API: /api/hq-erp/summary
 * - 고객 앱 API: /api/client-app/profile
 * - 입점사 ERP API: /api/vendor-erp/orders
 * 
 * 각 API별 함수:
 * - fetchXXX(): 정상 API 호출
 * - fetchXXXWithStatus(): 404/500 에러 테스트용
 * - fetchXXX401(): 401 에러 테스트용 (토큰 만료 시뮬레이션)
 * 
 * 아키텍처:
 *   UI 레이어 (page.tsx) ← 이 함수들을 호출
 *      ↓
 *   API 호출 레이어 (api/demo.ts) ← 여기
 *      ↓
 *   통합 API 클라이언트 (lib/axios.ts) ← 이 레이어에서 사용
 */

import { clientApi, hqApi, vendorApi } from "@/lib/axios";

// 본사 ERP API 호출 함수들
export async function fetchHqSummary() {
  const { data } = await hqApi.get("/summary");
  return data as { message: string };
}

export async function fetchHqSummaryWithStatus(status: "404" | "500") {
  const { data } = await hqApi.get("/summary", { params: { status } });
  return data as { message: string };
}

// 고객 앱 API 호출 함수들
export async function fetchClientProfile() {
  const { data } = await clientApi.get("/profile");
  return data as { message: string };
}

export async function fetchClientProfileWithStatus(status: "404" | "500") {
  const { data } = await clientApi.get("/profile", { params: { status } });
  return data as { message: string };
}

// 입점사 ERP API 호출 함수들
export async function fetchVendorOrders() {
  const { data } = await vendorApi.get("/orders");
  return data as { message: string };
}

export async function fetchVendorOrdersWithStatus(status: "404" | "500") {
  const { data } = await vendorApi.get("/orders", { params: { status } });
  return data as { message: string };
}

// 401 테스트용: Access Token에 "expired"가 포함되면 401 에러 발생
// 인터셉터가 자동으로 refresh token으로 재발급 후 재요청합니다
export async function fetchHqSummary401() {
  const { data } = await hqApi.get("/summary");
  return data as { message: string };
}

export async function fetchClientProfile401() {
  const { data } = await clientApi.get("/profile");
  return data as { message: string };
}

export async function fetchVendorOrders401() {
  const { data } = await vendorApi.get("/orders");
  return data as { message: string };
}
