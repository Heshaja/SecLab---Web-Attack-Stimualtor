interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badgeColor?: string;
  badge?: string;
}

export default function SectionHeader({ icon, title, subtitle, badge, badgeColor = 'bg-red-600' }: SectionHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl ${badgeColor} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {badge && (
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-900/50 text-red-400 border border-red-800/50">
                {badge}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
