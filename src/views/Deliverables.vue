<template>
  <!-- Loading Spinner -->
  <div v-if="loading" class="spinner-overlay d-flex justify-content-center align-items-center">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  <div class="main-content">
    <div class="page-content">
      <div class="container-fluid">
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <h5 class="me-3 mb-0">Deliverables</h5>
              <div class="flex-grow-1 border-start mx-3" style="height: 24px;"></div>
            </div>

            <ul class="nav nav-tabs mb-3">
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeDeliverablesTab === 'pending' }"
                  data-value="pending"
                  type="button"
                  @click="changeDeliverablesTab('pending')"
                >
                  Pending Approvals
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeDeliverablesTab === 'upcoming' }"
                  data-value="upcoming"
                  type="button"
                  @click="changeDeliverablesTab('upcoming')"
                >
                  Upcoming
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeDeliverablesTab === 'completed' }"
                  data-value="completed"
                  type="button"
                  @click="changeDeliverablesTab('completed')"
                >
                  Completed
                </button>
              </li>
            </ul>

            <div class="tab-content">
              <div class="tab-pane fade" :class="{ 'show active': activeDeliverablesTab === 'pending' }">
                <div class="pending-deliverables-wrapper">
                  <EasyDataTable
                    :headers="pendingheaders"
                    :items="pendingDeliverables"
                    :rows-per-page="10"
                    table-class="table-bordered"
                    body-expand-row-class-name="deliverable-expand-row"
                    :body-row-class-name="getPendingRowClassName"
                    show-index
                    :searchable="true"
                    sort-by="Block"
                    sort-type="desc"
                    buttons-pagination
                  >
                    <template #item-expand="deliverableRow">
                      <i
                        v-if="isArticleContentType(deliverableRow.Main_Content_Type)"
                        class="expand-icon"
                      ></i>
                    </template>
                    <template #item-content_doc_url="{ content_doc_url }">
                      <a
                        v-if="content_doc_url"
                        :href="content_doc_url"
                        target="_blank"
                        rel="noopener"
                        class="text-primary text-truncate d-inline-block content-doc-link"
                        @click.stop
                      >
                        Content Doc
                      </a>
                      <span v-else class="text-muted">—</span>
                    </template>
                    <template #item-actions="deliverableRow">
                      <div
                        v-if="!isArticleContentType(deliverableRow.Main_Content_Type)"
                        class="file-action-buttons"
                        @click.stop
                        @mousedown.stop
                      >
                        <button
                          type="button"
                          class="btn btn-success btn-sm me-2"
                          :disabled="actionLoading"
                          @mousedown.stop.prevent
                          @click.stop.prevent="openApproveForDeliverable(deliverableRow.id)"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          class="btn btn-danger btn-sm"
                          :disabled="actionLoading"
                          @mousedown.stop.prevent
                          @click.stop.prevent="openRejectForDeliverable(deliverableRow.id)"
                        >
                          Reject
                        </button>
                      </div>
                      <span v-else class="text-muted">—</span>
                    </template>
                    <template #expand="deliverable">
                      <div
                        v-if="isArticleContentType(deliverable.Main_Content_Type)"
                        class="p-3 deliverable-files-expand"
                      >
                        <p v-if="!deliverable.driveFiles?.length" class="text-muted mb-0">
                          No files found in Google Drive folder.
                        </p>
                        <EasyDataTable
                          v-else
                          class="deliverable-files-table"
                          :headers="pendingFileHeaders"
                          :items="deliverable.driveFiles"
                          :rows-per-page="5"
                          table-class="table-bordered"
                          show-index
                          :searchable="true"
                          buttons-pagination
                        >
                          <template #item-name="file">
                            <a
                              v-if="file.webViewLink"
                              :href="file.webViewLink"
                              target="_blank"
                              rel="noopener"
                              class="text-primary fw-semibold"
                            >
                              {{ file.name }}
                            </a>
                            <span v-else>{{ file.name }}</span>
                          </template>
                          <template #item-note="file">
                            <div class="file-note-cell">
                              <span
                                v-if="file.status"
                                class="badge mb-2"
                                :class="file.status === 'Approved' ? 'bg-success' : 'bg-danger'"
                              >
                                {{ file.status }}
                              </span>
                              <p
                                v-if="getFileNote(deliverable.id, file.id).trim()"
                                class="file-saved-note mb-2"
                              >
                                {{ getFileNote(deliverable.id, file.id) }}
                              </p>
                              <textarea
                                v-if="!isFileReviewComplete(file)"
                                class="form-control form-control-sm"
                                rows="2"
                                :value="getFileNote(deliverable.id, file.id)"
                                :placeholder="`Notes for ${file.name}`"
                                @input="onFileNoteInput(deliverable.id, file.id, $event)"
                              ></textarea>
                              <span
                                v-else-if="!getFileNote(deliverable.id, file.id).trim()"
                                class="text-muted"
                              >
                                —
                              </span>
                            </div>
                          </template>
                          <template #item-actions="fileRow">
                            <div class="file-action-buttons" @click.stop @mousedown.stop>
                              <button
                                type="button"
                                class="btn btn-success btn-sm me-2"
                                :disabled="actionLoading"
                                @mousedown.stop.prevent
                                @click.stop.prevent="approveFileDirect(deliverable.id, fileRow.id)"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                class="btn btn-danger btn-sm"
                                :disabled="actionLoading"
                                @mousedown.stop.prevent
                                @click.stop.prevent="rejectFileDirect(deliverable.id, fileRow.id)"
                              >
                                Reject
                              </button>
                            </div>
                          </template>
                        </EasyDataTable>
                      </div>
                    </template>
                  </EasyDataTable>
                </div>
              </div>

              <div class="tab-pane fade" :class="{ 'show active': activeDeliverablesTab === 'upcoming' }">
                <div class="table-responsive">
                  <EasyDataTable
                    :headers="headers"
                    :items="upcomingDeliverables"
                    :rows-per-page="10"
                    table-class="table-bordered"
                    show-index
                    :searchable="true"
                    buttons-pagination
                  />
                </div>
              </div>

              <div class="tab-pane fade" :class="{ 'show active': activeDeliverablesTab === 'completed' }">
                <div class="col-sm-4">
                  <label for="yearSelect" class="form-label">Select Year</label>
                  <select id="yearSelect" class="form-select w-50 mb-3" v-model="selectedBlock" @change="fetchDataForBlock">
                    <option v-for="(month, index) in monthsArray" :key="index" :value="month">
                      {{ month }}
                    </option>
                  </select>
                </div>
                <div class="table-responsive">
                  <EasyDataTable
                    :headers="completedheaders"
                    :items="completedDeliverables"
                    sort-by="Publish_Date"
                    sort-type="desc"
                    :rows-per-page="10"
                    table-class="table-bordered"
                    show-index
                    buttons-pagination
                  >
                    <template #item-Final_Publication="{ Final_Publication }">
                      <a
                        v-if="Final_Publication"
                        :href="Final_Publication"
                        target="_blank"
                        rel="noopener"
                        class="text-primary text-truncate d-inline-block"
                      >
                        Final Publication
                      </a>
                      <span v-else class="text-muted">—</span>
                    </template>
                  </EasyDataTable>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal for Editing Deliverable -->
        <div class="modal fade" tabindex="-1" :class="{ show: dialog }" style="display: block;" v-if="dialog">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ formTitle }}</h5>
                <button type="button" class="btn-close" @click="close"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Subject</label>
                  <textarea class="form-control" v-model="editedItem.Subject" rows="3"></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" v-model="editedItem.Status">
                    <option
                      v-for="status in ['-None-', 'Email', 'Internal(Automated)', 'Internal(Manual)', 'Phone', 'Web']"
                      :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <!-- <button class="btn btn-secondary" @click="close">Cancel</button> -->
                <button class="btn btn-primary" @click="save">Save</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div class="modal fade" tabindex="-1" :class="{ show: dialogDelete }" style="display: block;"
          v-if="dialogDelete">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Are you sure you want to delete this item?</h5>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" @click="closeDelete">Cancel</button>
                <button class="btn btn-danger" @click="deleteItemConfirm">OK</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="showRejectModal"
      class="deliverable-file-modal-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-deliverable-title"
    >
      <div class="deliverable-file-modal-backdrop" @click="closeRejectModal"></div>
      <div class="deliverable-file-modal-panel shadow-lg">
        <div class="deliverable-file-modal-header">
          <h5 id="reject-deliverable-title" class="mb-0">Reject Deliverable</h5>
          <button type="button" class="btn-close" aria-label="Close" @click="closeRejectModal"></button>
        </div>

        <div class="deliverable-file-modal-body">
          <div class="mb-3">
            <label class="form-label">Reason for Rejection</label>
            <p class="form-text text-muted mb-2">
              *Please provide all feedback by directly redlining the project content document. If you have any additional questions or notes for clarification, please add them in the comments section below.
            </p>
            <textarea class="form-control" v-model="rejectReason" rows="3"></textarea>
          </div>
        </div>

        <div class="deliverable-file-modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeRejectModal" :disabled="actionLoading">
            Cancel
          </button>
          <button type="button" class="btn btn-danger" @click="submitRejection" :disabled="actionLoading">
            <span v-if="actionLoading" class="spinner-border spinner-border-sm me-2"></span>
            Submit
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="approveDialog"
      class="deliverable-file-modal-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approve-deliverable-title"
    >
      <div class="deliverable-file-modal-backdrop" @click="closeApprove"></div>
      <div class="deliverable-file-modal-panel shadow-lg">
        <div class="deliverable-file-modal-header">
          <h5 id="approve-deliverable-title" class="mb-0">Approve Deliverable</h5>
          <button type="button" class="btn-close" aria-label="Close" @click="closeApprove"></button>
        </div>

        <div class="deliverable-file-modal-body">
          <p>Are you sure you want to approve this deliverable?</p>

          <p v-if="isVideoContentType" class="form-text text-muted mb-3">
            *PLEASE NOTE: Once the script and voiceover content are approved, changes cannot be made after video production begins without restarting the project. Please make sure you are completely satisfied with the content prior to approval.
          </p>

          <div class="mb-3">
            <label class="form-label">Approval Note (optional)</label>
            <textarea class="form-control" v-model="approvalNote" rows="3"></textarea>
          </div>
        </div>

        <div class="deliverable-file-modal-footer">
          <button type="button" class="btn btn-secondary me-2" @click="closeApprove" :disabled="actionLoading">
            Cancel
          </button>
          <button type="button" class="btn btn-success" @click="confirmApprove" :disabled="actionLoading">
            <span v-if="actionLoading" class="spinner-border spinner-border-sm me-2"></span>
            Approve
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/userStore';
import { Header } from 'vue3-easy-data-table';
import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'
import { API_BASE_URL, GOOGLE_DRIVE_FOLDER_URL } from '@/api/config';
import { fetchDriveFolderFiles, type DriveItem } from '@/api/googleDrive';
import {
  getDeliverableFileApprovals,
  submitDeliverableFileApproval,
  type DeliverableFileApprovalRecord,
} from '@/api/deliverableFileApproval';

