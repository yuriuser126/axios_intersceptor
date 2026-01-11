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
