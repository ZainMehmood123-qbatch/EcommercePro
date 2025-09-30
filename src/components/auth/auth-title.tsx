'use client';

export default function AuthTitle({ text }: { text: string }) {
  return (
    <h1 className='text-2xl font-semibold text-center text-[#007BFF] mb-6'>
      {text}
    </h1>
  );
}
