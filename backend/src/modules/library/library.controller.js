const libraryService = require('./library.service');

const getAllBooks = async (req, res, next) => {
  try {
    const books = await libraryService.getAllBooks(req.query);
    res.json({ success: true, data: books });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const book = await libraryService.getBookById(req.params.id);
    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const book = await libraryService.createBook(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const book = await libraryService.updateBook(req.params.id, req.body);
    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

const issueBook = async (req, res, next) => {
  try {
    const borrow = await libraryService.issueBook(req.body);
    res.status(201).json({ success: true, data: borrow });
  } catch (error) {
    next(error);
  }
};

const returnBook = async (req, res, next) => {
  try {
    const borrow = await libraryService.returnBook(req.params.id, req.body);
    res.json({ success: true, data: borrow });
  } catch (error) {
    next(error);
  }
};

const getBorrows = async (req, res, next) => {
  try {
    const borrows = await libraryService.getBorrows(req.query);
    res.json({ success: true, data: borrows });
  } catch (error) {
    next(error);
  }
};

const getStudentBorrows = async (req, res, next) => {
  try {
    const borrows = await libraryService.getStudentBorrows(req.params.studentId);
    res.json({ success: true, data: borrows });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await libraryService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  issueBook,
  returnBook,
  getBorrows,
  getStudentBorrows,
  getStats,
};
