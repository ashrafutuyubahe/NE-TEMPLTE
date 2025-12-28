import React, { useState, useEffect } from 'react';
import { bookAPI } from '../utils/api';
import logger from '../utils/logger';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    totalCopies: '',
    category: '',
    publisher: '',
    publicationYear: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await bookAPI.getAll();
      setBooks(Array.isArray(response.data?.books) ? response.data.books : []);
    } catch (err) {
      console.error('Failed to fetch books:', err);
      setBooks([]);
      setMessage(err.message || 'Failed to fetch books');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    
    const submitData = {
      ...formData,
      totalCopies: parseInt(formData.totalCopies) || 1,
      publicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : undefined,
    };

    try {
      if (editingBook) {
        logger.info('Updating book', {
          bookId: editingBook.id,
          bookTitle: editingBook.title,
          data: submitData,
        });

        await bookAPI.update(editingBook.id, submitData);
        
        logger.info('Book updated successfully', {
          bookId: editingBook.id,
        });

        setMessage('Book updated successfully!');
      } else {
        logger.info('Creating new book', {
          data: submitData,
        });

        await bookAPI.create(submitData);
        
        logger.info('Book created successfully', {
          title: submitData.title,
        });

        setMessage('Book created successfully!');
      }
      setShowModal(false);
      setEditingBook(null);
      resetForm();
      fetchBooks();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      logger.error('Book operation failed', {
        action: editingBook ? 'update' : 'create',
        bookId: editingBook?.id,
        error: err.message,
        isNetworkError: err.isNetworkError,
        isValidationError: err.isValidationError,
        validationErrors: err.validationErrors,
        status: err.status,
        responseData: err.responseData,
        formData: submitData,
      });

      const errorMsg = err.message || err.response?.data?.message || 'Operation failed';
      setMessage(errorMsg);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      description: book.description || '',
      totalCopies: book.totalCopies,
      category: book.category || '',
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookAPI.delete(id);
        setMessage('Book deleted successfully!');
        fetchBooks();
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to delete book');
        setTimeout(() => setMessage(''), 5000);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      description: '',
      totalCopies: '',
      category: '',
      publisher: '',
      publicationYear: '',
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Manage Books</h1>
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}
      <button className="btn btn-primary" onClick={() => {
        setEditingBook(null);
        resetForm();
        setShowModal(true);
      }}>
        Add New Book
      </button>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Available</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.isbn}</td>
                <td>{book.availableCopies} / {book.totalCopies}</td>
                <td>{book.category || 'N/A'}</td>
                <td>
                  <button className="btn btn-primary" onClick={() => handleEdit(book)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(book.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowModal(false);
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Author *</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>ISBN *</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total Copies *</label>
                <input
                  type="number"
                  value={formData.totalCopies}
                  onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Publisher</label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Publication Year</label>
                <input
                  type="number"
                  value={formData.publicationYear}
                  onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                />
              </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  {editingBook ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;

