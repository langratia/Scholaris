import React, { createContext, useContext, useState, useEffect } from 'react';

const StudentPortalContext = createContext(null);

export function StudentPortalProvider({ children }) {
  const [student, setStudent] = useState(() => {
    try {
      const saved = sessionStorage.getItem('scholaris_student');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (profile) => {
    setStudent(profile);
    sessionStorage.setItem('scholaris_student', JSON.stringify(profile));
  };

  const logout = () => {
    setStudent(null);
    sessionStorage.removeItem('scholaris_student');
  };

  return (
    <StudentPortalContext.Provider value={{ student, login, logout }}>
      {children}
    </StudentPortalContext.Provider>
  );
}

export function useStudentPortal() {
  return useContext(StudentPortalContext);
}
