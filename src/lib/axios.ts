/**
 * Axios 인터셉터 공통 처리 모듈
 * 
 * 이 모듈은 여러 API 클라이언트(HQ ERP, Client App, Vendor ERP)에 대한
 * 공통 axios 인터셉터를 제공합니다.
 * 
 * 주요 기능:
 * 1. 요청 인터셉터: 모든 API 요청에 Authorization 헤더 자동 추가
 * 2. 응답 인터셉터: 401 토큰 만료 시 자동 refresh 및 재요청
 * 3. 전역 에러 처리: 404/500 등 에러 발생 시 에러 페이지로 리다이렉트
 * 
 * 사용 방법:
 * - 각 API별로 독립적인 인스턴스(hqApi, clientApi, vendorApi)를 import하여 사용
 * - 토큰은 Zustand 스토어(useAuthStore)에서 관리되며, 인터셉터가 자동으로 참조
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth";

// 각 API 클라이언트의 base URL 정의
const API_BASES = {
  hqErp: "/api/hq-erp",
  clientApp: "/api/client-app",
  vendorErp: "/api/vendor-erp"
};

/**
 * 토큰 refresh 중복 요청 방지 메커니즘
 * 
 * 여러 API 요청이 동시에 401을 받을 경우, refresh 요청이 중복으로 발생하는 것을 방지합니다.
 * - isRefreshing: 현재 refresh 진행 중인지 여부
 * - refreshQueue: refresh 완료를 기다리는 요청들의 콜백 큐
 */
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

/**
 * 토큰 refresh 대기 중인 요청들을 큐에 등록
 * refresh가 완료되면 이 콜백들이 호출되어 새 토큰을 받습니다.
 */
function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshQueue.push(cb);
}

/**
 * 토큰 refresh 완료 후 대기 중인 모든 요청에 새 토큰 전달
 * refresh가 성공하면 새 토큰을, 실패하면 null을 전달합니다.
 */
function publishTokenRefresh(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

/**
 * Access Token 갱신 함수 (401 발생 시 호출)
 * 
 * 실제 프로젝트에서는:
 * 1. refresh token을 사용해 refresh API를 호출
 * 2. 새 access token과 refresh token을 받아서 스토어에 저장
 * 3. 새 토큰을 반환
 * 
 * 현재는 데모용으로 mock 응답을 반환합니다.
 */
async function refreshAccessToken() {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) {
    return null;
  }

  // 데모용: 실제 프로젝트에서는 refresh API를 호출해 새 토큰을 받습니다
  // 예시: const response = await axios.post('/api/auth/refresh', { refreshToken });
  await new Promise((resolve) => setTimeout(resolve, 400));
  return "new-access-token";
}

/**
 * 전역 에러 처리 함수
 * 
 * 404/500 등 공통 에러를 처리하고 에러 페이지로 리다이렉트합니다.
 * 
 * 주의: 401 에러는 이 함수가 호출되기 전에 인터셉터에서 처리되므로
 * 여기서는 401을 제외한 다른 에러만 처리합니다.
 * 
 * @param error - Axios 에러 객체
 * @param apiName - 에러가 발생한 API 이름 (로그 및 에러 페이지 표시용)
 */
function handleGlobalError(error: AxiosError, apiName: string) {
  const status = error.response?.status;

  // 404/500 에러 로깅 (회의 시 확인용)
  if (status === 404) {
    console.warn(`[${apiName}] 404 Not Found`, error.config?.url);
  }
  if (status === 500) {
    console.warn(`[${apiName}] 500 Server Error`);
  }

  // 400 이상의 에러 발생 시 에러 페이지로 리다이렉트
  // (401은 이미 위에서 처리되므로 여기서는 404, 500 등만 처리)
  if (typeof window !== "undefined" && status && status >= 400 && status !== 401) {
    const apiParam = encodeURIComponent(apiName);
    window.location.href = `/error?status=${status}&api=${apiParam}`;
  }
}

/**
 * axios 인스턴스에 요청/응답 인터셉터를 연결
 * 
 * 각 API 클라이언트마다 독립적인 인터셉터를 설정합니다.
 * 
 * @param instance - 인터셉터를 연결할 axios 인스턴스
 * @param apiName - API 이름 (에러 로깅 및 리다이렉트 시 사용)
 */
