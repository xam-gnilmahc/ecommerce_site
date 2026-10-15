import React from 'react';
import './Pagination.css';

const Pagination = ({ postsPerPage, totalPosts, paginate, currentPage }) => {
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const maxPagesToShow = 10;

  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Page navigation" className="plp-pagination">
      <ul className="plp-pagination__list">
        {currentPage > 1 && (
          <li>
            <button
              type="button"
              className="plp-pagination__btn"
              onClick={() => paginate(currentPage - 1)}
            >
              Previous
            </button>
          </li>
        )}

        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              type="button"
              className={`plp-pagination__btn ${number === currentPage ? 'is-active' : ''}`}
              onClick={() => paginate(number)}
            >
              {number}
            </button>
          </li>
        ))}

        {currentPage < totalPages && (
          <li>
            <button
              type="button"
              className="plp-pagination__btn"
              onClick={() => paginate(currentPage + 1)}
            >
              Next
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
