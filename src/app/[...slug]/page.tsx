import { notFound } from 'next/navigation';

interface CatchAllProps {
  params: {
    slug: string[];
  };
}

export default function CatchAll({ params }: CatchAllProps) {
  // This will trigger the not-found.tsx page for any unmatched routes
  notFound();
}

// Generate static params (optional, but helps with type safety)
export function generateStaticParams() {
  return [];
}

