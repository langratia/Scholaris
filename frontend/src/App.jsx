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
            <div className="empty-state" style={{ marginTop: '5rem' }}>
              <div className="empty-icon">⏳</div>
              <h3>Loading Scholaris System...</h3>
              <p>Ensure your PostgreSQL database is running.</p>
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
