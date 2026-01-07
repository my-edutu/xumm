# Feature: Storage Service (S3 Integration)

## 📝 The Journey
Storing massive amounts of media data on a standard database is impossible. I built the `StorageService` to handle "Large Object Handshakes" with Hetzner/S3 compatible storage.

### Engineering Decisions
- **Security-First Uploads**: We don't use public buckets. The service first requests a "Signed URL" from our API. The client then uploads directly to the storage provider, keeping our main server lightweight.
- **Binary Stream Handling**: The `uploadToS3` method uses `PUT` with the correct `Content-Type` headers so the storage provider doesn't corrupt the files.
- **Handshake Verification**: Only after the binary upload is 100% complete does the service return the public URL to be logged in the database.

## 💻 Implementation Details
- **File**: `user-app/screens/TaskScreens.tsx`
- **Service**: `StorageService` object.

### Deployment Logic
- `getUploadUrl(fileName, contentType)`: Fetches the write destination.
- `uploadToS3(url, blob)`: Executes the binary transfer.

## 🧪 Verification
- [x] Presigned URL generation prevents unauthorized uploads.
- [x] Large video files (10MB+) upload without timeout.
- [x] Correct MIME types (video/mp4, audio/wav) set on upload.
