'use client';

import Link from 'next/link';
import { PlatformRole, useRole } from '@/components/RoleProvider';

export default function RoleGate({
  allow,
  title,
  children,
}: {
  allow: PlatformRole[];
  title: string;
  children: React.ReactNode;
}) {
  const { role, loading } = useRole();
  const allowed = allow.includes(role);

  if (loading) {
    return <div className="py-10 text-center text-xs text-[#737373]">Loading access permissions...</div>;
  }

  if (allowed) return <>{children}</>;

  return (
    <div className="max-w-2xl mx-auto bg-white border border-[#e5e5e5] rounded-xl p-8 text-center">
      <h2 className="text-lg font-bold text-[#171717]">Access restricted</h2>
      <p className="text-xs text-[#525252] mt-2">
        {title} is available for {allow.join(' / ')} roles. Current role: <strong>{role}</strong>.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <Link href="/" className="btn-secondary">Go to Explore</Link>
        <Link href="/auth/signin" className="btn-primary">Sign in as developer</Link>
      </div>
    </div>
  );
}
