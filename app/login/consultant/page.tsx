import Link from "next/link";

export default function ConsultantLoginPage() {
  return (
    <main className="min-h-screen grid place-items-center bg-[#f7f9fc] p-6">
      <div className="w-full max-w-lg rounded-2xl border border-[#c6c6cf] bg-white p-8 text-center">
        <h1 className="text-3xl font-bold text-[#001b5e]">Consultant Login</h1>
        <p className="mt-3 text-sm text-[#475569]">
          Consultant authentication screen is being prepared.
        </p>
        <Link
          href="/login/patient"
          className="mt-6 inline-flex rounded-xl bg-[#16b46f] px-4 py-2 text-sm font-semibold text-white"
        >
          Go to Patient Login
        </Link>
      </div>
    </main>
  );
}
