type LoadingProps = {
  loading: boolean;
  loadingText?: string;
};

export default function Loading({ loading, loadingText }: LoadingProps) {
  return (
    <div style={{ marginTop: '2rem' }}>
      {loading && (
        <p className="text-[hsl(40,61%,55%)] text-lg font-semibold">{loadingText || 'Loading...'}</p>
      )}
    </div>
  );
}