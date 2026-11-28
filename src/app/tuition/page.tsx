import FixedListingScreen from '@/components/listings/FixedListingScreen';

export default async function TuitionPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  return <FixedListingScreen kind="tuition" params={await searchParams} />;
}
