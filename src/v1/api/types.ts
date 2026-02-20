export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  profile: object;
  refresh: string;
  access: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  primary_phone?: string;
  other_phone?: string;
  location?: string;
}

export interface PasswordResetRequest {
  email: string;
  password: string;
  password_confirm: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface SetNewPasswordRequest {
  email: string;
  otp: string;
  new_password1: string;
  new_password2: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password2: string;
}

export interface UserSettings {
  payout_updates: boolean;
  hive_activity_alerts: boolean;
  environmental_impact_reports: boolean;
  new_investment_opportunities: boolean;
  terms_of_service_signed: boolean;
}

export interface Investment {
  id: number;
  user_profile: number;
  payment: number;
  amount: string;
  investment_date: string;
  interest_earned: string;
  interest_to_be_earned: string;
  roi: string;
  maturity_date: string;
  investment_status: "active" | "matured" | "cancelled";
  hive_status: "active" | "pending" | "lost";
  hive_status_summary: string;
  number_of_hives: number;
  created_at: string;
  updated_at: string;
}
