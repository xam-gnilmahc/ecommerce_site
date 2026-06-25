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
    minWidth: '40px',
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
    <nav aria-label="Page navigation" className="mt-3">
      <ul className="pagination justify-content-center flex-wrap" style={{ padding: 0 }}>
        {/* Previous Button */}
        {currentPage > 1 && (
          <li className="page-item">
            <a
              onClick={() => paginate(currentPage - 1)}
              className="page-link"
              style={baseButtonStyle}
            >
              Previous
            </a>
          </li>
        )}

        {/* Page Number Buttons */}
        {pageNumbers.map((number) => (
          <li key={number} className="page-item">
            <a
              onClick={() => paginate(number)}
              className="page-link"
              style={number === currentPage ? activeButtonStyle : baseButtonStyle}
            >
              {number}
            </a>
          </li>
        ))}

        {/* Next Button */}
        {currentPage < totalPages && (
          <li className="page-item">
            <a
              onClick={() => paginate(currentPage + 1)}
              className="page-link"
              style={baseButtonStyle}
            >
              Next
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
