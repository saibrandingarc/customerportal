import axios from 'axios';
import { API_BASE_URL } from './config';

export type DeliverableFileApprovalStatus = 'Approved' | 'Rejected';

export interface DeliverableFileApprovalPayload {
  deliverableId: string;
  companyId: string;
  fileId: string;
  fileName: string;
  fileUrl?: string;
  notes?: string;
  name?: string;
  company?: string;
}

export interface DeliverableFileApprovalRecord {
  id: number;
  deliverableId: string;
  fileId: string;
  fileName: string;
  fileUrl?: string;
  notes?: string;
  status: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

interface DeliverableFileApprovalListResponse {
  success: boolean;
  data: DeliverableFileApprovalRecord[];
  message?: string;
  error?: string;
}

function normalizeApprovalRecord(raw: Record<string, unknown>): DeliverableFileApprovalRecord {
  return {
    id: Number(raw.id ?? raw.Id ?? 0),
    deliverableId: String(raw.deliverableId ?? raw.DeliverableId ?? ''),
    fileId: String(raw.fileId ?? raw.FileId ?? ''),
    fileName: String(raw.fileName ?? raw.FileName ?? ''),
    fileUrl: String(raw.fileUrl ?? raw.FileUrl ?? '') || undefined,
    notes: String(raw.notes ?? raw.Notes ?? '') || undefined,
    status: String(raw.status ?? raw.Status ?? ''),
    createdAtUtc: String(raw.createdAtUtc ?? raw.CreatedAtUtc ?? ''),
    updatedAtUtc: String(raw.updatedAtUtc ?? raw.UpdatedAtUtc ?? '') || undefined,
  };
}

export async function getDeliverableFileApprovals(
  deliverableId: string | number
): Promise<DeliverableFileApprovalRecord[]> {
  const response = await axios.get<DeliverableFileApprovalListResponse>(
    `${API_BASE_URL}/DeliverableFileApproval/${deliverableId}`,
    {
      headers: {
        accept: 'application/json',
      },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.message ?? response.data.error ?? 'Failed to load file approvals.');
  }

  const records = response.data.data ?? [];
  return records.map((record) =>
    normalizeApprovalRecord(record as unknown as Record<string, unknown>)
  );
}

export async function submitDeliverableFileApproval(
  deliverableId: string | number,
  status: DeliverableFileApprovalStatus,
  payload: DeliverableFileApprovalPayload
) {
  const response = await axios.post(
    `${API_BASE_URL}/DeliverableFileApproval/${deliverableId}/${status}`,
    payload,
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}
