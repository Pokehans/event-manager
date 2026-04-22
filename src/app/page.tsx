import LoginForm from "@/components/login-form";

type HomePageProps = {
  searchParams?: Promise<{
    reason?: string;
  }>;
};

export default async function HomePage({
  searchParams,
}: HomePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const reason = params?.reason;

  return <LoginForm reason={reason} />;
}