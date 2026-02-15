import { useAuth } from '@/contexts/AuthContext';
import { SelfServiceProvider } from '@/contexts/SelfServiceContext';
import { HeroSection } from './my-profile/components/HeroSection';
import { ProfileTabs } from './my-profile/components/ProfileTabs';

export function MyProfile() {
  const { employeeId } = useAuth();

  if (!employeeId) {
    return (
      <div className="container mx-auto text-center py-12">
        <p className="text-muted-foreground">Unable to load profile information. Please try again.</p>
      </div>
    );
  }

  return (
    <SelfServiceProvider>
      <div className="container mx-auto animate-in fade-in duration-500">
        <HeroSection employeeId={employeeId} />
        <ProfileTabs employeeId={employeeId} />
      </div>
    </SelfServiceProvider>
  );
}
