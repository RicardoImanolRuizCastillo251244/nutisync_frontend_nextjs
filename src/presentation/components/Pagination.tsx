interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, currentPage - 3),
    Math.max(0, currentPage - 3) + 5
  );

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-brand-outline disabled:opacity-50"
      >
        Anterior
      </button>

      {visiblePages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-xl font-semibold transition ${
            page === currentPage
              ? 'bg-[#24B38A] text-white shadow-md'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-brand-outline disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>
  );
}
