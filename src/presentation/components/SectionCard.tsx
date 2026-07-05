import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {description ? <p className="text-sm text-gray-500 mt-1">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
