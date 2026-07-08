export type DoctorAvailability = "Available" | "Busy" | "Offline";

export type DoctorCalendarDay = {
  date: string;
  label: string;
  timeSlots: string[];
};

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  availability: DoctorAvailability;
  rating: number;
  experienceYears: number;
  bio: string;
  image: string;
  phone: string;
  whatsappNumber: string;
  calendar: DoctorCalendarDay[];
};

export const doctors: Doctor[] = [
  {
    id: "dr-sarah-weaver",
    name: "Dr. Sarah Weaver",
    specialization: "General Physician",
    availability: "Available",
    rating: 4.9,
    experienceYears: 12,
    bio: "Focused on preventive care and long-term wellness planning.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAJY-tBxmDI_cCDafVuF2NnfF8U6zT5YzQzv5Hv_Lb4-IqYGlCB50KfkGkrU9ZuRmzZR37a-8V3FmgIZqaa9s5nY47OrwfXqetdUfu8Pgvkd5iUKIo3Rv3yKeiBuGToBeX-3LVJjNL8nhI0nRnsWtKrA9elsvcy_-pjlXmfn00V9ypYkSr7TMM4OJGeS_OkxKCwmtq-hqr-V6UFa22plogSG4TwCviMqlTHI6G0wHkgcQ-j4lI2z_-lshE2SWYuHP0M-QHIM2IjDKtt",
    phone: "+1 (202) 555-0142",
    whatsappNumber: "12025550142",
    calendar: [
      {
        date: "2026-07-09",
        label: "Wed, Jul 9",
        timeSlots: ["09:00 AM", "11:30 AM", "03:00 PM"],
      },
      {
        date: "2026-07-10",
        label: "Thu, Jul 10",
        timeSlots: ["10:00 AM", "01:00 PM", "04:30 PM"],
      },
      {
        date: "2026-07-11",
        label: "Fri, Jul 11",
        timeSlots: ["08:30 AM", "12:30 PM"],
      },
    ],
  },
  {
    id: "dr-richardson",
    name: "Dr. Richardson",
    specialization: "Cardiology",
    availability: "Available",
    rating: 4.7,
    experienceYears: 15,
    bio: "Specializes in cardiovascular diagnostics and heart disease management.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDM_6TzRlZyvWMUGLqyDv1_NZ6nD9NmyP3_B0yYtIdNozvzDisylezl9Z0qehAMIwlX49gdYJp10UDLPHaP3AGyK-WFlBzEPrMoArVKT825rmhezpRaCs3QykZG5MUGQWTRJmZDzPOOW3BQFB6lhtw26gvXWsc5pTY_v4sCBXFy33jj-nV4wF3hYb2INB-EhQ3VeuWSmjoIEhjdMGDg2N6avJ9Sp2OC6Jnij_tciHEWQnSxWISrv6OFhkMcVl3sKz0t0zYXB9kc0gpS",
    phone: "+1 (202) 555-0188",
    whatsappNumber: "12025550188",
    calendar: [
      {
        date: "2026-07-09",
        label: "Wed, Jul 9",
        timeSlots: ["10:30 AM", "02:00 PM"],
      },
      {
        date: "2026-07-10",
        label: "Thu, Jul 10",
        timeSlots: ["09:00 AM", "12:00 PM", "05:00 PM"],
      },
    ],
  },
  {
    id: "dr-emily-stone",
    name: "Dr. Emily Stone",
    specialization: "Dermatology",
    availability: "Offline",
    rating: 4.8,
    experienceYears: 10,
    bio: "Treats skin conditions with an emphasis on personalized treatment plans.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDz8rH_oEcTbUduUHKl2BOYi6oJi89VzeoqNXfyENzI8ywKPX4k7uinA2c-bP2UkHHRuoHlpILQL7x7KKAM1fG5dmK6y9ACkw9LWINQxMBB02FYS1Dldr0wOJtUC7SG8KUTK3tOpLMpVyFNVl3urdnjFueuoUYfjw_8tvHtiM9Y-f-EFahNsl1HrIx6LVlQoCupwJ5R5fLRNJihR5rmzzt_yjmRnc4nAKUGH6_-eQ1ZTb6ydrCZyMtqusej4KIVCj5fvXS9ox38bfPI",
    phone: "+1 (202) 555-0106",
    whatsappNumber: "12025550106",
    calendar: [
      {
        date: "2026-07-11",
        label: "Fri, Jul 11",
        timeSlots: ["09:30 AM", "01:30 PM"],
      },
      {
        date: "2026-07-12",
        label: "Sat, Jul 12",
        timeSlots: ["10:00 AM", "11:00 AM", "03:30 PM"],
      },
    ],
  },
  {
    id: "dr-anthony-cole",
    name: "Dr. Anthony Cole",
    specialization: "Neurology",
    availability: "Available",
    rating: 4.6,
    experienceYears: 9,
    bio: "Provides care for neurological disorders and chronic headache management.",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80",
    phone: "+1 (202) 555-0124",
    whatsappNumber: "12025550124",
    calendar: [
      {
        date: "2026-07-09",
        label: "Wed, Jul 9",
        timeSlots: ["08:00 AM", "10:00 AM", "01:00 PM"],
      },
      {
        date: "2026-07-10",
        label: "Thu, Jul 10",
        timeSlots: ["09:30 AM", "12:30 PM", "04:00 PM"],
      },
      {
        date: "2026-07-12",
        label: "Sat, Jul 12",
        timeSlots: ["11:30 AM", "02:30 PM"],
      },
    ],
  },
  {
    id: "dr-lina-morales",
    name: "Dr. Lina Morales",
    specialization: "Pediatrics",
    availability: "Busy",
    rating: 4.9,
    experienceYears: 11,
    bio: "Supports child and adolescent health from routine checks to complex care.",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
    phone: "+1 (202) 555-0172",
    whatsappNumber: "12025550172",
    calendar: [
      {
        date: "2026-07-10",
        label: "Thu, Jul 10",
        timeSlots: ["08:30 AM", "10:30 AM", "01:30 PM"],
      },
      {
        date: "2026-07-11",
        label: "Fri, Jul 11",
        timeSlots: ["09:00 AM", "12:00 PM", "03:00 PM"],
      },
    ],
  },
];

export const availabilityStyles: Record<DoctorAvailability, string> = {
  Available: "bg-[#16b46f]/15 text-[#16b46f]",
  Busy: "bg-[#ef4444]/12 text-[#dc2626]",
  Offline: "bg-[#64748b]/15 text-[#64748b]",
};
