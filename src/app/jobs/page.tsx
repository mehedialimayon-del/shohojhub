import FixedListingScreen from '@/components/listings/FixedListingScreen';

export default async function JobsPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  return <FixedListingScreen kind="jobs" params={await searchParams} />;
}
