import axios from 'axios';
import { API_BASE_URL } from './config';

export interface DriveItem {
  id?: string;
  name?: string;
  mimeType?: string;
  webViewLink?: string;
  modifiedTime?: string;
}

export interface DriveFolderFilesResponse {
  folderId: string;
  folderUrl: string;
  files: DriveItem[];
}

export async function fetchDriveFolderFiles(
  folderUrl: string
): Promise<DriveFolderFilesResponse> {
  const response = await axios.post<DriveFolderFilesResponse>(
    `${API_BASE_URL}/GoogleDrive/folders/files`,
    { folderUrl },
    {
      headers: {
        accept: 'text/plain',
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}
