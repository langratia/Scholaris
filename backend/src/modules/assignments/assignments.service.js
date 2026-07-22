const prisma = require('../../config/db');

class AssignmentsService {
  // --- Assignments ---
  
  async getAllAssignments(filters = {}) {
    const { courseId, batchId, subjectId, facultyId, status } = filters;
    const where = {};
    if (courseId) where.courseId = Number(courseId);
    if (batchId) where.batchId = Number(batchId);
    if (subjectId) where.subjectId = Number(subjectId);
    if (facultyId) where.facultyId = Number(facultyId);
    if (status) where.status = status;

    return prisma.assignment.findMany({
      where,
      include: {
        course: { select: { title: true, code: true } },
        batch: { select: { name: true, code: true } },
        subject: { select: { name: true, code: true } },
        faculty: { select: { firstName: true, lastName: true } },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAssignmentById(id) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: Number(id) },
      include: {
        course: { select: { title: true, code: true } },
        batch: { select: { name: true, code: true } },
        subject: { select: { name: true, code: true } },
        faculty: { select: { firstName: true, lastName: true } },
        submissions: {
          include: {
            student: { select: { name: true, email: true, grade: true } }
          },
          orderBy: { submittedAt: 'desc' }
        }
      },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }
    return assignment;
  }

  async createAssignment(data) {
    return prisma.assignment.create({
      data,
      include: {
        course: { select: { title: true } },
        batch: { select: { name: true } },
        subject: { select: { name: true } },
      }
    });
  }

  async updateAssignmentStatus(id, status) {
    return prisma.assignment.update({
      where: { id: Number(id) },
      data: { status }
    });
  }

  // --- Submissions ---

  async submitAssignment(assignmentId, studentId, data) {
    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: Number(assignmentId) }
    });
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Check if already submitted
    const existing = await prisma.assignmentSubmission.findFirst({
      where: {
        assignmentId: Number(assignmentId),
        studentId: Number(studentId)
      }
    });

    if (existing) {
      // Update existing submission
      return prisma.assignmentSubmission.update({
        where: { id: existing.id },
        data: {
          content: data.content,
          fileUrl: data.fileUrl,
          submittedAt: new Date(),
          status: 'SUBMITTED' // reset status if resubmitting
        }
      });
    }

    // Determine if late
    const status = new Date() > assignment.dueDate ? 'LATE' : 'SUBMITTED';

    return prisma.assignmentSubmission.create({
      data: {
        assignmentId: Number(assignmentId),
        studentId: Number(studentId),
        content: data.content,
        fileUrl: data.fileUrl,
        status
      }
    });
  }

  async gradeSubmission(submissionId, data) {
    return prisma.assignmentSubmission.update({
      where: { id: Number(submissionId) },
      data: {
        marksObtained: data.marksObtained,
        remarks: data.remarks,
        status: 'GRADED'
      }
    });
  }
}

module.exports = new AssignmentsService();