const authStore = useAuthStore();
type DeliverablesTab = 'upcoming' | 'pending' | 'completed';
const activeDeliverablesTab = ref<DeliverablesTab>('pending');

interface Case {
  Case_Number: string;
  Subject: string;
  Status: string;
  Account_Name: string;
}

interface PendingDeliverableFile {
  id: string;
  name: string;
  webViewLink?: string;
  note: string;
  status?: string;
}

/** API row shape for Zoho deliverables lists (filter/sort callbacks). */
interface DeliverableRow {
  id?: string | number;
  Block?: string | number | null;
  Main_Status: string;
  Main_Content_Type?: string;
  Client_Approved?: boolean | null;
  Publish_Date?: string;
  Name?: string;
  Account?: { name?: string };
  Content_Doc?: string;
  content_file_google_url?: string;
  content_doc_url?: string;
  driveFiles?: PendingDeliverableFile[];
}

let cachedDriveFiles: DriveItem[] | null = null;

async function loadDriveFiles(force = false): Promise<DriveItem[]> {
  if (!force && cachedDriveFiles) {
    return cachedDriveFiles;
  }

  const result = await fetchDriveFolderFiles(GOOGLE_DRIVE_FOLDER_URL);
  cachedDriveFiles = result.files ?? [];
  return cachedDriveFiles;
}

