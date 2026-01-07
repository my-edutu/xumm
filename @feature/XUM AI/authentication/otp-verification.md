# Feature: Forgot Password & OTP (Access Recovery)

## 📝 The Journey
Account recovery is often a friction point. I kept it minimal: a recovery request screen followed by a highly interactive OTP (One-Time Password) entry.

### Engineering Decisions
- **OTP Auto-Focus**: This was critical for mobile UX. I used a `useRef` array for the 4 inputs. When a digit is typed, the focus automatically jumps to the next `ref`.
- **Intelligent Deletion**: Pressing `Backspace` on an empty field automatically moves focus to the previous digit.
- **Visual Feedback**: The OTP inputs use a larger font and cyan color to denote it's a security-critical field.

## 💻 Implementation Details
- **File**: `user-app/screens/AuthScreens.tsx`
- **Components**: `ForgotPasswordScreen`, `OTPScreen`
- **Logic**: 
    - Regex validation `/^\d*$/` on OTP inputs to prevent non-numeric characters.
    - `otp` state as an array of 4 strings.

## 🧪 Verification
- [x] OTP focus moves forward on input.
- [x] OTP focus moves backward on delete.
- [x] "Resend code" timer UX (placeholder).
