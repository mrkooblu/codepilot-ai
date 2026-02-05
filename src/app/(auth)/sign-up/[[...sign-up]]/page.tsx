import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8FA]">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-none border border-[#E8E8E8]',
          }
        }}
      />
    </div>
  );
}
