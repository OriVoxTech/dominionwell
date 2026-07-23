"use client";

import Link from "next/link";
import {
  type ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  doctorApplicationsApiService,
  getApiErrorMessage,
  patientDoctorsApiService,
  type AdminSpecialty,
  type PublicDoctorsResponse,
} from "@/lib/api";
import {
  formatNigerianPhone,
  isValidEmail,
  isValidNigerianPhoneLocalNumber,
  normalizeNigerianPhoneLocalNumber,
} from "@/lib/form-validation";

const MAX_DOCUMENT_FILES = 5;
const MAX_DOCUMENT_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_DOCUMENT_EXTENSIONS = new Set([
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "doc",
  "docx",
]);

type DoctorApplicationErrors = Partial<
  Record<
    | "fullName"
    | "email"
    | "phoneLocalNumber"
    | "username"
    | "specialtyId"
    | "documents",
    string
  >
>;

function getDoctorUsernameBase(fullName: string) {
  const nameParts = fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((part) => part && part !== "dr" && part !== "doctor");
  const baseName = nameParts.join("");

  if (!baseName) return "";

  return `dr${baseName}`;
}

function selectAvailableDoctorUsername(
  fullName: string,
  existingUsernames: Set<string>,
) {
  const usernameBase = getDoctorUsernameBase(fullName);

  if (!usernameBase) return "";

  if (!existingUsernames.has(usernameBase)) {
    return usernameBase;
  }

  const hash = Array.from(usernameBase).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  for (let offset = 0; offset < 100; offset += 1) {
    const suffix = String((hash + offset) % 100).padStart(2, "0");
    const candidate = `${usernameBase}${suffix}`;

    if (!existingUsernames.has(candidate)) {
      return candidate;
    }
  }

  return "";
}

function getDocumentExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function validateSelectedDocuments(files: File[]) {
  if (files.length === 0) {
    return "Please attach at least one supporting document or license.";
  }

  const invalidFile = files.find(
    (file) => !ACCEPTED_DOCUMENT_EXTENSIONS.has(getDocumentExtension(file.name)),
  );

  if (invalidFile) {
    return "Documents must be PDF, image, or Word files.";
  }

  const oversizedFile = files.find((file) => file.size > MAX_DOCUMENT_FILE_SIZE);

  if (oversizedFile) {
    return "Each document must be 10 MB or smaller.";
  }

  return "";
}

function extractSpecialties(responseData: unknown) {
  if (Array.isArray(responseData)) {
    return responseData as AdminSpecialty[];
  }

  if (
    responseData &&
    typeof responseData === "object" &&
    "data" in responseData &&
    Array.isArray(responseData.data)
  ) {
    return responseData.data as AdminSpecialty[];
  }

  return [];
}

function extractDoctorsResponse(responseData: unknown): PublicDoctorsResponse {
  if (
    responseData &&
    typeof responseData === "object" &&
    "data" in responseData &&
    Array.isArray(responseData.data)
  ) {
    return responseData as PublicDoctorsResponse;
  }

  return {
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 1,
    },
  };
}