function buildDeliverableFiles(driveFiles: DriveItem[]): PendingDeliverableFile[] {
  return driveFiles.map((file, index) => ({
    id: file.id ?? `${file.name ?? 'file'}-${index}`,
    name: file.name ?? 'Untitled',
    webViewLink: file.webViewLink,
    note: '',
  }));
}

function mergeDeliverableFilesWithApprovals(
  driveFiles: PendingDeliverableFile[],
  dbApprovals: DeliverableFileApprovalRecord[]
): PendingDeliverableFile[] {
  const approvalByFileId = new Map(
    dbApprovals.map((approval) => [String(approval.fileId), approval])
  );

  const merged = driveFiles.map((file) => {
    const approval = approvalByFileId.get(String(file.id));
    if (!approval) {
      return file;
    }

    return {
      ...file,
      name: approval.fileName || file.name,
      webViewLink: approval.fileUrl || file.webViewLink,
      note: approval.notes ?? file.note,
      status: approval.status,
    };
  });

  for (const approval of dbApprovals) {
    if (merged.some((file) => String(file.id) === String(approval.fileId))) {
      continue;
    }

    merged.push({
      id: approval.fileId,
      name: approval.fileName,
      webViewLink: approval.fileUrl,
      note: approval.notes ?? '',
      status: approval.status,
    });
  }

  return merged;
}

function buildContentDocFile(
  deliverable: DeliverableRow,
  contentDocUrl: string
): PendingDeliverableFile {
  const deliverableId = deliverable.id != null ? String(deliverable.id) : '';
  // Backend uses FileId as a unique key per deliverable; this synthetic id lets us store approvals for the Content Doc.
  const fileId = deliverableId ? `content-doc-${deliverableId}` : 'content-doc';
  return {
    id: fileId,
    name: 'Content Doc',
    webViewLink: contentDocUrl,
    note: '',
  };
}

