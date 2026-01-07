# XUM AI - Storage & Dataset Infrastructure
**Technical Strategy: Hetzner S3 + Supabase Edge Functions**

---

## 🏗️ Overview
This document outlines the architecture for handling massive datasets (audio, video, images) within the XUM AI ecosystem. It leverages **Hetzner Object Storage (S3 Compatible)** for cost-effective, high-speed storage and **Supabase Edge Functions** for secure, serverless access control.

## 📦 Infrastructure Strategy

### 1. Bucket Organization
We use a tiered bucket system to separate concerns and optimize for large-scale data processing:

| Bucket Name | Access Level | Purpose |
| :--- | :--- | :--- |
| `xum-raw-submissions` | Private | Stores every raw file uploaded by contributors. |
| `xum-processed-datasets` | Private | Stores curated, validated, and compressed datasets for clients. |
| `xum-public-assets` | Public-Read | Avatars, task icons, and UI assets. |

### 2. Location & Performance
- **Primary Location**: `fsn1` (Falkenstein, Germany).
- **Endpoint**: `https://fsn1.your-objectstorage.com`
- **Tooling**: We use **`s5cmd`** for high-speed dataset assembly and internal transfers.

---

## 🔄 The Data Journey (End-to-End)

### Step 1: User Submission (Upload)
To handle large files without overloading our API, users upload **directly** to Hetzner S3.
1. **Request**: The Mobile App requests an upload URL from the `storage-manager` Edge Function.
2. **Authorize**: The Edge Function verifies the user's session and the specific `taskId`.
3. **Presign**: The Edge Function generates a **Presigned PUT URL** (valid for 15 mins).
4. **Upload**: The Mobile App performs a `PUT` request directly to the Hetzner S3 endpoint.
5. **Callback**: Once complete, the App notifies Supabase to update the `submissions` table state.

### Step 2: Validation & Processing
1. **Review**: Admins or higher-tier validators use presigned links to view/listen to the submission.
2. **Batching**: Once tasks are validated, a background process (or `s5cmd` script) bundles files into a `.zip` or `.parquet` format within `xum-processed-datasets`.

### Step 3: Company Retrieval (Download)
1. **Query**: Company Dashboard queries the `datasets` table for available downloads.
2. **Request Link**: The company clicks "Download", calling the `storage-manager` Edge Function.
3. **Internal Log**: The system logs that `Company_X` accessed `Dataset_Y`.
4. **Presign**: The function returns a **Presigned GET URL** for the large dataset file.
5. **Download**: The company browser/CLI downloads the file directly from Hetzner.

---

## 🛠️ Security & Optimization

### 🔐 Access Control
- **No Long-Lived Keys**: No AWS/S3 keys are ever stored on the client side. Only the Edge Function has the `SECRET_KEY`.
- **CORS Config**: Hetzner buckets are configured to only allow requests from `*.xum-ai.app` and `localhost` (for dev).
- **Virtual Addressing**: Enabled for global compatibility.

### 🚀 Speed Optimization
- **Parallel Uploads**: Large files are split into parts and uploaded in parallel using S3 Multipart Uploads (handled by the client SDK).
- **CDN**: We use a CDN (Cloudflare or Hetzner's edge) specifically for the `xum-public-assets` bucket to reduce latency for UI components.

---

## 📋 Tooling Recommendation (Recap)
For Developers and Ops:
- **`s5cmd`**: Use for all server-side dataset movements (20x faster than standard CLI).
- **MinIO Client (`mc`)**: Use for managing bucket policies and user permissions manually.
- **Supabase CLI**: For deploying the `storage-manager` edge function.

---

**Last Updated**: December 30, 2025  
**Strategic Goal**: Zero-bottleneck data flow for petabyte-scale datasets.
