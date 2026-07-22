const prisma = require('../../config/db');

class HRService {
  // --- Employees ---

  async getAllEmployees(filters = {}) {
    const { status, employeeType, departmentId, search } = filters;
    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (employeeType && employeeType !== 'ALL') where.employeeType = employeeType;
    if (departmentId) where.departmentId = Number(departmentId);
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.employee.findMany({
      where,
      include: {
        department: { select: { name: true, code: true } },
        _count: { select: { leaveRequests: true } }
      },
      orderBy: { firstName: 'asc' }
    });
  }

  async getEmployeeById(id) {
    const employee = await prisma.employee.findUnique({
      where: { id: Number(id) },
      include: {
        department: true,
        leaveRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    if (!employee) throw new Error('Employee not found');
    return employee;
  }

  async createEmployee(data) {
    return prisma.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        role: data.role,
        employeeType: data.employeeType || 'NON_TEACHING',
        departmentId: data.departmentId ? Number(data.departmentId) : null,
        salary: Number(data.salary) || 0,
        joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
        status: data.status || 'ACTIVE',
      },
      include: { department: { select: { name: true } } }
    });
  }

  async updateEmployee(id, data) {
    const updateData = { ...data };
    if (data.departmentId) updateData.departmentId = Number(data.departmentId);
    if (data.salary) updateData.salary = Number(data.salary);
    if (data.joinDate) updateData.joinDate = new Date(data.joinDate);

    return prisma.employee.update({
      where: { id: Number(id) },
      data: updateData,
      include: { department: { select: { name: true } } }
    });
  }

  // --- Leave Requests ---

  async getAllLeaves(filters = {}) {
    const { status, employeeId } = filters;
    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (employeeId) where.employeeId = Number(employeeId);

    return prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true, department: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async submitLeave(employeeId, data) {
    return prisma.leaveRequest.create({
      data: {
        employeeId: Number(employeeId),
        leaveType: data.leaveType || 'ANNUAL',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason || null,
      },
      include: {
        employee: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async reviewLeave(id, { status, reviewedBy }) {
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new Error('Invalid status. Must be APPROVED or REJECTED.');
    }
    return prisma.leaveRequest.update({
      where: { id: Number(id) },
      data: {
        status,
        reviewedBy: reviewedBy || 'Admin',
        reviewedAt: new Date()
      }
    });
  }

  // --- Stats ---

  async getStats() {
    const [totalEmployees, activeEmployees, pendingLeaves, approvedLeaves, payrollSum] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      prisma.leaveRequest.count({ where: { status: 'APPROVED' } }),
      prisma.employee.aggregate({ _sum: { salary: true }, where: { status: 'ACTIVE' } })
    ]);

    // Department payroll breakdown
    const deptPayroll = await prisma.employee.groupBy({
      by: ['departmentId'],
      _sum: { salary: true },
      _count: { id: true },
      where: { status: 'ACTIVE' }
    });

    return {
      totalEmployees,
      activeEmployees,
      pendingLeaves,
      approvedLeaves,
      totalMonthlyPayroll: payrollSum._sum.salary || 0,
      deptPayroll
    };
  }
}

module.exports = new HRService();
