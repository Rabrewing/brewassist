import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ConsoleIndexPage() {
  const router = useRouter();

  useEffect(() => {
    void router.replace('/console/overview');
  }, [router]);

  return null;
}
