import { useEffect, useState } from 'react';
import { router, Link } from '@inertiajs/react';
import GlassCard from '@/Components/GlassCard.jsx';
import { Button } from '@heroui/react';

export default function SessionExpiredModal({ setSessionExpired }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
      if (countdown === 0) {
          setCountdown(5);
          setSessionExpired(false);
          router.visit('/login'); // Redirect automatically
      }
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="inline-flex">
        <GlassCard className="p-6 text-center flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Session Expired</h2>
          <p className="text-gray-300">
            Your session has expired. You will be redirected in <span className="font-semibold text-white">{countdown}</span> seconds.
          </p>
          <Button
            as={Link}
            href="/login"
            method="get"
            preserveState={false}
            preserveScroll={false}
            variant="light"
            className="transition-all duration-300 hover:scale-105 text-white bg-white/10 hover:bg-white/20 rounded-xl px-4"
            size="md"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
              color: '#fff',
            }}
          >
            <span className="font-semibold">Login Now</span>
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}
