import { useProfileData } from './my-profile/useProfileData';
import { HeroSection } from './my-profile/components/HeroSection';
import { ProfileTabs } from './my-profile/components/ProfileTabs';

export function MyProfile() {
  const { profile } = useProfileData();

  return (
    <div className="container mx-auto animate-in fade-in duration-500">
      <HeroSection profile={profile} />
      <ProfileTabs profile={profile} />
    </div>
  );
}
