import Api from './Api';
import { ApiResponse, UserSettings } from './types';

class SettingsApi extends Api {
  private static settingsInstance: SettingsApi;

  private constructor() {
    super();
  }

  public static getInstance(): SettingsApi {
    if (!SettingsApi.settingsInstance) {
      SettingsApi.settingsInstance = new SettingsApi();
    }
    return SettingsApi.settingsInstance;
  }

  public async getSettings(): Promise<ApiResponse<UserSettings>> {
    return this.get<UserSettings>('/settings/');
  }

  public async updateSettings(data: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    return this.patch<UserSettings>('/settings/', data);
  }
}

export default SettingsApi;