async function loadDeliverableFileApprovalsByDeliverableId(
  rows: DeliverableRow[]
): Promise<Map<string, DeliverableFileApprovalRecord[]>> {
  const approvalsByDeliverableId = new Map<string, DeliverableFileApprovalRecord[]>();
  const rowsWithId = rows.filter((row) => row.id != null);

  await Promise.all(
    rowsWithId.map(async (row) => {
      const deliverableId = String(row.id);
      try {
        const approvals = await getDeliverableFileApprovals(deliverableId);
        approvalsByDeliverableId.set(deliverableId, approvals);
      } catch (error) {
        console.error(`Failed to load file approvals for deliverable ${deliverableId}`, error);
        approvalsByDeliverableId.set(deliverableId, []);
      }
    })
  );

  return approvalsByDeliverableId;
}

function resolveContentDocUrl(row: DeliverableRow, driveFiles: DriveItem[] = []): string {
  const zohoContentDoc = row.Content_Doc?.trim();
  if (zohoContentDoc) {
    return zohoContentDoc;
  }

  return resolveContentFileGoogleUrl(row, driveFiles);
}

function resolveContentFileGoogleUrl(row: DeliverableRow, driveFiles: DriveItem[]): string {
  if (row.content_file_google_url) {
    return row.content_file_google_url;
  }

  const topicName = row.Name?.trim().toLowerCase();
  if (topicName) {
    const match = driveFiles.find(
      (file) =>
        file.name?.trim().toLowerCase() === topicName ||
        file.name?.trim().toLowerCase().includes(topicName)
    );
    if (match?.webViewLink) {
      return match.webViewLink;
    }
  }

  return GOOGLE_DRIVE_FOLDER_URL;
}

// Function to generate months relative to the current date
const generateRelativeMonthsArray = (past: number, future: number): string[] => {
  const today = new Date();
  const months: string[] = [];

  // Generate past months
  for (let i = past; i > 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Zero-padded month
    months.push(`${year}-${month}`);
  }

  // Add the current month
  const currentYear = today.getFullYear();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
  months.push(`${currentYear}-${currentMonth}`);

  // Generate future months
  for (let i = 1; i <= future; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Zero-padded month
    months.push(`${year}-${month}`);
  }

  return months;
};

// Generate array of past 12 months and next 12 months
// const monthsArray = ref<string[]>(generateRelativeMonthsArray(12, 12));
const monthsArray = ref<string[]>(["2026", "2025", "2024"]);

const selectedBlock = ref<string>("2026");

const heading = ref("Deliverables")
const search = ref('');

const headers: Header[] = [
  { text: "Block", value: "Block", sortable: true },
  // { text: "Due Date", value: "Due_Date", sortable: true },
  { text: "Status", value: "Status", sortable: true },
  { text: "Content Type", value: "Main_Content_Type", sortable: true },
  { text: "Topic", value: "Name", sortable: true },
  // { text: "Credit Cost", value: "Credit_Cost", sortable: true }
];

const pendingheaders: Header[] = [
  { text: 'Block', value: 'Block', sortable: true },
  { text: 'Content Type', value: 'Main_Content_Type', sortable: true },
  { text: 'Topic', value: 'Name', sortable: true },
  { text: 'Content Doc', value: 'content_doc_url' },
  { text: 'Actions', value: 'actions' },
];

const pendingFileHeaders: Header[] = [
  { text: 'File Name', value: 'name', sortable: true },
  { text: 'Notes', value: 'note' },
  { text: 'Actions', value: 'actions' },
];

const completedheaders = [
  { text: 'Block', value: 'Block', class: 'blockWidth' },
  { text: 'Date Published', value: 'Publish_Date' },
  { text: 'Content Type', value: 'Main_Content_Type' },
  { text: 'Topic', value: 'Name', class: "topicWidth" },
  { text: 'Link', value: 'Final_Publication' }
];

const dialog = ref(false)
const dialogDelete = ref(false)

onMounted(() => {
  fetchDeliverables();
});

const isChecked = ref(false);
const isDisabled = ref(false)
const loading = ref(false);
const actionLoading = ref(false);
const error = ref('');
const items = ref<Case[]>([]);
const upcomingDeliverables = ref<any[]>([]);
const completedDeliverables = ref<any[]>([]);
const pendingDeliverables = ref<any[]>([]);

const deliverablesTabs: DeliverablesTab[] = ['upcoming', 'pending', 'completed'];
const deliverablesByKey = new Map<string, DeliverableRow[]>();

function deliverablesCacheKey(companyId: string, block: string, tab: DeliverablesTab): string {
  return `${companyId}:${block}:${tab}`;
}

function invalidateDeliverablesCacheForBlock(companyId: string, block: string) {
  for (const t of deliverablesTabs) {
    deliverablesByKey.delete(deliverablesCacheKey(companyId, block, t));
  }
}

