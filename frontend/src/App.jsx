import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './shared/components/Sidebar';
import DashboardPage from './modules/dashboard/DashboardPage';
import StudentsPage from './modules/core/pages/StudentsPage';
import CoursesPage from './modules/core/pages/CoursesPage';
import DepartmentsPage from './modules/core/pages/DepartmentsPage';
import FacultyPage from './modules/core/pages/FacultyPage';
import AdmissionsPage from './modules/admissions/pages/AdmissionsPage';
import {
  fetchStudents,
  fetchCourses,
  fetchDepartments,
  fetchFaculty,
} from './modules/core/api/coreApi';

export default function App() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [stuData, crsData, deptData, facData] = await Promise.all([
        fetchStudents(),
        fetchCourses(),
        fetchDepartments(),
        fetchFaculty(),
      ]);
      setStudents(stuData);
      setCourses(crsData);
      setDepartments(deptData);
      setFaculty(facData);
    } catch (err) {
      console.error('Failed to load Scholaris data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <main className="main-wrapper">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem' }}>
              <div className="loading-spinner" />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.4rem' }}>Connecting to Scholaris...</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>Ensure PostgreSQL database is running via <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0.1rem 0.4rem', borderRadius: '5px' }}>docker compose up -d</code></p>
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                <DashboardPage
                  studentsCount={students.length}
                  coursesCount={courses.length}
                  departmentsCount={departments.length}
                  facultyCount={faculty.length}
                />
              } />
              <Route path="/admissions" element={<AdmissionsPage />} />
              <Route path="/students" element={
                <StudentsPage students={students} onStudentCreated={loadData} />
              } />
              <Route path="/courses" element={
                <CoursesPage courses={courses} onCourseCreated={loadData} />
              } />
              <Route path="/departments" element={
                <DepartmentsPage departments={departments} onDepartmentCreated={loadData} />
              } />
              <Route path="/faculty" element={
                <FacultyPage faculty={faculty} departments={departments} onFacultyCreated={loadData} />
              } />
            </Routes>
          )}
        </main>
      </div>
    </BrowserRouter>
  );
}