function attachInterceptors(instance: AxiosInstance, apiName: string) {
  /**
   * 요청 인터셉터: 모든 요청에 Authorization 헤더 자동 추가
   * 
   * Zustand 스토어에서 accessToken을 가져와서
   * Authorization 헤더에 Bearer 토큰으로 자동 추가합니다.
   * 
   * 사용자는 매번 헤더를 수동으로 추가할 필요가 없습니다.
   */
  instance.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`
      };
    }
    return config;
  });

  /**
   * 응답 인터셉터: 401 토큰 만료 처리 및 전역 에러 처리
   * 
   * 처리 흐름:
   * 1. 401 에러 발생 시:
   *    - refresh token으로 새 access token 발급
   *    - 실패한 요청을 새 토큰으로 자동 재시도
   *    - 여러 요청이 동시에 401을 받아도 refresh는 한 번만 실행
   * 
   * 2. 404/500 등 기타 에러:
   *    - 전역 에러 핸들러로 처리하여 /error 페이지로 리다이렉트
   */
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalConfig = error.config as AxiosRequestConfig & { _retry?: boolean };
      const status = error.response?.status;

      /**
       * 401 토큰 만료 처리
       * 
       * 조건:
       * - status가 401이고
       * - 아직 재시도하지 않은 요청 (!originalConfig._retry)
       * 
       * 처리 과정:
       * 1. _retry 플래그를 true로 설정하여 무한 재시도 방지
       * 2. isRefreshing이 false면 (첫 번째 401 요청이면):
       *    - refresh token으로 새 access token 발급
       *    - 스토어에 새 토큰 저장
       *    - 대기 중인 모든 요청에 새 토큰 전달
       * 3. 새 토큰으로 원래 요청을 재시도
       */
      if (status === 401 && !originalConfig._retry) {
        originalConfig._retry = true; // 무한 재시도 방지

        // 첫 번째 401 요청만 refresh 실행 (중복 방지)
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const newToken = await refreshAccessToken();
            useAuthStore.getState().setTokens({
              accessToken: newToken,
              refreshToken: useAuthStore.getState().refreshToken
            });
            publishTokenRefresh(newToken);
          } catch (refreshError) {
            // refresh 실패 시 토큰 초기화 및 모든 대기 요청 실패 처리
            useAuthStore.getState().clearTokens();
            publishTokenRefresh(null);
          } finally {
            isRefreshing = false;
          }
        }

        // refresh 완료 후 대기 중인 요청들을 새 토큰으로 재시도
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (!token) {
              // refresh 실패 시 전역 에러 처리
              handleGlobalError(error, apiName);
              reject(error);
              return;
            }
            // 새 토큰으로 원래 요청 재시도
            originalConfig.headers = {
              ...originalConfig.headers,
              Authorization: `Bearer ${token}`
            };
            resolve(instance(originalConfig));
          });
        });
      }

      // 404/500 등 기타 에러는 전역 에러 핸들러로 처리
      // (401은 위에서 처리되므로 여기서는 404, 500 등만 처리)
      handleGlobalError(error, apiName);
      return Promise.reject(error);
    }
  );
}

/**
 * API 클라이언트 생성 함수
 * 
 * baseURL과 API 이름을 받아서 인터셉터가 연결된 axios 인스턴스를 생성합니다.
 * 
 * @param baseURL - API의 base URL (예: "/api/hq-erp")
 * @param apiName - API 이름 (에러 로깅 및 리다이렉트 시 사용)
 * @returns 인터셉터가 연결된 axios 인스턴스
 */
function createApiClient(baseURL: string, apiName: string) {
  const instance = axios.create({
    baseURL,
    timeout: 5000
  });

  attachInterceptors(instance, apiName);
  return instance;
}

/**
 * 각 API별 독립적인 axios 인스턴스
 * 
 * 사용 방법:
 * ```typescript
 * import { hqApi, clientApi, vendorApi } from "@/lib/axios";
 * 
 * // 정상 호출
 * const response = await hqApi.get("/summary");
 * 
 * // 401 발생 시 자동으로 refresh 후 재요청
 * // 404/500 발생 시 자동으로 /error 페이지로 리다이렉트
 * ```
 */
export const hqApi = createApiClient(API_BASES.hqErp, "HQ-ERP");
export const clientApi = createApiClient(API_BASES.clientApp, "Client-App");
export const vendorApi = createApiClient(API_BASES.vendorErp, "Vendor-ERP");
