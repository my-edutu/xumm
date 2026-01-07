# Hetzner S3 Setup & Integration Guide
**From Bucket Creation to Dataset Download**

---

## 1. Initial Setup (Hetzner Console)
1. Log in to your [Hetzner Console](https://console.hetzner.cloud/).
2. Navigate to **Object Storage**.
3. Create your three buckets:
   - `xum-raw-submissions`
   - `xum-processed-datasets`
   - `xum-public-assets`
4. Go to **Settings** -> **Keys** and generate a new Access/Secret Key pair.
   - **CRITICAL**: Copy the Secret Key immediately. You cannot see it again.

---

## 2. Configure Supabase Edge Function
To allow the `storage-manager` function to communicate with Hetzner, set the environment variables in your Supabase project:

```bash
# Run these commands in your terminal
supabase secrets set HETZNER_S3_ACCESS_KEY="your_access_key"
supabase secrets set HETZNER_S3_SECRET_KEY="your_secret_key"
supabase secrets set HETZNER_S3_REGION="fsn1"
supabase secrets set HETZNER_S3_ENDPOINT="https://fsn1.your-objectstorage.com"
```

Then deploy the function:
```bash
supabase functions deploy storage-manager
```

---

## 3. The Developer Workflow (Testing)

### A. Generating an Upload URL (Frontend Call)
When a user wants to upload an audio clip for a task:
```javascript
const { data, error } = await supabase.functions.invoke('storage-manager', {
  body: {
    action: 'GET-UPLOAD-URL',
    bucket: 'xum-raw-submissions',
    fileName: 'user_123/task_456/voice_record.mp3',
    contentType: 'audio/mpeg'
  }
})

// Now use the 'data.url' to perform a direct PUT request
await fetch(data.url, {
  method: 'PUT',
  body: audioBlob,
  headers: { 'Content-Type': 'audio/mpeg' }
})
```

### B. Generating a Download URL (Admin/Company)
When an admin needs to review a submission or a company downloads a dataset:
```javascript
const { data, error } = await supabase.functions.invoke('storage-manager', {
  body: {
    action: 'GET-DOWNLOAD-URL',
    bucket: 'xum-processed-datasets',
    fileName: 'client_A/exports/dataset_v1.zip'
  }
})

// data.url will be a temporary link (1 hour) to the file
window.open(data.url)
```

---

## 4. Managing Large Datasets with CLI (`s5cmd`)
For massive operations (moving 100GB+ of data), use `s5cmd`.

### Configuration
Create a file `~/.aws/credentials`:
```ini
[default]
aws_access_key_id = YOUR_HETZNER_KEY
aws_secret_access_key = YOUR_HETZNER_SECRET
```

Create `~/.aws/config`:
```ini
[default]
region = fsn1
endpoint_url = https://fsn1.your-objectstorage.com
```

### Common Commands
- **List files speed-test**: `s5cmd ls s3://xum-raw-submissions/`
- **Move validated files**: `s5cmd mv s3://xum-raw-submissions/validated/* s3://xum-processed-datasets/pending_batch/`
- **Download entire dataset**: `s5cmd cp s3://xum-processed-datasets/export_2025/* ./local_storage/`

---

## 5. Troubleshooting
- **CORS Errors**: Ensure your Hetzner Bucket CORS policy allows `PUT` and `GET` from your domain.
- **Access Denied**: Double-check that your Access Key has permissions for the specific bucket.
- **Slow Uploads**: For files >100MB, implement **Multipart Upload** logic in the mobile app instead of a single `PUT`.

---
**Status**: Ready for Implementation.
**Professional Advice**: Always rotate your Secret Keys every 90 days.