export default function JoinDoctorPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneLocalNumber, setPhoneLocalNumber] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [specialties, setSpecialties] = useState<AdminSpecialty[]>([]);
  const [existingDoctorUsernames, setExistingDoctorUsernames] = useState<
    Set<string>
  >(new Set());
  const [doctorUsernamesError, setDoctorUsernamesError] = useState("");
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(true);
  const [isLoadingDoctorUsernames, setIsLoadingDoctorUsernames] =
    useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<DoctorApplicationErrors>({});
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "success" | "error">(
    "info",
  );
  const generatedUsername = selectAvailableDoctorUsername(
    fullName,
    existingDoctorUsernames,
  );
  const emailError =
    email.trim() && !isValidEmail(email) ? "Enter a valid email address." : "";

  const clearFieldError = (field: keyof DoctorApplicationErrors) => {
    setErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors;
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const loadSpecialties = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoadingSpecialties(true);
      setMessage("");
    }

    try {
      const response = await doctorApplicationsApiService.listSpecialties();
      const activeSpecialties = extractSpecialties(response.data).filter(
        (specialty) => specialty.isActive !== false,
      );
      setSpecialties(activeSpecialties);
    } catch (error) {
      setSpecialties([]);
      setMessageTone("error");
      setMessage(getApiErrorMessage(error));
    } finally {
      setIsLoadingSpecialties(false);
    }
  }, []);

  const loadExistingDoctorUsernames = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoadingDoctorUsernames(true);
      setMessage("");
    }
    setDoctorUsernamesError("");

    try {
      const firstPage = await patientDoctorsApiService.list({
        page: 1,
        limit: 100,
      });
      const firstPageData = extractDoctorsResponse(firstPage.data);
      const usernames = new Set(
        firstPageData.data
          .map((doctor) => doctor.user.username?.toLowerCase())
          .filter((username): username is string => Boolean(username)),
      );
      const totalPages = firstPageData.meta.totalPages;

      for (let page = 2; page <= totalPages; page += 1) {
        const response = await patientDoctorsApiService.list({
          page,
          limit: 100,
        });
        extractDoctorsResponse(response.data).data.forEach((doctor) => {
          if (doctor.user.username) {
            usernames.add(doctor.user.username.toLowerCase());
          }
        });
      }

      setExistingDoctorUsernames(usernames);
    } catch (error) {
      setExistingDoctorUsernames(new Set());
      setDoctorUsernamesError(getApiErrorMessage(error));
      setMessageTone("error");
      setMessage(getApiErrorMessage(error));
    } finally {
      setIsLoadingDoctorUsernames(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSpecialties(false);
      void loadExistingDoctorUsernames(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadExistingDoctorUsernames, loadSpecialties]);

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const incomingFiles = Array.from(event.target.files ?? []);
    const rejectedFiles = incomingFiles.filter(
      (file) =>
        !ACCEPTED_DOCUMENT_EXTENSIONS.has(getDocumentExtension(file.name)) ||
        file.size > MAX_DOCUMENT_FILE_SIZE,
    );
    const nextFiles = [...selectedFiles];

    incomingFiles.forEach((file) => {
      const isUnsupported =
        !ACCEPTED_DOCUMENT_EXTENSIONS.has(getDocumentExtension(file.name)) ||
        file.size > MAX_DOCUMENT_FILE_SIZE;
      const alreadySelected = nextFiles.some(
        (currentFile) =>
          currentFile.name === file.name &&
          currentFile.size === file.size &&
          currentFile.lastModified === file.lastModified,
      );

      if (
        !isUnsupported &&
        !alreadySelected &&
        nextFiles.length < MAX_DOCUMENT_FILES
      ) {
        nextFiles.push(file);
      }
    });

    const documentError =
      rejectedFiles.length > 0
        ? "Some files were skipped. Use PDF, image, or Word files up to 10 MB each."
        : validateSelectedDocuments(nextFiles);

    setSelectedFiles(nextFiles);
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      if (documentError) {
        nextErrors.documents = documentError;
      } else {
        delete nextErrors.documents;
      }
      return nextErrors;
    });

    event.target.value = "";
  };

  const removeSelectedFile = (fileToRemove: File) => {
    setSelectedFiles((currentFiles) =>
      currentFiles.filter(
        (file) =>
          file.name !== fileToRemove.name ||
          file.size !== fileToRemove.size ||
          file.lastModified !== fileToRemove.lastModified,
      ),
    );
    clearFieldError("documents");
  };

  const validateForm = () => {
    const nextErrors: DoctorApplicationErrors = {};
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFullName) {
      nextErrors.fullName = "Full name is required.";
    } else if (trimmedFullName.length < 3) {
      nextErrors.fullName = "Enter the doctor's full name.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Email address is required.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!phoneLocalNumber) {
      nextErrors.phoneLocalNumber = "Phone number is required.";
    } else if (!isValidNigerianPhoneLocalNumber(phoneLocalNumber)) {
      nextErrors.phoneLocalNumber = "Enter a 10-digit Nigerian phone number.";
    }

    if (!generatedUsername) {
      nextErrors.username = "Enter a full name so we can generate a username.";
    }

    if (!specialtyId) {
      nextErrors.specialtyId = "Select a medical specialty.";
    }

    const documentsError = validateSelectedDocuments(selectedFiles);
    if (documentsError) {
      nextErrors.documents = documentsError;
    }

    setErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const phone = formatNigerianPhone(phoneLocalNumber);
    const username = generatedUsername;
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setMessageTone("error");
      setMessage("Please fix the highlighted fields before sending your request.");
      return;
    }

    if (isLoadingDoctorUsernames || doctorUsernamesError) {
      setMessageTone("error");
      setMessage(
        "Please wait while we confirm the generated username is available.",
      );
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await doctorApplicationsApiService.submit({
        fullName: trimmedFullName,
        email: trimmedEmail,
        phone,
        username,
        specialtyId,
        documents: selectedFiles,
      });

      formElement.reset();
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFullName("");
      setEmail("");
      setPhoneLocalNumber("");
      setSpecialtyId("");
      setSelectedFiles([]);
      setErrors({});
      setMessageTone("success");
      setMessage(
        "Your doctor application request has been sent. Our verification team will review it soon.",
      );
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      const hasPendingApplication = errorMessage
        .toLowerCase()
        .includes("pending application already exists");

      setMessageTone(hasPendingApplication ? "info" : "error");
      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageStyles =
    messageTone === "success"
      ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
      : messageTone === "error"
        ? "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]"
        : "border-[#dbe4f0] bg-[#f8fafc] text-[#334155]";

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#191c1e]">
      <header className="border-b border-[#dbe4f0] bg-white/90 px-4 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="text-lg font-extrabold text-[#001b5e]">
            DominionWell+
          </Link>
          <Link href="/login/doctor" className="rounded-lg border border-[#c6c6cf] px-4 py-2 text-sm font-semibold text-[#001b5e] hover:bg-[#f8fafc]">
            Doctor Login
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-[0.85fr_1.15fr] md:px-10 md:py-16">
        <div className="rounded-[2rem] bg-[#001b5e] p-7 text-white md:p-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#74fcad]">Join our care network</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Apply to become a DominionWell+ doctor.</h1>
          <p className="mt-5 text-sm leading-7 text-[#d8e2ff]">
            Submit your provider details, specialty, licenses, and supporting documents. Our verification team will review your application before granting access.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Verified patient access",
              "Secure virtual consultation tools",
              "Wallet and subscription-powered earnings",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
                <span className="material-symbols-outlined text-[#74fcad]">check_circle</span>
                <span className="text-sm text-[#eef4ff]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[2rem] border border-[#dbe4f0] bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#001b5e]">Doctor application</h2>
            <p className="mt-2 text-sm text-[#64748b]">Fields marked with * are required.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Full name *</span>
              <input
                name="fullName"
                required
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  clearFieldError("fullName");
                  clearFieldError("username");
                }}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={
                  errors.fullName ? "doctor-full-name-error" : undefined
                }
                className={`mt-2 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#16b46f] ${
                  errors.fullName ? "border-[#ef4444]" : "border-[#cbd5e1]"
                }`}
                placeholder="Dr. Ada Lovelace"
              />
              {errors.fullName ? (
                <span id="doctor-full-name-error" className="mt-1 block text-xs text-[#b91c1c]">
                  {errors.fullName}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Email *</span>
              <input
                name="email"
                required
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearFieldError("email");
                }}
                aria-invalid={Boolean(errors.email || emailError)}
                aria-describedby={
                  errors.email || emailError ? "doctor-email-error" : undefined
                }
                className={`mt-2 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:border-[#16b46f] ${
                  errors.email || emailError ? "border-[#ef4444]" : "border-[#cbd5e1]"
                }`}
                placeholder="doctor@example.com"
              />
              {errors.email || emailError ? (
                <span id="doctor-email-error" className="mt-1 block text-xs text-[#b91c1c]">
                  {errors.email || emailError}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Phone *</span>
              <div
                className={`mt-2 flex h-11 w-full overflow-hidden rounded-xl border focus-within:border-[#16b46f] ${
                  errors.phoneLocalNumber
                    ? "border-[#ef4444]"
                    : "border-[#cbd5e1]"
                }`}
              >
                <span className="flex items-center border-r border-[#cbd5e1] bg-[#f8fafc] px-3 text-sm font-semibold text-[#001b5e]">
                  +234
                </span>
                <input
                  name="phoneLocalNumber"
                  required
                  type="tel"
                  inputMode="numeric"
                  value={phoneLocalNumber}
                  onChange={(event) => {
                    setPhoneLocalNumber(
                      normalizeNigerianPhoneLocalNumber(event.target.value),
                    );
                    clearFieldError("phoneLocalNumber");
                  }}
                  aria-invalid={Boolean(errors.phoneLocalNumber)}
                  aria-describedby={
                    errors.phoneLocalNumber ? "doctor-phone-error" : undefined
                  }
                  className="h-full min-w-0 flex-1 px-3 text-sm outline-none"
                  placeholder="8012345678"
                />
              </div>
              {errors.phoneLocalNumber ? (
                <span id="doctor-phone-error" className="mt-1 block text-xs text-[#b91c1c]">
                  {errors.phoneLocalNumber}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Generated username *</span>
              <input
                name="username"
                required
                readOnly
                value={generatedUsername}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={
                  errors.username ? "doctor-username-error" : undefined
                }
                className={`mt-2 h-11 w-full rounded-xl border bg-[#f8fafc] px-3 text-sm text-[#475569] outline-none ${
                  errors.username ? "border-[#ef4444]" : "border-[#cbd5e1]"
                }`}
                placeholder={
                  isLoadingDoctorUsernames
                    ? "Checking existing usernames..."
                    : "Generated from full name"
                }
              />
              {errors.username ? (
                <span id="doctor-username-error" className="mt-1 block text-xs text-[#b91c1c]">
                  {errors.username}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Specialty *</span>
              <select
                name="specialtyId"
                required
                value={specialtyId}
                onChange={(event) => {
                  setSpecialtyId(event.target.value);
                  clearFieldError("specialtyId");
                }}
                aria-invalid={Boolean(errors.specialtyId)}
                aria-describedby={
                  errors.specialtyId ? "doctor-specialty-error" : undefined
                }
                disabled={isLoadingSpecialties || specialties.length === 0}
                className={`mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:border-[#16b46f] disabled:cursor-not-allowed disabled:bg-[#f1f5f9] disabled:text-[#94a3b8] ${
                  errors.specialtyId ? "border-[#ef4444]" : "border-[#cbd5e1]"
                }`}
              >
                <option value="" disabled>
                  {isLoadingSpecialties
                    ? "Loading specialties..."
                    : specialties.length === 0
                      ? "No specialties available"
                      : "Select specialty"}
                </option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
              {errors.specialtyId ? (
                <span id="doctor-specialty-error" className="mt-1 block text-xs text-[#b91c1c]">
                  {errors.specialtyId}
                </span>
              ) : null}
            </label>
          </div>

          {!isLoadingSpecialties && specialties.length === 0 ? (
            <div className="mt-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
              <p>No active medical specialties are available right now.</p>
              <button
                type="button"
                onClick={() => void loadSpecialties()}
                className="mt-2 text-xs font-semibold underline"
              >
                Try again
              </button>
            </div>
          ) : null}

          {doctorUsernamesError ? (
            <div className="mt-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
              <p>Unable to check existing doctor usernames.</p>
              <button
                type="button"
                onClick={() => void loadExistingDoctorUsernames()}
                className="mt-2 text-xs font-semibold underline"
              >
                Try again
              </button>
            </div>
          ) : null}

          <div className="mt-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Supporting documents and licenses *</span>
                <p className="mt-1 text-xs text-[#64748b]">Upload up to {MAX_DOCUMENT_FILES} files. PDF, images, and Word documents are supported.</p>
              </div>
              {selectedFiles.length > 0 && selectedFiles.length < MAX_DOCUMENT_FILES ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-fit rounded-lg border border-[#001b5e]/20 px-3 py-2 text-xs font-semibold text-[#001b5e] hover:bg-[#f8fafc]"
                >
                  Add more
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              name="documents"
              type="file"
              multiple
              onChange={handleFilesSelected}
              aria-invalid={Boolean(errors.documents)}
              aria-describedby={
                errors.documents ? "doctor-documents-error" : undefined
              }
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            />
            {selectedFiles.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`mt-3 flex w-full flex-col items-center justify-center rounded-xl border border-dashed bg-[#f8fafc] p-6 text-center text-sm text-[#475569] hover:border-[#16b46f] hover:bg-[#f0fdf4] ${
                  errors.documents ? "border-[#ef4444]" : "border-[#94a3b8]"
                }`}
              >
                <span className="material-symbols-outlined mb-2 text-[#001b5e]">upload_file</span>
                <span className="font-semibold text-[#001b5e]">Select files</span>
                <span className="mt-1 text-xs text-[#64748b]">You can add multiple files now or add more later.</span>
              </button>
            ) : null}
            {errors.documents ? (
              <span id="doctor-documents-error" className="mt-2 block text-xs text-[#b91c1c]">
                {errors.documents}
              </span>
            ) : null}
          </div>

          {selectedFiles.length > 0 ? (
            <div className="mt-4 rounded-xl border border-[#dbe4f0] bg-[#f8fafc] p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Selected files</p>
                <p className="text-xs font-semibold text-[#64748b]">{selectedFiles.length}/{MAX_DOCUMENT_FILES}</p>
              </div>
              <ul className="space-y-1 text-sm text-[#475569]">
                {selectedFiles.map((file) => (
                  <li key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3">
                    <span className="truncate">{file.name}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-[#64748b]">{Math.ceil(file.size / 1024)} KB</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(file)}
                        className="rounded-md border border-[#ef4444]/30 px-2 py-1 text-[11px] font-semibold text-[#b91c1c] hover:bg-[#fef2f2]"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {selectedFiles.length >= MAX_DOCUMENT_FILES ? (
                <p className="mt-3 text-xs text-[#b45309]">Maximum of {MAX_DOCUMENT_FILES} files reached.</p>
              ) : null}
            </div>
          ) : null}

          {message ? (
            <p className={`mt-4 rounded-xl border px-4 py-3 text-sm ${messageStyles}`}>
              {message}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href="/" className="rounded-xl border border-[#c6c6cf] px-5 py-3 text-center text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]">
              Back Home
            </Link>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingSpecialties ||
                specialties.length === 0 ||
                isLoadingDoctorUsernames ||
                Boolean(doctorUsernamesError)
              }
              className="rounded-xl bg-[#16b46f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#149660] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
