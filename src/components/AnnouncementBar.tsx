import { useSiteSettings } from '../context/SiteSettingsContext';

export function AnnouncementBar() {
  const { settings } = useSiteSettings();

  return (
    <div className="bg-crimson-dark text-silver text-center py-2 sm:py-2.5 px-4 sm:px-5 text-[9px] sm:text-[11px] tracking-[1.5px] sm:tracking-[2.5px] uppercase font-normal leading-relaxed">
      <span>{settings.announcement_text}</span>
    </div>
  );
}
