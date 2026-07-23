"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import PublicHeader from "@/components/public-header";
import { getApiErrorMessage, getApiResponseMessage, patientAuthApi } from "@/lib/api";
import {
  formatNigerianPhone,
  isValidEmail,
  isValidNigerianPhoneLocalNumber,
  normalizeNigerianPhoneLocalNumber,
} from "@/lib/form-validation";

type RegistrationField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword";

type RegistrationErrors = Partial<Record<RegistrationField, string>>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"create" | "verify">("create");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const emailError =
    email.trim() && !isValidEmail(email) ? "Enter a valid email address." : "";
  const isRegistrationValid =
    Boolean(firstName.trim()) &&
    Boolean(lastName.trim()) &&
    isValidEmail(email) &&
    isValidNigerianPhoneLocalNumber(phone) &&
    password.length >= 8 &&
    confirmPassword === password;

  const validateRegistration = () => {
    const nextErrors: RegistrationErrors = {};

    if (!firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!lastName.trim()) nextErrors.lastName = "Last name is required.";

    if (!email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!phone) {
      nextErrors.phone = "Phone number is required.";
    } else if (!isValidNigerianPhoneLocalNumber(phone)) {
      nextErrors.phone = "Enter a 10-digit Nigerian phone number.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const clearFieldError = (field: RegistrationField) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiError("");
  };

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError("");

    if (!validateRegistration()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await patientAuthApi.register({
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
        confirmPassword,
        phone: formatNigerianPhone(phone),
        role: "PATIENT",
      });
      setStep("verify");
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOtpError("");
    setOtpMessage("");

    if (otpCode.trim().length !== 6) {
      setOtpError("Enter the complete 6-digit OTP code.");
      return;
    }

    setIsVerifying(true);

    try {
      await patientAuthApi.verify({
        email: email.trim().toLowerCase(),
        otp: otpCode,
      });

      router.push("/login/patient?verified=success");
    } catch (error) {
      setOtpError(getApiErrorMessage(error));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    setOtpMessage("");
    setIsResending(true);

    try {
      const response = await patientAuthApi.resendOtp({
        email: email.trim().toLowerCase(),
      });

      setOtpMessage(getApiResponseMessage(response.data, "A new OTP has been sent to your email."));
    } catch (error) {
      setOtpError(getApiErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f7fbff,#ffffff_55%,#effcf6)] text-[#191c1e]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-[720px] px-4 py-8 md:px-10 md:py-12">
        <section className="rounded-[1.5rem] border border-[#dbe4ee] bg-white p-5 shadow-[0_16px_45px_rgba(0,27,94,0.07)] sm:p-8">
          <div className="mb-5 sm:mb-6">
            <div className="mb-1.5 flex items-center gap-2 sm:gap-3 sm:mb-2">
              <Link
                href="/login/patient"
                aria-label="Back"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </Link>
              <h1 className="text-xl font-bold text-[#001b5e] sm:text-2xl">
                {step === "create" ? "Create Patient Account" : "Verify OTP"}
              </h1>
            </div>
            <p className="text-xs text-[#475569] sm:text-sm">
              {step === "create"
                ? "Registration is currently available for patients only."
                : "Enter the 6-digit code sent to your email to complete your registration."}
            </p>
          </div>

          {step === "create" ? (
            <form className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2" onSubmit={handleCreateAccount} noValidate>
              <label className="block text-xs sm:text-sm md:col-span-2">
                <span className="mb-1 block font-medium text-[#334155]">Account Type</span>
                <input
                  type="text"
                  value="Patient"
                  readOnly
                  disabled
                  className="h-10 w-full cursor-not-allowed rounded-lg border border-[#c6c6cf] bg-[#f8fafc] px-3 text-xs text-[#64748b] sm:text-sm"
                />
              </label>

              <label className="block text-xs sm:text-sm">
                <span className="mb-1 block font-medium text-[#334155]">First Name</span>
                <input
                  className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm"
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  required
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={errors.firstName ? "first-name-error" : undefined}
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    clearFieldError("firstName");
                  }}
                />
                {errors.firstName ? <span id="first-name-error" className="mt-1 block text-xs text-[#b91c1c]">{errors.firstName}</span> : null}
              </label>
              <label className="block text-xs sm:text-sm">
                <span className="mb-1 block font-medium text-[#334155]">Last Name</span>
                <input
                  className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm"
                  type="text"
                  name="lastName"
                  autoComplete="family-name"
                  required
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby={errors.lastName ? "last-name-error" : undefined}
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value);
                    clearFieldError("lastName");
                  }}
                />
                {errors.lastName ? <span id="last-name-error" className="mt-1 block text-xs text-[#b91c1c]">{errors.lastName}</span> : null}
              </label>
              <label className="block text-xs sm:text-sm md:col-span-2">
                <span className="mb-1 block font-medium text-[#334155]">Email Address</span>
                <input
                  className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(errors.email || emailError)}
                  aria-describedby={errors.email || emailError ? "email-error" : undefined}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearFieldError("email");
                  }}
                />
                {errors.email || emailError ? <span id="email-error" className="mt-1 block text-xs text-[#b91c1c]">{errors.email || emailError}</span> : null}
              </label>
              <label className="block text-xs sm:text-sm md:col-span-2">
                <span className="mb-1 block font-medium text-[#334155]">Phone Number</span>
                <div className="flex h-10 w-full overflow-hidden rounded-lg border border-[#c6c6cf] focus-within:border-[#0aa4b4]">
                  <span className="flex items-center border-r border-[#c6c6cf] bg-[#f8fafc] px-3 text-xs font-semibold text-[#001b5e] sm:text-sm">+234</span>
                  <input
                    className="h-full min-w-0 flex-1 px-3 text-xs outline-none sm:text-sm"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    inputMode="numeric"
                    required
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    value={phone}
                    onChange={(event) => {
                      setPhone(normalizeNigerianPhoneLocalNumber(event.target.value));
                      clearFieldError("phone");
                    }}
                    placeholder="8012345678"
                  />
                </div>
                {errors.phone ? <span id="phone-error" className="mt-1 block text-xs text-[#b91c1c]">{errors.phone}</span> : null}
              </label>
              <label className="block text-xs sm:text-sm">
                <span className="mb-1 block font-medium text-[#334155]">Password</span>
                <div className="relative">
                  <input
                    className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 pr-10 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : "password-help"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      clearFieldError("password");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-0 top-0 grid h-10 w-10 place-items-center text-[#64748b] hover:text-[#001b5e]"
                  >
                    <span className="material-symbols-outlined text-[19px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
                {errors.password ? (
                  <span id="password-error" className="mt-1 block text-xs text-[#b91c1c]">{errors.password}</span>
                ) : (
                  <span id="password-help" className="mt-1 block text-xs text-[#64748b]">Use at least 8 characters.</span>
                )}
              </label>
              <label className="block text-xs sm:text-sm">
                <span className="mb-1 block font-medium text-[#334155]">Confirm Password</span>
                <div className="relative">
                  <input
                    className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 pr-10 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      clearFieldError("confirmPassword");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                    aria-pressed={showConfirmPassword}
                    className="absolute right-0 top-0 grid h-10 w-10 place-items-center text-[#64748b] hover:text-[#001b5e]"
                  >
                    <span className="material-symbols-outlined text-[19px]">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
                {errors.confirmPassword ? <span id="confirm-password-error" className="mt-1 block text-xs text-[#b91c1c]">{errors.confirmPassword}</span> : null}
              </label>

              {apiError ? (
                <p role="alert" aria-live="polite" className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c] sm:text-sm md:col-span-2">
                  {apiError}
                </p>
              ) : null}

              <div className="mt-2 md:col-span-2">
                <button
                  className="w-full rounded-lg bg-[#16b46f] py-2.5 text-xs font-semibold text-white hover:bg-[#149660] disabled:cursor-not-allowed disabled:bg-[#94a3b8] disabled:hover:bg-[#94a3b8] sm:text-sm"
                  type="submit"
                  disabled={isSubmitting || !isRegistrationValid}
                >
                  {isSubmitting ? "Creating account..." : "Register as Patient"}
                </button>
              </div>

              <p className="md:col-span-2 text-center text-xs text-[#475569] sm:text-sm">
                Already have an account?{" "}
                <Link href="/login/patient" className="font-semibold text-[#0aa4b4]">
                  Login
                </Link>
              </p>
            </form>
          ) : (
            <form className="grid grid-cols-1 gap-3 sm:gap-4" onSubmit={handleVerifyOtp}>
              <div className="rounded-lg border border-[#c6c6cf] bg-[#f8fafc] px-3 py-2.5 text-xs text-[#475569] sm:text-sm">
                Code sent to {email || "your email"}.
              </div>

              <label className="block text-xs sm:text-sm">
                <span className="mb-1 block font-medium text-[#334155]">OTP Code</span>
                <input
                  className="h-11 w-full rounded-lg border border-[#c6c6cf] px-3 text-center text-sm tracking-[0.35em] outline-none focus:border-[#0aa4b4] sm:text-base"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  aria-invalid={Boolean(otpError)}
                  aria-describedby={otpError ? "otp-error" : otpMessage ? "otp-message" : undefined}
                  value={otpCode}
                  onChange={(event) => {
                    setOtpCode(event.target.value.replace(/\D/g, ""));
                    setOtpError("");
                    setOtpMessage("");
                  }}
                />
              </label>

              {otpError ? (
                <p id="otp-error" role="alert" aria-live="polite" className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c] sm:text-sm">
                  {otpError}
                </p>
              ) : null}

              {otpMessage ? (
                <p id="otp-message" role="status" aria-live="polite" className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-xs text-[#15803d] sm:text-sm">
                  {otpMessage}
                </p>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep("create")}
                  disabled={isVerifying || isResending}
                  className="h-10 flex-1 rounded-lg border border-[#c6c6cf] text-xs font-semibold text-[#334155] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                >
                  Back to Edit Details
                </button>
                <button
                  type="submit"
                  disabled={otpCode.length !== 6 || isVerifying || isResending}
                  className="h-10 flex-1 rounded-lg bg-[#16b46f] text-xs font-semibold text-white hover:bg-[#149660] disabled:cursor-not-allowed disabled:bg-[#94a3b8] disabled:hover:bg-[#94a3b8] sm:text-sm"
                >
                  {isVerifying ? "Verifying..." : "Verify OTP"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isVerifying || isResending}
                className="justify-self-center text-xs font-semibold text-[#0aa4b4] hover:underline disabled:cursor-not-allowed disabled:text-[#94a3b8] disabled:no-underline sm:text-sm"
              >
                {isResending ? "Resending OTP..." : "Resend OTP"}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
