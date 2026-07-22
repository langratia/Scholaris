import React, { useState, useEffect } from 'react';
import Sidebar from './shared/components/Sidebar';
import DashboardPage from './modules/dashboard/DashboardPage';
import StudentsPage from './modules/core/pages/StudentsPage';
import CoursesPage from './modules/core/pages/CoursesPage';
import DepartmentsPage from './modules/core/pages/DepartmentsPage';
import FacultyPage from './modules/core/pages/FacultyPage';
import {
  fetchStudents,
  fetchCourses,
  fetchDepartments,
  fetchFaculty,
} from './modules/core/api/coreApi';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
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
    <div className="app-layout">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="main-wrapper">
        {loading ? (
          <div className="empty-state" style={{ marginTop: '5rem' }}>
            <div className="empty-icon">⏳</div>
            <h3>Loading Scholaris Domain System...</h3>
          </div>
        ) : (
          <>
            {currentView === 'dashboard' && (
              <DashboardPage
                studentsCount={students.length}
                coursesCount={courses.length}
                departmentsCount={departments.length}
                facultyCount={faculty.length}
              />
            )}
            {currentView === 'students' && (
              <StudentsPage
                students={students}
                onStudentCreated={loadData}
              />
            )}
            {currentView === 'courses' && (
              <CoursesPage
                courses={courses}
                onCourseCreated={loadData}
              />
            )}
            {currentView === 'departments' && (
              <DepartmentsPage
                departments={departments}
                onDepartmentCreated={loadData}
              />
            )}
            {currentView === 'faculty' && (
              <FacultyPage
                faculty={faculty}
                departments={departments}
                onFacultyCreated={loadData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
