import ComingSoon from '@/components/common/ComingSoon';

type Params = { slug?: string[] };

export default async function DashboardCatchAll({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const path = ['/dashboard', ...(slug || [])].join('/');
  return (
    <ComingSoon
      title="Dashboard Section"
      description="This dashboard section is under construction."
      path={path}
    />
  );
}
