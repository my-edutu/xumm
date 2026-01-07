# Feature: Multi-Modal Media Capture (Audio/Video/Photo)

## 📝 The Journey
XUM AI's power comes from diverse data. I built three distinct capture engines to handle voice, vision, and semantic feedback. The goal was to make capturing as easy as sending a WhatsApp voice note.

### Engineering Decisions
- **Capture Choice Hub**: A clean gateway where users select their preferred capture method based on the task type.
- **Video Capture Engine**:
    - Uses `navigator.mediaDevices.getUserMedia` for the camera stream.
    - Implemented a circular recording button with a red "pulse" animation.
    - Integrated `MediaRecorder` API to handle chunks and final blob creation.
- **Audio Capture Engine**:
    - Focused on high-fidelity linguistic sampling.
    - Waveform visualizer (mocked via pulse animation) to show the user that their voice is being "heard."
- **Photo Capture**:
    - High-resolution snap mechanism with an instant preview before submission.

## 💻 Implementation Details
- **File**: `user-app/screens/TaskScreens.tsx`
- **Components**: `CaptureVideoScreen`, `CaptureAudioScreen`, `MediaCaptureScreen`.
- **Hardware Integration**: Uses Browser Media APIs.

### Visual State Logic
- `isRecording`: Toggles the UI from "Ready" to "Active" mode.
- `recordedBlob`: Stores the final output for S3 upload.

## 🧪 Verification
- [x] Camera permissions requested on first use.
- [x] Record/Stop cycle correctly generates a valid Blob.
- [x] Microphone level feedback (pulsing) works during recording.
