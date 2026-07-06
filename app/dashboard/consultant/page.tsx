import Image from "next/image";
import Link from "next/link";

export default function ConsultantDashboardPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
      <aside className="fixed left-0 top-0 z-40 flex h-full w-[280px] flex-col bg-[#0d1b3d] px-4 py-8 text-white shadow-md">
        <div className="mb-8 px-2">
          <span className="text-1xl font-extrabold text-[#7784ac]">DominionWell+</span>
        </div>

        <div className="mb-8 flex items-center gap-4 px-2">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#16b36c] bg-[#e0e3e6]">
            <Image
              className="object-cover"
              alt="Dr. Richardson"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBveWw5sJYO4vcFdjWVdbuGQDlC0JKaMeg6jsjDDSJkIwdRjG_4H_Ao7x2stxD6kTx4oY4DP80Tf-kMczLWJQqZw7ajzN4HpSFJ0W7qcoFs9bxbSpMN7PrAqivavfdvvECjYhZNcT_25wMoRamMlavt1GZ5bU5v1LXmZRreRkSDQzcoG5jXyD19NtcvpsAZFGHlPJkNdm6Vme6nV5SmbMT-CGGHwt91t_aHyC2bbT4qoU6rYhO4t232jYBYnX0OKrxpnI_i4VeK-yJ_"
              fill
              sizes="48px"
              unoptimized
            />
          </div>
          <div>
            <p className="font-semibold text-[#7784ac]">Dr. Richardson</p>
            <p className="text-xs text-[#7784ac]/80">Senior Cardiologist</p>
          </div>
        </div>

        <div className="flex-grow space-y-2 text-sm">
          <a className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b36c] bg-[#74fcad] p-3 text-[#007443]" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="#">
            <span className="material-symbols-outlined">medical_services</span>
            <span>Consultations</span>
          </a>
          <a className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="#">
            <span className="material-symbols-outlined">group</span>
            <span>Patients</span>
          </a>
          <a className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="#">
            <span className="material-symbols-outlined">calendar_month</span>
            <span>Schedule</span>
          </a>
          <a className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="#">
            <span className="material-symbols-outlined">analytics</span>
            <span>Reports</span>
          </a>
          <a className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </a>
        </div>

        <div className="mt-auto space-y-2 border-t border-[#7784ac]/10 pt-6 text-sm">
          <button className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#16b36c] px-4 py-3 font-semibold text-white">
            <span className="material-symbols-outlined">add</span>
            <span>New Consultation</span>
          </button>
          <a className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="#">
            <span className="material-symbols-outlined">help</span>
            <span>Help Center</span>
          </a>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      <main className="ml-[280px] min-h-screen p-6 md:p-10">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold text-[#00020d]">Physician Dashboard</h1>
            <p className="text-sm text-[#45464e]">Welcome back, Dr. Richardson. You have 8 appointments today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="h-10 w-10 rounded-full border-2 border-white bg-[#e0e3e6]" />
              <div className="h-10 w-10 rounded-full border-2 border-white bg-[#e0e3e6]" />
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#74fcad] text-[10px] font-bold text-[#00210f]">
                +5
              </div>
            </div>
            <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#c6c6cf] bg-[#f7f9fc] p-2 hover:bg-[#eceef1]">
              <span className="material-symbols-outlined text-[#45464e]">notifications</span>
              <span className="h-2 w-2 rounded-full bg-[#ba1a1a]" />
            </div>
          </div>
        </header>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-start justify-between">
              <div className="rounded-lg bg-[#16b36c]/10 p-2">
                <span className="material-symbols-outlined text-[#16b36c]">event_available</span>
              </div>
              <span className="text-xs font-bold text-[#16b36c]">+12%</span>
            </div>
            <h3 className="text-sm text-[#45464e]">Appointments Today</h3>
            <p className="text-2xl font-semibold text-[#00020d]">14</p>
          </div>

          <div className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-start justify-between">
              <div className="rounded-lg bg-[#67d6e7]/20 p-2">
                <span className="material-symbols-outlined text-[#0093a2]">pending_actions</span>
              </div>
              <span className="text-xs font-bold text-[#16b36c]">+12%</span>
            </div>
            <h3 className="text-sm text-[#45464e]">Completed Consultations</h3>
            <p className="text-2xl font-semibold text-[#00020d]">06</p>
          </div>

          <div className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-start justify-between">
              <div className="rounded-lg bg-[#00020d]/5 p-2">
                <span className="material-symbols-outlined text-[#00020d]">group</span>
              </div>
              <span className="text-xs font-bold text-[#45464e]">Total</span>
            </div>
            <h3 className="text-sm text-[#45464e]">New Patients</h3>
            <p className="text-2xl font-semibold text-[#00020d]">28</p>
          </div>

          <div className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-start justify-between">
              <div className="rounded-lg bg-[#16b36c]/10 p-2">
                <span className="material-symbols-outlined text-[#16b36c]">monitoring</span>
              </div>
              <span className="text-xs font-bold text-[#16b36c]">98%</span>
            </div>
            <h3 className="text-sm text-[#45464e]">Patient Satisfaction</h3>
            <p className="text-2xl font-semibold text-[#00020d]">4.9/5</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6 lg:col-span-8">
            <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-1xl font-semibold text-[#00020d]">New Consultation Requests</h2>
                <button className="text-sm font-medium text-[#16b36c] hover:underline">View All</button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col justify-between gap-4 rounded-lg border border-[#c6c6cf] bg-[#f2f4f7] p-4 md:flex-row md:items-center">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full bg-[#e0e3e6]">
                      <Image
                        className="object-cover"
                        alt="Arthur Morgan"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBicIz7a3L5D-fduW62tVRqHFqZexE0XphWfvSduFvdydH_wSj91I_6WgDLDk91VxmF-YNvBR6gsmcJyx0afr3rKJ8qBFVfMAwyNQJfgfiOqCiDVjf-t2bm_1gE0HvCIE9XQxALQIUHHsDXj3erqg3kdqYbiO70AsJZHET68M2UjAGgM1gkqPAanvqTK4q5pggH7qSmAkAmHnV-1EUkSj82HUT2qRF3nepDbB9EDxWuoKRWOn6k9cS_Z9XDyxlJLDLvIMB6vqqf5DQQ"
                        fill
                        sizes="48px"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#00020d]">Arthur Morgan</h4>
                      <p className="text-xs text-[#45464e]">Chest Pain • 65 years • Initial Visit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-[#ba1a1a] px-4 py-2 text-sm text-[#ba1a1a] hover:bg-[#ba1a1a]/5">Decline</button>
                    <button className="rounded-lg bg-[#16b36c] px-4 py-2 text-sm text-white hover:brightness-95">Accept</button>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-lg border border-[#c6c6cf] bg-[#f2f4f7] p-4 md:flex-row md:items-center">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full bg-[#e0e3e6]">
                      <Image
                        className="object-cover"
                        alt="Sarah Williams"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRLWFOPKr0Ns04yIIxmV6T_Ok90BWig1GuOVZwkgBlct2PpCSJn9OFSCAORhoMaOiKnv9YERgnrB1CtYcSAhbKrHs8MbSMVoqlke5jB93bGWeC-Qcamw7mT9Mgg6klR1MKApzGT9iapUOnVYvcKEumu5hA_Wbzrh9mgFMxy9ll81tXRhHIJ408_HW_FTB6GJLiJcSriF4cvjo4sx0yHQmTQ3befKqyJzJt1eKkUvKraIF3STdSPgVUe3Fc7TcMeaUWBOBuaUJYC644"
                        fill
                        sizes="48px"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#00020d]">Sarah Williams</h4>
                      <p className="text-xs text-[#45464e]">Follow-up • 29 years • Post-Op Check</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-[#ba1a1a] px-4 py-2 text-sm text-[#ba1a1a] hover:bg-[#ba1a1a]/5">Decline</button>
                    <button className="rounded-lg bg-[#16b36c] px-4 py-2 text-sm text-white hover:brightness-95">Accept</button>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-1xl font-semibold text-[#00020d]">Daily Schedule</h2>
                <div className="flex gap-2">
                  <button className="rounded border border-[#c6c6cf] p-2 hover:bg-[#eceef1]">
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button className="rounded border border-[#c6c6cf] p-2 hover:bg-[#eceef1]">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>

              <div className="relative space-y-8 pl-12 before:absolute before:bottom-2 before:left-[18px] before:top-2 before:w-[2px] before:bg-[#c6c6cf] before:content-['']">
                <div className="relative">
                  <div className="absolute -left-[38px] top-1 h-4 w-4 rounded-full bg-[#16b36c] ring-4 ring-white" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#16b36c]">09:00 AM - 10:00 AM</span>
                      <h4 className="font-semibold text-[#00020d]">Cardiology Consultation</h4>
                      <p className="text-xs text-[#45464e]">Patient: Michael Scott • Room 302</p>
                    </div>
                    <span className="rounded-full bg-[#16b36c]/10 px-3 py-1 text-[10px] font-bold text-[#16b36c]">CONFIRMED</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[38px] top-1 h-4 w-4 rounded-full bg-[#67d6e7] ring-4 ring-white" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0093a2]">10:30 AM - 11:30 AM</span>
                      <h4 className="font-semibold text-[#00020d]">Post-Op Review</h4>
                      <p className="text-xs text-[#45464e]">Patient: Jim Halpert • Online Call</p>
                    </div>
                    <span className="rounded-full bg-[#e0e3e6] px-3 py-1 text-[10px] font-bold text-[#45464e]">VIRTUAL</span>
                  </div>
                </div>

                <div className="-ml-4 rounded border-y border-dashed border-[#16b36c]/30 bg-[#16b36c]/5 py-2 pl-4">
                  <span className="absolute -left-[50px] text-[10px] font-bold text-[#16b36c]">NOW</span>
                  <p className="text-xs italic text-[#16b36c]">Lunch Break & Documentation</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[38px] top-1 h-4 w-4 rounded-full bg-[#c6c6cf] ring-4 ring-white" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#45464e]">02:00 PM - 03:00 PM</span>
                      <h4 className="font-semibold text-[#00020d]">General Checkup</h4>
                      <p className="text-xs text-[#45464e]">Patient: Pam Beesly • Room 305</p>
                    </div>
                    <span className="rounded-full bg-[#ba1a1a]/10 px-3 py-1 text-[10px] font-bold text-[#ba1a1a]">URGENT</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="col-span-12 space-y-6 lg:col-span-4">
            <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-[#00020d]">October 2023</h3>
                <div className="flex gap-1">
                  <span className="material-symbols-outlined cursor-pointer text-[20px]">chevron_left</span>
                  <span className="material-symbols-outlined cursor-pointer text-[20px]">chevron_right</span>
                </div>
              </div>
              <div className="mb-2 grid grid-cols-7 text-center text-xs font-bold text-[#45464e]">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
              </div>
              <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
                <div className="py-2 text-[#45464e]/30">26</div>
                <div className="py-2 text-[#45464e]/30">27</div>
                <div className="py-2 text-[#45464e]/30">28</div>
                <div className="py-2 text-[#45464e]/30">29</div>
                <div className="py-2 text-[#45464e]/30">30</div>
                <div className="cursor-pointer rounded-lg py-2 hover:bg-[#eceef1]">1</div>
                <div className="cursor-pointer rounded-lg py-2 hover:bg-[#eceef1]">2</div>
                <div className="cursor-pointer rounded-lg py-2 hover:bg-[#eceef1]">3</div>
                <div className="cursor-pointer rounded-lg py-2 hover:bg-[#eceef1]">4</div>
                <div className="cursor-pointer rounded-lg py-2 hover:bg-[#eceef1]">5</div>
                <div className="rounded-lg bg-[#16b36c] py-2 font-bold text-white">6</div>
                <div className="relative cursor-pointer rounded-lg py-2 hover:bg-[#eceef1]">
                  7
                  <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#ba1a1a]" />
                </div>
                <div className="cursor-pointer rounded-lg py-2 hover:bg-[#eceef1]">8</div>
                <div className="cursor-pointer rounded-lg py-2 hover:bg-[#eceef1]">9</div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-xl bg-[#0d1b3d] p-6 text-[#7784ac] shadow-xl">
              <div className="relative z-10">
                <h3 className="mb-2 text-1xl font-semibold">DominionWell+ Premium</h3>
                <p className="mb-6 text-xs opacity-80">You have reached 92% of your monthly consultation target. Keep it up!</p>
                <div className="mb-4 h-2 w-full rounded-full bg-white/10">
                  <div className="h-2 w-[92%] rounded-full bg-[#16b36c] shadow-[0_0_10px_rgba(22,179,108,0.5)]" />
                </div>
                <button className="w-full rounded-lg border border-white/20 bg-white/10 py-2 text-xs hover:bg-white/20">
                  View Analytics
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#16b36c]/10 blur-3xl" />
            </section>

            <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 backdrop-blur-sm">
              <h3 className="mb-4 font-semibold text-[#00020d]">Quick Reminders</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border-l-4 border-[#ba1a1a] bg-[#ba1a1a]/5 p-3">
                  <span className="material-symbols-outlined text-[#ba1a1a]">priority_high</span>
                  <div>
                    <p className="text-sm font-bold text-[#00020d]">Approve lab results</p>
                    <p className="text-xs text-[#45464e]">Lab: Quest Diagnostics • Due in 2h</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border-l-4 border-[#16b36c] bg-[#16b36c]/5 p-3">
                  <span className="material-symbols-outlined text-[#16b36c]">notifications_active</span>
                  <div>
                    <p className="text-sm font-bold text-[#00020d]">Call Patient #3302</p>
                    <p className="text-xs text-[#45464e]">Follow up on hypertension meds</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
