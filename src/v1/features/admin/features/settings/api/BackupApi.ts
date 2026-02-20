import Api from "@/v1/api/Api";
import { ApiResponse } from "@/v1/api/types";

class BackupApi extends Api {
  private static backupInstance: BackupApi;

  private constructor() {
    super();
  }

  public static getInstance(): BackupApi {
    if (!BackupApi.backupInstance) {
      BackupApi.backupInstance = new BackupApi();
    }
    return BackupApi.backupInstance;
  }

  public async downloadBackup(): Promise<ApiResponse<Blob>> {
    return this.getBlob("/backup/");
  }

  public async restoreBackup(file: File): Promise<ApiResponse<{ message: string }>> {
    const formData = new FormData();
    formData.append("file", file);
    return this.post<{ message: string }>("/backup/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default BackupApi;
