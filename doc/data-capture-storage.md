# XUM Data Capture & Storage Architecture

This document details the end-to-end flow of data capture within the XUM AI ecosystem, from the mobile application to the Hetzner S3 object storage and Supabase metadata layer.

## Overview

The XUM application provides a "Neural Input" gateway through the central action button. This gateway is divided into two primary streams:
1. **Capture Data**: Environmental sensing (Voice, Image, Video, Text).
2. **XUM Linguasense**: Semantic grounding and linguistic tasks.

## Data Capture Flow

### 1. User Initiation
Users select a capture protocol (e.g., "Record Voice") from the **Capture Choice** screen.

### 2. Presigned URL Request
Before data transmission, the client requests a presigned PUT URL from the Supabase Edge Function `storage-manager`.
- **Reasoning**: This eliminates the need for the client to hold permanent S3 credentials, following the principle of least privilege.
- **Function**: `StorageService.getUploadUrl(fileName, contentType)`
- **Bucket**: `xum-raw-submissions` (Hetzner S3 in `fsn1` region).

### 3. Direct S3 Upload
The client performs a binary `PUT` request directly to the Hetzner S3 endpoint using the received presigned URL.
- **Reliability**: This minimizes load on the Supabase infrastructure and allows for large file handling (Video/Audio).
- **Service**: `StorageService.uploadToS3(url, blob)`

### 4. Metadata Recording
Once the S3 upload is successful, the client notifies the Supabase backend by calling `TaskService.submitPayload`.
- **Table**: `public.submissions`
- **Fields**:
  - `task_id`: Linked task identifier.
  - `user_id`: Contributor's unique identifier.
  - `submission_data`: JSONB containing metadata, labels, and the S3 path (`raw/images/...`).
  - `status`: Defaults to `pending` until verified by the validation layer.

## Storage Tiers (Hetzner S3)

| Bucket Name | Purpose | Access Level |
|-------------|---------|--------------|
| `xum-raw-submissions` | Incoming raw data from users. | Private (Presigned only) |
| `xum-processed-datasets` | Production-ready, cleaned data batches. | Private (Company access) |
| `xum-public-assets` | App icons, UI images, and avatars. | Public-Read |

## Security & Integrity

- **Auth Requirement**: Every request to `storage-manager` requires a valid Supabase JWT.
- **Path Isolation**: Files are stored under `raw/{timestamp}_{filename}` to prevent collisions.
- **Verification**: Submissions remain in `pending` status until cross-referenced by other network nodes or the AI validation engine.

## Implementation Details

- **Frontend**: React-based screens (`MediaCaptureScreen`, `CaptureAudioScreen`, `CaptureVideoScreen`).
- **Backend**: Supabase Edge Functions (Deno) using AWS SDK for S3 compatibility.
- **Database**: PostgreSQL with JSONB for flexible payload storage.