function isArticleContentType(contentType?: string | null): boolean {
  return (contentType ?? '').trim().toLowerCase() === 'article';
}

function isFileReviewComplete(file: PendingDeliverableFile): boolean {
  return file.status === 'Approved' || file.status === 'Rejected';
}

function getPendingRowClassName(item: DeliverableRow): string {
  return isArticleContentType(item.Main_Content_Type)
    ? 'pending-article-row'
    : 'pending-non-article-row';
}

function findDeliverable(
  deliverableId: string | number | null | undefined
): DeliverableRow | null {
  if (deliverableId == null) return null;
  return (
    pendingDeliverables.value.find((d) => String(d.id) === String(deliverableId)) ?? null
  );
}

async function applyDeliverablesResponse(tab: DeliverablesTab, rows: DeliverableRow[]) {
  items.value = rows as unknown as Case[];
  if (tab === 'upcoming') {
    upcomingDeliverables.value = rows
      .filter((c) => c.Main_Status !== 'Completed' && c.Main_Status !== 'Cancelled')
      .sort((a, b) => {
        const blockA = (a.Block || '').toString();
        const blockB = (b.Block || '').toString();
        return blockA.localeCompare(blockB);
      });
  } else if (tab === 'completed') {
    completedDeliverables.value = rows
      .filter((c) => c.Main_Status === 'Completed')
      .sort((a, b) => {
        const dateA = a.Publish_Date ? new Date(a.Publish_Date).getTime() : 0;
        const dateB = b.Publish_Date ? new Date(b.Publish_Date).getTime() : 0;
        return dateB - dateA;
      });
  } else {
    const pendingRows = rows
      .filter(
        (c) =>
          (c.Main_Status || '').includes('Client Approval') && c.Client_Approved === false
      )
      .sort((a, b) => {
        const blockA = (a.Block || '').toString();
        const blockB = (b.Block || '').toString();
        return blockA.localeCompare(blockB);
      });

    const hasArticleDeliverables = pendingRows.some((row) =>
      isArticleContentType(row.Main_Content_Type)
    );
    const driveFiles = hasArticleDeliverables ? await loadDriveFiles() : [];
    const approvalsByDeliverableId = await loadDeliverableFileApprovalsByDeliverableId(
      pendingRows.filter((row) => isArticleContentType(row.Main_Content_Type))
    );

    pendingDeliverables.value = pendingRows.map((row) => {
      const isArticle = isArticleContentType(row.Main_Content_Type);
      const articleDriveFiles = isArticle ? driveFiles : [];
      const deliverableId = row.id != null ? String(row.id) : '';
      const dbApprovals = deliverableId
        ? approvalsByDeliverableId.get(deliverableId) ?? []
        : [];

      const contentDocUrl =
        resolveContentDocUrl(row, articleDriveFiles) || undefined;

      const baseFiles = isArticle ? buildDeliverableFiles(driveFiles) : [];

      const shouldIncludeContentDocInFilesList =
        isArticle &&
        !!contentDocUrl &&
        contentDocUrl !== GOOGLE_DRIVE_FOLDER_URL;

      if (shouldIncludeContentDocInFilesList && contentDocUrl) {
        baseFiles.unshift(buildContentDocFile(row, contentDocUrl));
      }

      const mergedDriveFiles = isArticle
        ? mergeDeliverableFilesWithApprovals(baseFiles, dbApprovals)
        : [];

      return {
        ...row,
        driveFiles: mergedDriveFiles,
        content_file_google_url: isArticle
          ? resolveContentFileGoogleUrl(row, driveFiles)
          : undefined,
        content_doc_url: contentDocUrl,
      };
    });
  }
}

const changeDeliverablesTab = async (tab: DeliverablesTab) => {
  activeDeliverablesTab.value = tab;
  await fetchDeliverables(tab);
};

