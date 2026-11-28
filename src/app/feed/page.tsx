import FeedExperience from '@/components/feed/FeedExperience';

export const dynamic = 'force-dynamic';

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ category?: string; filters?: string }> }) {
  const params = await searchParams;
  return <FeedExperience initialCategory={params.category} initialFilters={params.filters} />;
}
