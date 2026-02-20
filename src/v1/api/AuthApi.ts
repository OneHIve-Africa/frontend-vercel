import Api from "./Api";
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  PasswordResetRequest,
  VerifyOTPRequest,
  SetNewPasswordRequest,
  ChangePasswordRequest,
} from "./types";

class AuthApi extends Api {
  private static authInstance: AuthApi;

  protected constructor() {
    super();
  }

  public static getInstance(): AuthApi {
    if (!AuthApi.authInstance) {
      AuthApi.authInstance = new AuthApi();
    }
    return AuthApi.authInstance;
  }

  public async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.post<LoginResponse>("/auth/login/", data);
  }

  public async logout(): Promise<ApiResponse<void>> {
    const refreshToken = localStorage.getItem("refresh_token");
    // Send refresh token as required by backend
    return this.post<void>("/auth/logout/", { refresh: refreshToken });
  }

  public async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<object>> {
    return this.put<object>('/auth/change-password/', data);
  }

  public async register(
    data: RegisterRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>("/auth/register/", data);
  }

  public async requestPasswordReset(
    data: PasswordResetRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>(
      "/auth/password-reset-request/",
      data
    );
  }

  public async verifyOTP(
    data: VerifyOTPRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>("/auth/verify-otp/", data);
  }

  public async setNewPassword(
    data: SetNewPasswordRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>("/auth/set-new-password/", data);
  }

  public async serverLogout(): Promise<ApiResponse<{ message: string }>> {
    const refreshToken = localStorage.getItem("refresh_token");
    return this.post<{ message: string }>("/auth/logout/", {
      refresh: refreshToken,
    });
  }

  public clearLocalStorage(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("has_logged_in_before");
    localStorage.removeItem("user");
    localStorage.clear();
  }

  public async googleLogin(idToken: string): Promise<ApiResponse<any>> {
    return this.post<any>("/auth/google/", { id_token: idToken });
  }
}

export default AuthApi;
