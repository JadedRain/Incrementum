import '../styles/PaginationControls.css'

type PaginationControlsProps = {
  page: number;
  hasMore: boolean;
  loading?: boolean;
  totalPages?: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function PaginationControls({ page, hasMore, loading, totalPages, onPrev, onNext }: PaginationControlsProps) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <button
        onClick={onPrev}
        disabled={page === 0}
        className="pagination-button"
      >
        Previous
      </button>
      
      <button
        onClick={onNext}
        disabled={!hasMore || Boolean(loading)}
        className="pagination-button"
      >
        Next
      </button>

      <div className="pagination-info" aria-live="polite">
        {totalPages && totalPages > 0 ? `Page ${page + 1} of ${totalPages}` : `Page ${page + 1}`}
      </div>
    </div>
  );
}