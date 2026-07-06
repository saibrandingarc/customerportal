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

            <ul class="nav nav-tabs nav-justified deliverables-tabs mb-3">
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
                <p class="pending-tab-note text-muted mb-3">
                  <strong>Note:</strong> Please provide all feedback by directly redlining the project content document. If you have any additional questions or notes for clarification, please add them in the comments section below.
                </p>
                <div class="pending-deliverables-wrapper d-none d-md-block">
                  <EasyDataTable
                    ref="pendingDataTableRef"
                    :headers="pendingheaders"
                    :items="pendingDeliverables"
                    :rows-per-page="10"
                    :index-column-width="48"
                    table-class="table-bordered"
                    show-index
                    :searchable="true"
                    sort-by="Block"
                    sort-type="desc"
                    buttons-pagination
                    @update-page-items="onPendingPageItems"
                  >
                    <template #body>
                      <tbody class="vue3-easy-data-table__body">
                        <template
                          v-for="(deliverable, index) in pendingPageItems"
                          :key="deliverable.id ?? index"
                        >
                          <tr
                            :class="[
                              getPendingRowClassName(deliverable),
                              { 'even-row': (index + 1) % 2 === 0 },
                            ]"
                          >
                            <td>{{ getPendingRowNumber(index) }}</td>
                            <td>{{ deliverable.Block }}</td>
                            <td>{{ deliverable.Main_Content_Type }}</td>
                            <td>{{ deliverable.Name }}</td>
                            <td>
                              <span class="text-muted">—</span>
                            </td>
                          </tr>
                          <tr class="deliverable-expand-row">
                            <td :colspan="pendingRowColspan" class="expand">
                              <div class="deliverable-files-expand">
                                <p
                                  v-if="isVideoContentTypeValue(deliverable.Main_Content_Type)"
                                  class="video-content-note mb-2"
                                >
                                  *PLEASE NOTE: Once the script and voiceover content are approved, changes cannot be made after video production begins without restarting the project. Please make sure you are completely satisfied with the content prior to approval.
                                </p>
                                <p v-if="!deliverable.driveFiles?.length" class="text-muted mb-0">
                                  No files found in Google Drive folder.
                                </p>
                                <EasyDataTable
                                  v-else
                                  class="deliverable-files-table"
                                  :headers="pendingFileHeaders"
                                  :items="deliverable.driveFiles"
                                  :rows-per-page="5"
                                  :index-column-width="48"
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
                                        v-if="file.status === 'Approved'"
                                        class="badge bg-success file-status-badge"
                                      >
                                        {{ file.status }}
                                      </span>
                                      <p
                                        v-if="
                                          isFileReviewComplete(file) &&
                                          getFileNote(deliverable.id, file.id).trim()
                                        "
                                        class="file-saved-note"
                                      >
                                        {{ getFileNote(deliverable.id, file.id) }}
                                      </p>
                                      <textarea
                                        v-if="!isFileReviewComplete(file)"
                                        class="form-control form-control-sm file-note-textarea"
                                        rows="2"
                                        :value="getFileNote(deliverable.id, file.id)"
                                        @input="onFileNoteInput(deliverable.id, file.id, $event)"
                                      ></textarea>
                                      <span
                                        v-else-if="!getFileNote(deliverable.id, file.id).trim()"
                                        class="text-muted file-note-empty"
                                      >
                                        —
                                      </span>
                                    </div>
                                  </template>
                                  <template #item-actions="fileRow">
                                    <div class="file-action-buttons" @click.stop @mousedown.stop>
                                      <button
                                        type="button"
                                        class="btn btn-success btn-sm file-action-btn"
                                        :disabled="actionLoading"
                                        @mousedown.stop.prevent
                                        @click.stop.prevent="
                                          approveFileDirect(deliverable.id, fileRow.id)
                                        "
                                      >
                                        Approve
                                      </button>
                                      <button
                                        type="button"
                                        class="btn btn-danger btn-sm file-action-btn"
                                        :disabled="actionLoading"
                                        @mousedown.stop.prevent
                                        @click.stop.prevent="
                                          rejectFileDirect(deliverable.id, fileRow.id)
                                        "
                                      >
                                        Feedback
                                      </button>
                                    </div>
                                  </template>
                                </EasyDataTable>
                              </div>
                            </td>
                          </tr>
                        </template>
                      </tbody>
                    </template>
                  </EasyDataTable>
                </div>

                <!-- Mobile card view -->
                <div class="d-md-none deliverable-cards">
                  <p v-if="!pendingDeliverables.length" class="text-muted text-center py-3 mb-0">
                    No data available
                  </p>
                  <div v-for="(row, i) in pendingDeliverables" :key="row.id ?? i" class="deliverable-card">
                    <div class="dc-row">
                      <span class="dc-label">Block</span>
                      <span class="dc-value fw-semibold">{{ row.Block }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Content Type</span>
                      <span class="dc-value">{{ row.Main_Content_Type }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Topic</span>
                      <span class="dc-value">{{ row.Name }}</span>
                    </div>

                    <p
                      v-if="isVideoContentTypeValue(row.Main_Content_Type)"
                      class="video-content-note mb-2"
                    >
                      *PLEASE NOTE: Once the script and voiceover content are approved, changes cannot be made after video production begins without restarting the project. Please make sure you are completely satisfied with the content prior to approval.
                    </p>
                    <div class="dc-files mt-2">
                      <p v-if="!row.driveFiles?.length" class="text-muted mb-0">
                        No files found in Google Drive folder.
                      </p>
                      <div v-for="file in row.driveFiles" :key="file.id" class="dc-file">
                        <div class="d-flex align-items-center justify-content-between">
                          <a v-if="file.webViewLink" :href="file.webViewLink" target="_blank" rel="noopener"
                            class="text-primary fw-semibold">{{ file.name }}</a>
                          <span v-else class="fw-semibold">{{ file.name }}</span>
                          <span v-if="file.status === 'Approved'" class="badge ms-2 bg-success">{{ file.status }}</span>
                        </div>
                        <p v-if="isFileReviewComplete(file) && getFileNote(row.id, file.id).trim()" class="file-saved-note">
                          {{ getFileNote(row.id, file.id) }}
                        </p>
                        <textarea
                          v-if="!isFileReviewComplete(file)"
                          class="form-control form-control-sm file-note-textarea"
                          rows="2"
                          :value="getFileNote(row.id, file.id)"
                          @input="onFileNoteInput(row.id, file.id, $event)"
                        ></textarea>
                        <div v-if="!isFileReviewComplete(file)" class="file-action-buttons mt-2">
                          <button type="button" class="btn btn-success btn-sm file-action-btn" :disabled="actionLoading"
                            @click="approveFileDirect(row.id, file.id)">Approve</button>
                          <button type="button" class="btn btn-danger btn-sm file-action-btn" :disabled="actionLoading"
                            @click="rejectFileDirect(row.id, file.id)">Feedback</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="tab-pane fade" :class="{ 'show active': activeDeliverablesTab === 'upcoming' }">
                <div class="table-responsive d-none d-md-block">
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

                <!-- Mobile card view -->
                <div class="d-md-none deliverable-cards">
                  <p v-if="!upcomingDeliverables.length" class="text-muted text-center py-3 mb-0">
                    No data available
                  </p>
                  <div v-for="(row, i) in upcomingDeliverables" :key="row.id ?? i" class="deliverable-card">
                    <div class="dc-row">
                      <span class="dc-label">Block</span>
                      <span class="dc-value fw-semibold">{{ row.Block }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Status</span>
                      <span class="dc-value">{{ row.Status }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Content Type</span>
                      <span class="dc-value">{{ row.Main_Content_Type }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Topic</span>
                      <span class="dc-value">{{ row.Name }}</span>
                    </div>
                  </div>
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
                <div class="table-responsive d-none d-md-block">
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

                <!-- Mobile card view -->
                <div class="d-md-none deliverable-cards">
                  <p v-if="!completedDeliverables.length" class="text-muted text-center py-3 mb-0">
                    No data available
                  </p>
                  <div v-for="(row, i) in completedDeliverables" :key="row.id ?? i" class="deliverable-card">
                    <div class="dc-row">
                      <span class="dc-label">Block</span>
                      <span class="dc-value fw-semibold">{{ row.Block }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Date Published</span>
                      <span class="dc-value">{{ row.Publish_Date }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Content Type</span>
                      <span class="dc-value">{{ row.Main_Content_Type }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Topic</span>
                      <span class="dc-value">{{ row.Name }}</span>
                    </div>
                    <div class="dc-row">
                      <span class="dc-label">Link</span>
                      <span class="dc-value">
                        <a v-if="row.Final_Publication" :href="row.Final_Publication" target="_blank" rel="noopener"
                          class="text-primary">Final Publication</a>
                        <span v-else class="text-muted">—</span>
                      </span>
                    </div>
                  </div>
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
          <h5 id="reject-deliverable-title" class="mb-0">Feedback</h5>
          <button type="button" class="btn-close" aria-label="Close" @click="closeRejectModal"></button>
        </div>

        <div class="deliverable-file-modal-body">
          <div class="mb-3">
            <label class="form-label">Feedback</label>
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
  GDrive_Folder?: string | null;
  content_doc_url?: string;
  driveFiles?: PendingDeliverableFile[];
}

const driveFilesByFolderUrl = new Map<string, DriveItem[]>();

const MONTH_NAMES = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

function isDriveFolder(item: DriveItem): boolean {
  return item.mimeType === 'application/vnd.google-apps.folder';
}

function isDriveFile(item: DriveItem): boolean {
  return !isDriveFolder(item);
}

function resolveDeliverableFolderUrl(row: DeliverableRow): string {
  const gdriveFolder = row.GDrive_Folder?.trim();
  if (gdriveFolder) {
    return gdriveFolder;
  }

  const contentFileUrl = row.content_file_google_url?.trim();
  if (contentFileUrl?.includes('/folders/')) {
    return contentFileUrl;
  }

  return GOOGLE_DRIVE_FOLDER_URL;
}

function usesSharedDefaultFolder(row: DeliverableRow): boolean {
  return resolveDeliverableFolderUrl(row) === GOOGLE_DRIVE_FOLDER_URL;
}

function getBlockFolderMatchTerms(block?: string | number | null): string[] {
  if (block == null) {
    return [];
  }

  const blockStr = block.toString().trim();
  if (!blockStr) {
    return [];
  }

  const terms = new Set<string>([blockStr.toLowerCase()]);
  const match = blockStr.match(/^(\d{4})-(\d{1,2})$/);
  if (!match) {
    return [...terms];
  }

  const year = match[1];
  const monthIndex = parseInt(match[2], 10) - 1;
  if (monthIndex >= 0 && monthIndex < 12) {
    const monthName = MONTH_NAMES[monthIndex];
    terms.add(`${monthName} ${year}`);
    terms.add(`${monthName.slice(0, 3)} ${year}`);
  }

  return [...terms];
}

function findMatchingDriveSubfolder(
  row: DeliverableRow,
  rootItems: DriveItem[]
): DriveItem | null {
  const folders = rootItems.filter(isDriveFolder);
  if (!folders.length) {
    return null;
  }

  const blockTerms = getBlockFolderMatchTerms(row.Block);
  const topicName = row.Name?.trim().toLowerCase();
  const accountName = row.Account?.name?.trim().toLowerCase();

  for (const folder of folders) {
    const folderName = folder.name?.trim().toLowerCase() ?? '';
    if (!folderName) {
      continue;
    }

    if (blockTerms.some((term) => folderName === term || folderName.includes(term))) {
      return folder;
    }
    if (topicName && (folderName === topicName || folderName.includes(topicName))) {
      return folder;
    }
    if (accountName && folderName.includes(accountName)) {
      return folder;
    }
  }

  return null;
}

function filterDriveFilesForRow(row: DeliverableRow, driveFiles: DriveItem[]): DriveItem[] {
  if (!usesSharedDefaultFolder(row)) {
    return driveFiles;
  }

  const topicName = row.Name?.trim().toLowerCase();
  const accountName = row.Account?.name?.trim().toLowerCase();
  const block = row.Block?.toString().trim().toLowerCase();

  if (!topicName && !accountName && !block) {
    return driveFiles;
  }

  return driveFiles.filter((file) => {
    const fileName = file.name?.trim().toLowerCase() ?? '';
    if (!fileName) {
      return false;
    }

    const normalizedAccount = accountName?.replace(/\s+/g, '') ?? '';
    const matchesTopic =
      !!topicName && (fileName === topicName || fileName.includes(topicName));
    const matchesAccount =
      !!normalizedAccount &&
      (fileName.includes(normalizedAccount) || fileName.includes(accountName ?? ''));
    const matchesBlock = !!block && fileName.includes(block);

    return matchesTopic || matchesAccount || matchesBlock;
  });
}

async function loadDriveFilesForFolder(
  folderUrl: string,
  force = false
): Promise<DriveItem[]> {
  const normalizedUrl = folderUrl.trim();
  if (!normalizedUrl) {
    return [];
  }

  if (!force && driveFilesByFolderUrl.has(normalizedUrl)) {
    return driveFilesByFolderUrl.get(normalizedUrl)!;
  }

  try {
    const result = await fetchDriveFolderFiles(normalizedUrl);
    const files = result.files ?? [];
    driveFilesByFolderUrl.set(normalizedUrl, files);
    return files;
  } catch (error) {
    console.error(`Failed to load Google Drive files for folder ${normalizedUrl}`, error);
    driveFilesByFolderUrl.set(normalizedUrl, []);
    return [];
  }
}

async function loadDriveFilesForRows(rows: DeliverableRow[], force = false): Promise<void> {
  await loadDriveFilesForFolder(GOOGLE_DRIVE_FOLDER_URL, force);

  const folderUrls = [
    ...new Set(
      rows
        .map((row) => resolveDeliverableFolderUrl(row))
        .filter((url) => url !== GOOGLE_DRIVE_FOLDER_URL)
    ),
  ];
  await Promise.all(folderUrls.map((folderUrl) => loadDriveFilesForFolder(folderUrl, force)));
}

async function resolveRowDriveFiles(row: DeliverableRow, force = false): Promise<DriveItem[]> {
  const folderUrl = resolveDeliverableFolderUrl(row);

  if (!usesSharedDefaultFolder(row)) {
    const files = await loadDriveFilesForFolder(folderUrl, force);
    return files.filter(isDriveFile);
  }

  const rootFiles =
    driveFilesByFolderUrl.get(GOOGLE_DRIVE_FOLDER_URL) ??
    (await loadDriveFilesForFolder(GOOGLE_DRIVE_FOLDER_URL, force));

  const matchedSubfolder = findMatchingDriveSubfolder(row, rootFiles);
  if (matchedSubfolder?.webViewLink) {
    const subfolderFiles = await loadDriveFilesForFolder(matchedSubfolder.webViewLink, force);
    const filesInSubfolder = subfolderFiles.filter(isDriveFile);
    if (filesInSubfolder.length > 0) {
      return filesInSubfolder;
    }

    // Some drives keep month PDFs alongside the month folder at the root level.
    return rootFiles.filter(isDriveFile);
  }

  return filterDriveFilesForRow(row, rootFiles.filter(isDriveFile));
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
  { text: 'Actions', value: 'actions' },
];

const pendingRowColspan = 5;
const pendingDataTableRef = ref<{ currentPageFirstIndex?: number } | null>(null);
const pendingPageItems = ref<DeliverableRow[]>([]);

const pendingFileHeaders: Header[] = [
  { text: 'File Name', value: 'name', sortable: true, width: 240 },
  { text: 'Notes', value: 'note', width: 280 },
  { text: 'Actions', value: 'actions', width: 200 },
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

function getPendingRowClassName(_item: DeliverableRow): string {
  return 'pending-deliverable-row';
}

function isFileReviewComplete(file: PendingDeliverableFile): boolean {
  return file.status === 'Approved' || file.status === 'Rejected';
}

function isVideoContentTypeValue(contentType?: string | null): boolean {
  return (contentType ?? '').toString().trim().toLowerCase().includes('article');
}

function getPendingRowNumber(index: number): number {
  const firstIndex = pendingDataTableRef.value?.currentPageFirstIndex ?? 0;
  return firstIndex + index + 1;
}

function onPendingPageItems(items: DeliverableRow[]) {
  pendingPageItems.value = items;
}

function findDeliverable(
  deliverableId: string | number | null | undefined
): DeliverableRow | null {
  if (deliverableId == null) return null;
  return (
    pendingDeliverables.value.find((d) => String(d.id) === String(deliverableId)) ?? null
  );
}

async function applyDeliverablesResponse(
  tab: DeliverablesTab,
  rows: DeliverableRow[],
  forceRefreshDriveFiles = false
) {
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

    await loadDriveFilesForRows(pendingRows, forceRefreshDriveFiles);
    const approvalsByDeliverableId = await loadDeliverableFileApprovalsByDeliverableId(
      pendingRows
    );

    pendingDeliverables.value = await Promise.all(
      pendingRows.map(async (row) => {
        const deliverableId = row.id != null ? String(row.id) : '';
        const dbApprovals = deliverableId
          ? approvalsByDeliverableId.get(deliverableId) ?? []
          : [];

        const rowDriveFiles = await resolveRowDriveFiles(row, forceRefreshDriveFiles);
        const contentDocUrl = resolveContentDocUrl(row, rowDriveFiles) || undefined;
        const baseFiles = buildDeliverableFiles(rowDriveFiles);

        if (contentDocUrl) {
          baseFiles.push(buildContentDocFile(row, contentDocUrl));
        }

        const mergedDriveFiles = mergeDeliverableFilesWithApprovals(baseFiles, dbApprovals);

        return {
          ...row,
          driveFiles: mergedDriveFiles,
          content_file_google_url: resolveContentFileGoogleUrl(row, rowDriveFiles),
          content_doc_url: contentDocUrl,
        };
      })
    );
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
      driveFilesByFolderUrl.clear();
    }
    const response = await axios.get(
      API_BASE_URL + '/Zoho/zoho/deliverables/' + companyId + '/' + block + '/' + tab
    );
    console.log(response);
    error.value = '';
    const rows = [...(response.data.data as DeliverableRow[])];
    deliverablesByKey.set(key, rows);
    await applyDeliverablesResponse(tab, rows, force);
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

const isVideoContentType = computed(() =>
  isVideoContentTypeValue(selectedPendingDeliverable.value?.Main_Content_Type)
);

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
      text: 'Please provide feedback in the notes field.',
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
      text: 'Feedback submitted successfully!',
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
      text: 'Failed to submit feedback.',
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
      text: `Feedback submitted for ${file.name} successfully!`,
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
      text: `Failed to submit feedback for ${file.name}.`,
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
      text: 'Please provide feedback.',
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

.pending-tab-note {
  font-size: 0.8rem;
  font-style: italic;
  line-height: 1.5;
}

.video-content-note {
  font-size: 0.8rem;
  font-style: italic;
  line-height: 1.5;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

/* Mobile card view for tables */
.deliverable-card {
  border: 1px solid #e9ebec;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.dc-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 5px 0;
  font-size: 14px;
}

.dc-row + .dc-row {
  border-top: 1px dashed #f0f0f0;
}

.dc-label {
  color: #878a99;
  font-weight: 500;
  flex: 0 0 auto;
}

.dc-value {
  text-align: right;
  word-break: break-word;
}

.dc-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.dc-actions .btn {
  flex: 1;
}

.dc-file {
  border-top: 1px solid #eee;
  padding: 0.75rem 0;
  margin: 0;
}

.dc-file:first-child {
  border-top: none;
  padding-top: 0;
}

.dc-file .file-note-textarea {
  max-width: 100%;
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

.deliverables-tabs {
  border-bottom: 1px solid #dee2e6;
}

.deliverables-tabs .nav-item {
  margin-bottom: -1px;
}

.deliverables-tabs .nav-link {
  color: #198fd9;
  text-align: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
  white-space: nowrap;
}

.deliverables-tabs .nav-link:hover {
  background-color: rgba(25, 143, 217, 0.08);
}

.deliverables-tabs .nav-link.active {
  background-color: #198fd9;
  border-color: #198fd9;
  color: #ffffff;
}

@media (max-width: 575.98px) {
  .deliverables-tabs .nav-link {
    padding: 0.45rem 0.35rem;
    font-size: 0.8rem;
  }
}

.deliverable-files-expand {
  background-color: #ffffff;
  position: relative;
  z-index: 1;
  overflow: visible;
  padding: 0.75rem;
}

.deliverable-files-table :deep(table) {
  table-layout: fixed;
  width: 100%;
}

.deliverable-files-table :deep(.vue3-easy-data-table__header th),
.deliverable-files-table :deep(.vue3-easy-data-table__body td) {
  vertical-align: middle;
  padding: 0.5rem 0.75rem;
}

.deliverable-files-table :deep(.vue3-easy-data-table__header th) {
  background-color: rgba(25, 143, 217, 0.12);
  color: #198fd9;
}

.deliverable-files-table :deep(.vue3-easy-data-table__body td) {
  overflow: hidden;
}

.deliverable-files-table :deep(.vue3-easy-data-table__header th:nth-child(1)),
.deliverable-files-table :deep(.vue3-easy-data-table__body td:nth-child(1)) {
  width: 48px;
  min-width: 48px;
  max-width: 48px;
  text-align: center;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.deliverable-files-table :deep(.vue3-easy-data-table__header th:nth-child(2)),
.deliverable-files-table :deep(.vue3-easy-data-table__body td:nth-child(2)) {
  width: 240px;
}

.deliverable-files-table :deep(.vue3-easy-data-table__header th:nth-child(3)),
.deliverable-files-table :deep(.vue3-easy-data-table__body td:nth-child(3)) {
  width: 280px;
}

.deliverable-files-table :deep(.vue3-easy-data-table__header th:nth-child(4)),
.deliverable-files-table :deep(.vue3-easy-data-table__body td:nth-child(4)) {
  width: 200px;
  min-width: 200px;
}

.pending-deliverables-wrapper :deep(.vue3-easy-data-table__header th) {
  vertical-align: middle;
  padding: 0.5rem 0.75rem;
  background-color: rgba(25, 143, 217, 0.12);
  color: #198fd9;
}

.pending-deliverables-wrapper :deep(tr.pending-deliverable-row td) {
  vertical-align: middle;
  padding: 0.5rem 0.75rem;
}

.pending-deliverables-wrapper :deep(.vue3-easy-data-table__header th:first-child),
.pending-deliverables-wrapper :deep(tr.pending-deliverable-row td:first-child) {
  width: 48px;
  min-width: 48px;
  max-width: 48px;
  text-align: center;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.pending-deliverables-wrapper :deep(tr.pending-deliverable-row td),
.pending-deliverables-wrapper :deep(tr.deliverable-expand-row > td.expand) {
  vertical-align: middle;
}

.pending-deliverables-wrapper :deep(tr.deliverable-expand-row td.expand) {
  position: relative;
  z-index: 1000;
  overflow: visible;
  background-color: #ffffff;
  padding: 0;
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
  z-index: 10;
  overflow: visible;
}

.deliverable-files-expand :deep(.easy-data-table__rows-selector) {
  position: relative;
  z-index: 11;
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

.file-action-buttons {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  position: relative;
  z-index: 5;
  pointer-events: auto;
  white-space: nowrap;
}

.file-action-btn {
  min-width: 82px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25;
}

.file-note-cell {
  width: 100%;
  min-width: 0;
  margin: 0;
}

.file-status-badge {
  display: inline-block;
  margin-bottom: 0.5rem;
}

.file-saved-note {
  margin: 0 0 0.5rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: #000000;
  font-size: 14px;
  line-height: 1.4;
}

.file-note-textarea {
  display: block;
  width: 100%;
  min-height: 56px;
  height: 56px;
  resize: none;
  margin: 0;
  box-sizing: border-box;
  color: #000000;
  font-size: 14px;
  line-height: 1.4;
  padding: 0.375rem 0.5rem;
}

.file-note-empty {
  display: block;
  min-height: 56px;
  line-height: 56px;
  margin: 0;
}
</style>
