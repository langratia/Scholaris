import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './shared/components/Sidebar';
import DashboardPage from './modules/dashboard/DashboardPage';
import StudentsPage from './modules/core/pages/StudentsPage';
import CoursesPage from './modules/core/pages/CoursesPage';
import DepartmentsPage from './modules/core/pages/DepartmentsPage';
import FacultyPage from './modules/core/pages/FacultyPage';
import AdmissionsDashboard from './modules/admissions/pages/AdmissionsDashboard';
import RegistersManagePage from './modules/admissions/pages/RegistersManagePage';
import ApplicationsReviewPage from './modules/admissions/pages/ApplicationsReviewPage';
import PublicApplyLayout from './modules/admissions/components/PublicApplyLayout';
import StudentApplyPage from './modules/admissions/pages/StudentApplyPage';
import ApplicationStatusPage from './modules/admissions/pages/ApplicationStatusPage';
import FinanceDashboard from './modules/finance/pages/FinanceDashboard';
import FeeTermsPage from './modules/finance/pages/FeeTermsPage';
import TimetablesPage from './modules/timetables/pages/TimetablesPage';
import AttendancePage from './modules/attendance/pages/AttendancePage';
import {
  fetchStudents,
  fetchCourses,
  fetchDepartments,
  fetchFaculty,
} from './modules/core/api/coreApi';
import { Outlet } from 'react-router-dom';

const AdminLayout = ({ children, loading }) => (
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
        <Outlet />
      )}
    </main>
  </div>
);

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
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicApplyLayout />}>
          <Route path="/apply" element={<StudentApplyPage />} />
          <Route path="/apply/status" element={<ApplicationStatusPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminLayout loading={loading} />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <DashboardPage
              studentsCount={students.length}
              coursesCount={courses.length}
              departmentsCount={departments.length}
              facultyCount={faculty.length}
            />
          } />
          <Route path="/admissions" element={<AdmissionsDashboard />} />
          <Route path="/admissions/registers" element={<RegistersManagePage />} />
          <Route path="/admissions/applications" element={<ApplicationsReviewPage />} />
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/finance/terms" element={<FeeTermsPage />} />
          <Route path="/timetables" element={<TimetablesPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
