/**
 * Scholaris White-Label Institution Configuration
 * 
 * Self-hosted schools can customize their identity, brand colors, currency, 
 * and enabled feature modules in this single configuration file.
 */
export const institutionConfig = {
  // --- Institution Identity ---
  name: "Scholaris Academy",
  shortName: "Scholaris",
  tagline: "Institutional Management Suite",
  logo: "/logo.png", // Path in /public directory or external URL
  supportEmail: "admin@scholaris.edu",
  currency: "$",

  // --- Brand Design System (CSS Custom Properties) ---
  theme: {
    primaryColor: "#287AE7",       // Main Brand Blue
    accentColor: "#10b981",        // Emerald Green Accent
    purpleAccent: "#7c3aed",       // Purple Accent for HR/Exams
    amberAccent: "#f59e0b",        // Amber Accent for Assignments
  },

  // --- Feature Module Matrix (Enable/Disable modules per school) ---
  modules: {
    dashboard: true,
    admissions: true,
    finance: true,
    timetables: true,
    attendance: true,
    exams: true,
    assignments: true,
    library: true,
    hr: true,
    students: true,
    courses: true,
    departments: true,
    faculty: true,
  }
};
