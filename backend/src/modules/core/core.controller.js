const {
  StudentService,
  CourseService,
  DepartmentService,
  FacultyService,
  BatchService,
  SubjectService,
} = require('./core.service');

const {
  studentSchema,
  courseSchema,
  departmentSchema,
  facultySchema,
  batchSchema,
  subjectSchema,
} = require('./core.schema');

// --- STUDENTS ---
const getStudents = async (req, res, next) => {
  try {
    const students = await StudentService.getAll();
    res.json(students);
  } catch (error) {
    next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const validData = studentSchema.parse(req.body);

    const existing = await StudentService.getByEmail(validData.email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const student = await StudentService.create(validData);
    res.status(201).json(student);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};

const getStudentProfile = async (req, res, next) => {
  try {
    const { email } = req.params;
    const profile = await StudentService.getProfileByEmail(
      decodeURIComponent(email)
    );
    if (!profile) {
      return res.status(404).json({ error: 'No student found with that email address' });
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// --- COURSES ---
const getCourses = async (req, res, next) => {
  try {
    const courses = await CourseService.getAll();
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const validData = courseSchema.parse(req.body);

    const existing = await CourseService.getByCode(validData.code);
    if (existing) {
      return res.status(400).json({ error: 'Course code already exists' });
    }

    const course = await CourseService.create(validData);
    res.status(201).json(course);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};

// --- DEPARTMENTS ---
const getDepartments = async (req, res, next) => {
  try {
    const departments = await DepartmentService.getAll();
    res.json(departments);
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const validData = departmentSchema.parse(req.body);

    const existing = await DepartmentService.getByCode(validData.code);
    if (existing) {
      return res.status(400).json({ error: 'Department code already exists' });
    }

    const department = await DepartmentService.create(validData);
    res.status(201).json(department);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};

// --- FACULTY ---
const getFaculty = async (req, res, next) => {
  try {
    const faculty = await FacultyService.getAll();
    res.json(faculty);
  } catch (error) {
    next(error);
  }
};

const createFaculty = async (req, res, next) => {
  try {
    const validData = facultySchema.parse(req.body);

    const existing = await FacultyService.getByEmail(validData.email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const faculty = await FacultyService.create(validData);
    res.status(201).json(faculty);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};

// --- INTAKE BATCHES ---
const getBatches = async (req, res, next) => {
  try {
    const batches = await BatchService.getAll();
    res.json(batches);
  } catch (error) {
    next(error);
  }
};

const createBatch = async (req, res, next) => {
  try {
    const validData = batchSchema.parse(req.body);
    const existing = await BatchService.getByCode(validData.code);
    if (existing) {
      return res.status(400).json({ error: 'Batch code already exists' });
    }
    const batch = await BatchService.create(validData);
    res.status(201).json(batch);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};

// --- SUBJECTS ---
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await SubjectService.getAll();
    res.json(subjects);
  } catch (error) {
    next(error);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const validData = subjectSchema.parse(req.body);
    const existing = await SubjectService.getByCode(validData.code);
    if (existing) {
      return res.status(400).json({ error: 'Subject code already exists' });
    }
    const subject = await SubjectService.create(validData);
    res.status(201).json(subject);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};

module.exports = {
  getStudents,
  createStudent,
  getStudentProfile,
  getCourses,
  createCourse,
  getDepartments,
  createDepartment,
  getFaculty,
  createFaculty,
  getBatches,
  createBatch,
  getSubjects,
  createSubject,
};

