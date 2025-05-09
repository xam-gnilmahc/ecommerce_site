import React from 'react';

const Pagination = ({ postsPerPage, totalPosts, paginate, currentPage }) => {
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const maxPagesToShow = 10;

  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const baseButtonStyle = {
    padding: '6px 12px',
    minWidth: '40px',
    border: '1px solid #343a40',
    borderRadius: '6px',
    backgroundColor: '#fff',
    color: '#343a40',
    cursor: 'pointer',
  };

  const activeButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: '#343a40',
    color: '#fff',
  };

  return (
    <nav aria-label="Page navigation" style={{ marginTop: '20px' }}>
      <ul className="pagination justify-content-center" style={{ gap: '6px', padding: 0 }}>
        {/* Previous Button */}
        {currentPage > 1 && (
          <li className="page-item">
            <button
              onClick={() => paginate(currentPage - 1)}
              style={baseButtonStyle}
            >
              {'<'}
            </button>
          </li>
        )}

        {/* Page Number Buttons */}
        {pageNumbers.map((number) => (
          <li key={number} className="page-item">
            <button
              onClick={() => paginate(number)}
              style={number === currentPage ? activeButtonStyle : baseButtonStyle}
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
              style={baseButtonStyle}
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
