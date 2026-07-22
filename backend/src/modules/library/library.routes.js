const express = require('express');
const router = express.Router();
const controller = require('./library.controller');

// Catalog
router.get('/books', controller.getAllBooks);
router.post('/books', controller.createBook);
router.get('/books/:id', controller.getBookById);
router.patch('/books/:id', controller.updateBook);

// Circulation
router.post('/issue', controller.issueBook);
router.post('/return/:id', controller.returnBook);
router.get('/borrows', controller.getBorrows);
router.get('/student/:studentId', controller.getStudentBorrows);

// Stats
router.get('/stats', controller.getStats);

module.exports = router;
