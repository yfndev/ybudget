import { SignupForm } from "@/components/Auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="bg-muted/30 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
}
