import React from 'react';

const Pagination = ({ postsPerPage, totalPosts, paginate, currentPage }) => {
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const maxPagesToShow = 10;

  // Generate an array of page numbers to display
  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav aria-label="Page navigation" style={{ marginTop: '20px' }}>
      <ul className="pagination justify-content-center" style={{ gap: '6px' }}>
        {/* Previous Button */}
        {currentPage > 1 && (
          <li className="page-item">
            <button
              onClick={() => paginate(currentPage - 1)}
              className="page-link btn btn-light"
              style={{
                padding: '6px 12px',
                minWidth: '40px',
              }}
            >
              {'<'}
            </button>
          </li>
        )}

        {/* Page Number Buttons */}
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`page-item ${number === currentPage ? 'active' : ''}`}
          >
            <button
              onClick={() => paginate(number)}
              className="page-link btn btn-light"
              style={{
                padding: '6px 12px',
                minWidth: '40px',
              }}
            >
              {number}
            </button>
          </li>
        ))}

        {/* Next Button */}
        {currentPage < totalPages && (
          <li className="page-item">
            <button
              onClick={() => paginate(currentPage + 1)}
              className="page-link btn btn-light"
              style={{
                padding: '6px 12px',
                minWidth: '40px',
              }}
            >
              {'>'}
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
