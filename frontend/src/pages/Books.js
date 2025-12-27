import React, { useState, useEffect } from 'react';
import { bookAPI, borrowAPI } from '../utils/api';
import logger from '../utils/logger';

const Books = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      
      logger.debug('Fetching books', {
        search,
        params,
      });

      const response = await bookAPI.getAll(params);
      const books = Array.isArray(response.data?.books) ? response.data.books : [];
      
      logger.info('Books fetched successfully', {
        count: books.length,
        search,
      });

      setBooks(books);
    } catch (err) {
      logger.error('Failed to fetch books', {
        search,
        error: err.message,
        isNetworkError: err.isNetworkError,
        status: err.status,
      });

      setBooks([]);
      setMessage(err.message || 'Failed to fetch books');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchBooks();
  };

  const handleBorrow = async (bookId) => {
    try {
      setMessage('');
      
      const book = books.find(b => b.id === bookId);
      logger.info('Creating borrow request', {
        bookId,
        bookTitle: book?.title,
        borrowDurationDays: 7,
      });

      await borrowAPI.create({ bookId, borrowDurationDays: 7 });
      
      logger.info('Borrow request created successfully', {
        bookId,
        bookTitle: book?.title,
      });

      setMessage('Borrow request created successfully!');
      setTimeout(() => setMessage(''), 3000);
      // Refresh books to update availability
      fetchBooks();
    } catch (err) {
      const book = books.find(b => b.id === bookId);
      
      logger.error('Failed to create borrow request', {
        bookId,
        bookTitle: book?.title,
        error: err.message,
        isNetworkError: err.isNetworkError,
        isValidationError: err.isValidationError,
        validationErrors: err.validationErrors,
        status: err.status,
        responseData: err.responseData,
      });

      const errorMsg = err.message || err.response?.data?.message || 'Failed to create borrow request';
      setMessage(errorMsg);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Books</h1>
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search books by title, author, or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '70%', display: 'inline-block' }}
        />
        <button type="submit" className="btn btn-primary">Search</button>
        <button type="button" className="btn btn-secondary" onClick={() => {
          setSearch('');
          setLoading(true);
          fetchBooks();
        }}>Clear</button>
      </form>
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
            {books.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No books found</td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>
                    <span className={`badge ${book.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {book.availableCopies} / {book.totalCopies}
                    </span>
                  </td>
                  <td>{book.category || 'N/A'}</td>
                  <td>
                    {book.availableCopies > 0 ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleBorrow(book.id)}
                      >
                        Borrow
                      </button>
                    ) : (
                      <span className="badge badge-danger">Unavailable</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Books;

