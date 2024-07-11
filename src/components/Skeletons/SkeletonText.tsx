export default function SkeletonText({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-sm bg-white ${className}`} />;
}
