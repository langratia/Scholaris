const prisma = require('../../config/db');

class LibraryService {
  // --- Catalog ---

  async getAllBooks(filters = {}) {
    const { category, search } = filters;
    const where = {};
    if (category && category !== 'ALL') where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.book.findMany({
      where,
      include: {
        _count: { select: { borrows: true } }
      },
      orderBy: { title: 'asc' }
    });
  }

  async getBookById(id) {
    const book = await prisma.book.findUnique({
      where: { id: Number(id) },
      include: {
        borrows: {
          include: {
            student: { select: { id: true, name: true, email: true, grade: true } }
          },
          orderBy: { issuedAt: 'desc' }
        }
      }
    });

    if (!book) throw new Error('Book not found');
    return book;
  }

  async createBook(data) {
    const copies = Number(data.copies) || 1;
    return prisma.book.create({
      data: {
        isbn: data.isbn,
        title: data.title,
        author: data.author,
        publisher: data.publisher || null,
        category: data.category || 'General',
        copies,
        availableCopies: copies,
        location: data.location || null
      }
    });
  }

  async updateBook(id, data) {
    return prisma.book.update({
      where: { id: Number(id) },
      data
    });
  }

  // --- Circulation (Issue / Return) ---

  async issueBook({ bookId, studentId, dueDate }) {
    const book = await prisma.book.findUnique({ where: { id: Number(bookId) } });
    if (!book) throw new Error('Book not found');
    if (book.availableCopies <= 0) throw new Error('No available copies of this book');

    const student = await prisma.student.findUnique({ where: { id: Number(studentId) } });
    if (!student) throw new Error('Student not found');

    // Create borrow record and decrement available copies in a transaction
    return prisma.$transaction(async (tx) => {
      const borrow = await tx.bookBorrow.create({
        data: {
          bookId: Number(bookId),
          studentId: Number(studentId),
          dueDate: new Date(dueDate),
          status: 'ISSUED'
        },
        include: {
          book: { select: { title: true, author: true, isbn: true } },
          student: { select: { name: true, email: true } }
        }
      });

      await tx.book.update({
        where: { id: Number(bookId) },
        data: { availableCopies: { decrement: 1 } }
      });

      return borrow;
    });
  }

  async returnBook(borrowId, { remarks } = {}) {
    const borrow = await prisma.bookBorrow.findUnique({
      where: { id: Number(borrowId) },
      include: { book: true }
    });

    if (!borrow) throw new Error('Borrow record not found');
    if (borrow.status === 'RETURNED') throw new Error('Book has already been returned');

    const now = new Date();
    let fineAmount = 0.0;

    // Fine calculation: $1/day overdue
    if (now > borrow.dueDate) {
      const diffTime = Math.abs(now - borrow.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * 1.0;
    }

    return prisma.$transaction(async (tx) => {
      const updatedBorrow = await tx.bookBorrow.update({
        where: { id: Number(borrowId) },
        data: {
          returnedAt: now,
          status: 'RETURNED',
          fineAmount,
          remarks: remarks || null
        },
        include: {
          book: { select: { title: true } },
          student: { select: { name: true } }
        }
      });

      await tx.book.update({
        where: { id: borrow.bookId },
        data: { availableCopies: { increment: 1 } }
      });

      return updatedBorrow;
    });
  }

  async getBorrows(filters = {}) {
    const { status, studentId } = filters;
    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (studentId) where.studentId = Number(studentId);

    return prisma.bookBorrow.findMany({
      where,
      include: {
        book: { select: { id: true, title: true, author: true, isbn: true, location: true } },
        student: { select: { id: true, name: true, email: true, grade: true } }
      },
      orderBy: { issuedAt: 'desc' }
    });
  }

  async getStudentBorrows(studentId) {
    return prisma.bookBorrow.findMany({
      where: { studentId: Number(studentId) },
      include: {
        book: { select: { id: true, title: true, author: true, isbn: true, category: true, location: true } }
      },
      orderBy: { issuedAt: 'desc' }
    });
  }

  async getStats() {
    const [totalBooks, availableSum, activeBorrows, overdueBorrows] = await Promise.all([
      prisma.book.count(),
      prisma.book.aggregate({ _sum: { availableCopies: true } }),
      prisma.bookBorrow.count({ where: { status: 'ISSUED' } }),
      prisma.bookBorrow.count({ where: { status: 'ISSUED', dueDate: { lt: new Date() } } })
    ]);

    return {
      totalTitles: totalBooks,
      availableCopies: availableSum._sum.availableCopies || 0,
      activeBorrows,
      overdueBorrows
    };
  }
}

module.exports = new LibraryService();