const fetchDeliverables = async (
  tab: DeliverablesTab = activeDeliverablesTab.value,
  force = false
) => {
  const companyId = authStore.getCompanyId();
  const block = selectedBlock.value;
  const key = deliverablesCacheKey(companyId, block, tab);

  if (!force && deliverablesByKey.has(key)) {
    await applyDeliverablesResponse(tab, deliverablesByKey.get(key)!);
    error.value = '';
    return;
  }

  loading.value = true;
  try {
    console.log(authStore);
    if (tab === 'pending' && force) {
      cachedDriveFiles = null;
    }
    const response = await axios.get(
      API_BASE_URL + '/Zoho/zoho/deliverables/' + companyId + '/' + block + '/' + tab
    );
    console.log(response);
    error.value = '';
    const rows = [...(response.data.data as DeliverableRow[])];
    deliverablesByKey.set(key, rows);
    await applyDeliverablesResponse(tab, rows);
    console.log('test :' + completedDeliverables);
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
};

// Function to call the API when a month is selected
const fetchDataForBlock = async () => {
  if (!selectedBlock.value) return;
  await fetchDeliverables(activeDeliverablesTab.value);
};

const editedIndex = ref(-1)
const defaultItem: Case = {
  Case_Number: '',
  Subject: '',
  Status: '',
  Account_Name: ''
}
const editedItem = ref<Case>({ ...defaultItem })

const formTitle = computed(() => (editedIndex.value === -1 ? 'New Case' : 'Edit Case'))

// Watchers for dialog and dialogDelete
watch(dialog, (val) => {
  if (!val) close()
})
watch(dialogDelete, (val) => {
  if (!val) closeDelete()
})

// Method to edit an item
const editItem = (item: Case) => {
  editedIndex.value = items.value.indexOf(item)
  editedItem.value = { ...item }
  dialog.value = true
}

// Method to delete an item
const deleteItem = (item: Case) => {
  editedIndex.value = items.value.indexOf(item)
  editedItem.value = { ...item }
  dialogDelete.value = true
}

// Confirm deletion of an item
const deleteItemConfirm = () => {
  items.value.splice(editedIndex.value, 1)
  closeDelete()
}

// Method to close the form dialog
const close = () => {
  dialog.value = false
  editedItem.value = { ...defaultItem }
  editedIndex.value = -1
}

// Method to close the delete confirmation dialog
const closeDelete = () => {
  dialogDelete.value = false
  editedItem.value = { ...defaultItem }
  editedIndex.value = -1
}

// Method to save the edited or new item
const save = () => {
  if (editedIndex.value > -1) {
    Object.assign(items.value[editedIndex.value], editedItem.value)
  } else {
    items.value.push({ ...editedItem.value })
  }
  close()
}

const showRejectModal = ref(false);
const rejectReason = ref("");
const selectedDeliverableId = ref<string | number | null>(null);

const approveDialog = ref(false);
const approvalNote = ref("");

const selectedPendingDeliverable = computed(() =>
  pendingDeliverables.value.find(
    (d) => String(d.id) === String(selectedDeliverableId.value)
  )
);

const isVideoContentType = computed(() => {
  const contentType = (selectedPendingDeliverable.value?.Main_Content_Type ?? '')
    .toString()
    .trim()
    .toLowerCase();
  return contentType === 'video';
});

function findDeliverableFile(
  deliverableId: string | number | null | undefined,
  fileId: string | null | undefined
): { deliverable: DeliverableRow; file: PendingDeliverableFile } | null {
  if (deliverableId == null || !fileId) return null;

  const deliverable = pendingDeliverables.value.find(
    (d) => String(d.id) === String(deliverableId)
  );
  if (!deliverable) return null;

  const file = deliverable.driveFiles?.find(
    (f: PendingDeliverableFile) => String(f.id) === String(fileId)
  );
  if (!file) return null;

  return { deliverable, file };
}

function getFileNote(
  deliverableId: string | number | null | undefined,
  fileId: string | null | undefined
): string {
  return findDeliverableFile(deliverableId, fileId)?.file.note ?? '';
}

function updateFileNote(
  deliverableId: string | number | null | undefined,
  fileId: string | null | undefined,
  note: string
) {
  const ctx = findDeliverableFile(deliverableId, fileId);
  if (ctx) {
    ctx.file.note = note;
  }
}

function onFileNoteInput(
  deliverableId: string | number | null | undefined,
  fileId: string | null | undefined,
  event: Event
) {
  const target = event.target;
  if (target instanceof HTMLTextAreaElement) {
    updateFileNote(deliverableId, fileId, target.value);
  }
}

function openApproveForDeliverable(deliverableId: string | number | null | undefined) {
  const deliverable = findDeliverable(deliverableId);
  if (!deliverable) return;

  selectedDeliverableId.value = deliverable.id ?? null;
  approvalNote.value = '';
  approveDialog.value = true;
}

function openRejectForDeliverable(deliverableId: string | number | null | undefined) {
  const deliverable = findDeliverable(deliverableId);
  if (!deliverable) return;

  selectedDeliverableId.value = deliverable.id ?? null;
  rejectReason.value = '';
  showRejectModal.value = true;
}

async function approveFileDirect(
  deliverableId: string | number | null | undefined,
  fileId: string | null | undefined
) {
  const ctx = findDeliverableFile(deliverableId, fileId);
  if (!ctx) {
    Toastify({
      text: 'Could not find the selected file.',
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#ed5e5e',
      close: true,
      stopOnFocus: true,
    }).showToast();
    return;
  }

  await submitFileApproval(ctx.deliverable, ctx.file, ctx.file.note ?? '');
}

async function rejectFileDirect(
  deliverableId: string | number | null | undefined,
  fileId: string | null | undefined
) {
  const ctx = findDeliverableFile(deliverableId, fileId);
  if (!ctx) {
    Toastify({
      text: 'Could not find the selected file.',
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#ed5e5e',
      close: true,
      stopOnFocus: true,
    }).showToast();
    return;
  }

  if (!ctx.file.note.trim()) {
    Toastify({
      text: 'Please provide a reason for rejection in the notes field.',
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#ed5e5e',
      close: true,
      stopOnFocus: true,
    }).showToast();
    return;
  }

  await submitFileRejection(ctx.deliverable, ctx.file, ctx.file.note);
}

async function submitDeliverableApproval(deliverable: DeliverableRow, note: string) {
  if (!deliverable.id) return;

  actionLoading.value = true;
  try {
    await fetch(`${API_BASE_URL}/Zoho/zoho/deliverables/${deliverable.id}/Approved`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: note.trim(),
        name: deliverable.Name,
        company: deliverable.Account?.name,
      }),
    });

    approveDialog.value = false;
    approvalNote.value = '';
    selectedDeliverableId.value = null;
    invalidateDeliverablesCacheForBlock(authStore.getCompanyId(), selectedBlock.value);
    await fetchDeliverables(activeDeliverablesTab.value, true);
    Toastify({
      text: 'Deliverable approved successfully!',
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#13c56b',
      close: true,
      stopOnFocus: true,
    }).showToast();
  } catch (error) {
    console.error('Approval failed', error);
    Toastify({
      text: 'Failed to approve deliverable.',
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#ed5e5e',
      close: true,
      stopOnFocus: true,
    }).showToast();
  } finally {
    actionLoading.value = false;
  }
}

