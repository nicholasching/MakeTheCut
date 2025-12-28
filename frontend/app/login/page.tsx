import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import LoginForm from "@/components/LoginForm";

// This is a Server Component - SSR'd
export default function LoginPage() {
  return (
    <GridBackground className="h-svh flex items-center justify-center">
      <HomeButton />
      <LoginForm />
    </GridBackground>
  );
}