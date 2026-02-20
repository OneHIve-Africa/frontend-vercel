/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiResponse } from "./types";

class Api {
  private static instance: Api;
  private axiosInstance: AxiosInstance;
  private baseURL: string =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

  protected constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor for consistent error handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response) {
          const responseData = error.response.data as any;

          // Handle Django REST Framework's non_field_errors format
          if (
            responseData.non_field_errors &&
            Array.isArray(responseData.non_field_errors)
          ) {
            return Promise.reject({
              error: responseData.non_field_errors[0], // Get the first error message
              status: error.response.status,
            });
          }
          
          if (responseData.code === "token_not_valid") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login"; // or your login route
            return Promise.reject({
              error: "Session expired. Please log in again.",
              status: error.response.status,
            });
          }

          // Handle field-specific validation errors
          if (
            typeof responseData === "object" &&
            !Array.isArray(responseData)
          ) {
            // Check if this looks like a field error object (common in DRF)
            const hasFieldErrors = Object.values(responseData).some(
              (val) => Array.isArray(val) && typeof val[0] === "string"
            );

            if (hasFieldErrors) {
              // Get first field error for general message
              const firstField = Object.keys(responseData)[0];
              const firstMessage =
                firstField && Array.isArray(responseData[firstField])
                  ? responseData[firstField][0]
                  : undefined;

              return Promise.reject({
                error: firstMessage || "Validation error",
                fieldErrors: responseData,
                status: error.response.status,
              });
            }
          }

          // Default error handling
          return Promise.reject({
            error:
              responseData.error ||
              responseData.message ||
              responseData.detail ||
              responseData.non_field_errors?.[0] ||
              "An error occurred on the server",
            status: error.response.status,
          });
        }
        
        // Handle cases where there's no response (Network/CORS error)
        return Promise.reject({ 
          error: error.message || "Network error. Please check your connection or CORS settings.", 
          status: 500 
        });
      }
    );

    // Add request interceptor for auth token
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("access_token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      }
    );
  }

  public static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }

  public async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return { data: response.data };
    } catch (error: unknown) {
      const err = error as { error: string };
      return { error: err.error || "An error occurred" };
    }
  }

  public async getBlob(url: string): Promise<ApiResponse<Blob>> {
    try {
      const response = await this.axiosInstance.get(url, { responseType: "blob" });
      return { data: response.data };
    } catch (error: unknown) {
      return { error: "Failed to download file" };
    }
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return { data: response.data };
    } catch (error: unknown) {
      const err = error as { error: string };
      return { error: err.error || "An error occurred" };
    }
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return { data: response.data };
    } catch (error: unknown) {
      const err = error as { error: string };
      return { error: err.error || "An error occurred" };
    }
  }

  public async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config);
      return { data: response.data };
    } catch (error: unknown) {
      const err = error as { error: string };
      return { error: err.error || "An error occurred" };
    }
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return { data: response.data };
    } catch (error: unknown) {
      const err = error as { error: string };
      return { error: err.error || "An error occurred" };
    }
  }
}

export default Api;