async function submitDeliverableRejection(deliverable: DeliverableRow, note: string) {
  if (!deliverable.id) return;

  actionLoading.value = true;
  try {
    await fetch(`${API_BASE_URL}/Zoho/zoho/deliverables/${deliverable.id}/Rejected`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: note.trim(),
        name: deliverable.Name,
        company: deliverable.Account?.name,
      }),
    });

    showRejectModal.value = false;
    rejectReason.value = '';
    selectedDeliverableId.value = null;
    invalidateDeliverablesCacheForBlock(authStore.getCompanyId(), selectedBlock.value);
    await fetchDeliverables(activeDeliverablesTab.value, true);
    Toastify({
      text: 'Deliverable status updated successfully!',
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#13c56b',
      close: true,
      stopOnFocus: true,
    }).showToast();
  } catch (error) {
    console.error('Rejection failed', error);
    Toastify({
      text: 'Failed to update the deliverable rejection.',
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#ed5e5e',
      close: true,
      stopOnFocus: true,
    }).showToast();
  } finally {
    actionLoading.value = false;
  }
}

function buildFileApprovalPayload(
  deliverable: DeliverableRow,
  file: PendingDeliverableFile,
  note: string
) {
  return {
    deliverableId: String(deliverable.id),
    companyId: authStore.getCompanyId(),
    fileId: file.id,
    fileName: file.name,
    fileUrl: file.webViewLink ?? '',
    notes: note.trim(),
    name: deliverable.Name,
    company: deliverable.Account?.name,
  };
}

async function submitFileApproval(
  deliverable: DeliverableRow,
  file: PendingDeliverableFile,
  note: string
) {
  if (!deliverable.id) return;

  actionLoading.value = true;
  try {
    await submitDeliverableFileApproval(
      deliverable.id,
      'Approved',
      buildFileApprovalPayload(deliverable, file, note)
    );

    approveDialog.value = false;
    approvalNote.value = '';
    selectedDeliverableId.value = null;
    invalidateDeliverablesCacheForBlock(authStore.getCompanyId(), selectedBlock.value);
    await fetchDeliverables(activeDeliverablesTab.value, true);
    Toastify({
      text: `Approved ${file.name} successfully!`,
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#13c56b',
      close: true,
      stopOnFocus: true,
    }).showToast();
  } catch (error) {
    console.error('Approval failed', error);
    Toastify({
      text: `Failed to approve ${file.name}.`,
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#ed5e5e',
      close: true,
      stopOnFocus: true,
    }).showToast();
  } finally {
    actionLoading.value = false;
  }
}

async function submitFileRejection(
  deliverable: DeliverableRow,
  file: PendingDeliverableFile,
  note: string
) {
  if (!deliverable.id) return;

  actionLoading.value = true;
  try {
    await submitDeliverableFileApproval(
      deliverable.id,
      'Rejected',
      buildFileApprovalPayload(deliverable, file, note)
    );

    showRejectModal.value = false;
    rejectReason.value = '';
    selectedDeliverableId.value = null;
    invalidateDeliverablesCacheForBlock(authStore.getCompanyId(), selectedBlock.value);
    await fetchDeliverables(activeDeliverablesTab.value, true);
    Toastify({
      text: `Rejected ${file.name} successfully!`,
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#13c56b',
      close: true,
      stopOnFocus: true,
    }).showToast();
  } catch (error) {
    console.error('Rejection failed', error);
    Toastify({
      text: `Failed to reject ${file.name}.`,
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#ed5e5e',
      close: true,
      stopOnFocus: true,
    }).showToast();
  } finally {
    actionLoading.value = false;
  }
}

