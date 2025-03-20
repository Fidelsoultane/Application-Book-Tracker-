// models/Book.js

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true }, 
    status: { type: String, required: true },
    coverUrl: { type: String },
    publisher: { type: String }, 
    publishedDate: { type: String }, 
    pageCount: { type: Number }, 
    isbn: { type: String },
    genre: { type: String },
    startDate: { type: Date }, 
    endDate: { type: Date }, 
  });

module.exports = mongoose.model('Book', bookSchema);

