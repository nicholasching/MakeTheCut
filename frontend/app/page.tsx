import { cookies } from 'next/headers';
import HomeContent from '@/components/HomeContent';
import type { DataSummaryResponse } from '@makethecut/shared';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export default async function HomePage() {
  let totalPoints = 0;

  try {
    const cookieStore = await cookies();
    const res = await fetch(`${BACKEND_URL}/mtc/data-summary`, {
      cache: 'no-store',
      headers: { Cookie: cookieStore.toString() },
    });
    if (res.ok) {
      const data: DataSummaryResponse = await res.json();
      totalPoints = data.totalPoints;
    }
  } catch (e) {
    console.error('Failed to fetch data summary:', e);
  }

  return <HomeContent initialCount={totalPoints} />;
}