function closeApprove() {
  approveDialog.value = false;
  approvalNote.value = '';
  selectedDeliverableId.value = null;
}

async function confirmApprove() {
  if (!selectedDeliverableId.value || !selectedPendingDeliverable.value) return;
  await submitDeliverableApproval(selectedPendingDeliverable.value, approvalNote.value);
}

const closeRejectModal = () => {
  showRejectModal.value = false;
  rejectReason.value = '';
  selectedDeliverableId.value = null;
};

const submitRejection = async () => {
  if (!rejectReason.value.trim()) {
    Toastify({
      text: 'Please provide a reason for rejection.',
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: '#ed5e5e',
      close: true,
      stopOnFocus: true,
    }).showToast();
    return;
  }

  if (!selectedDeliverableId.value || !selectedPendingDeliverable.value) return;
  await submitDeliverableRejection(selectedPendingDeliverable.value, rejectReason.value);
};

</script>

<style scoped>
.v-btn {
  min-width: 80px;
}

.topicWidth {
  width: 150px;
}

.blockWidth {
  white-space: nowrap;
}

.custom-data-table th:nth-child(0),
.custom-data-table td:nth-child(0) {
  width: 150px;
  text-align: center;
  white-space: nowrap;
}

.nav-tabs .nav-link.active {
  background-color: #198fd9;
  border-color: #198fd9;
  color: #ffffff;
}

.nav-tabs .nav-link {
  color: #198fd9;
}

.deliverable-files-expand {
  background-color: #f8f9fa;
  position: relative;
  z-index: 1;
  overflow: visible;
  padding-bottom: 0.5rem;
}

.pending-deliverables-wrapper {
  overflow: visible;
}

.pending-deliverables-wrapper :deep(.vue3-easy-data-table__main) {
  overflow: visible;
}

.pending-deliverables-wrapper :deep(tr.deliverable-expand-row) {
  position: relative;
  z-index: 1000;
}

.pending-deliverables-wrapper :deep(tr.deliverable-expand-row td.expand) {
  position: relative;
  z-index: 1000;
  overflow: visible;
  background-color: #f8f9fa;
}

.deliverable-files-table {
  --easy-table-rows-per-page-selector-z-index: 99999;
  position: relative;
  z-index: 1;
  overflow: visible;
}

.deliverable-files-expand :deep(.vue3-easy-data-table) {
  overflow: visible;
}

.deliverable-files-expand :deep(.vue3-easy-data-table__main) {
  overflow: visible;
}

.deliverable-files-expand :deep(.vue3-easy-data-table__footer) {
  position: relative;
  z-index: 2;
  overflow: visible;
}

.deliverable-files-expand :deep(.easy-data-table__rows-selector) {
  position: relative;
  z-index: 3;
  overflow: visible;
}
</style>

<style>
/* Unscoped: rows-per-page menu must overlay parent table rows/footer */
.deliverable-files-table .easy-data-table__rows-selector .select-items {
  z-index: 99999 !important;
  background-color: #fff;
  min-width: 4.5rem;
}

.deliverable-files-table .easy-data-table__rows-selector .select-items.show {
  top: auto !important;
  bottom: calc(100% + 4px) !important;
}

.deliverable-files-table .easy-data-table__rows-selector .select-items.inside {
  top: auto !important;
  bottom: calc(100% + 4px) !important;
}

.deliverable-file-modal-root {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.deliverable-file-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.deliverable-file-modal-panel {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 520px;
  background: #fff;
  border-radius: 0.5rem;
  pointer-events: auto;
}

.deliverable-file-modal-header,
.deliverable-file-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #dee2e6;
}

.deliverable-file-modal-footer {
  border-bottom: none;
  border-top: 1px solid #dee2e6;
  justify-content: flex-end;
  gap: 0.5rem;
}

.deliverable-file-modal-body {
  padding: 1rem 1.25rem;
}

.pending-deliverables-wrapper tr.pending-non-article-row td.can-expand {
  pointer-events: none;
  cursor: default;
}

.pending-deliverables-wrapper tr.pending-non-article-row + tr.deliverable-expand-row {
  display: none !important;
}

.pending-deliverables-wrapper td.can-expand .expand-icon {
  border: solid;
  border-color: #212121;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(-45deg);
  transition: 0.2s;
}

.file-action-buttons {
  position: relative;
  z-index: 5;
  pointer-events: auto;
}

.file-note-cell {
  min-width: 220px;
}

.file-saved-note {
  margin-bottom: 0.5rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: #495057;
  font-size: 0.875rem;
}
</style>
