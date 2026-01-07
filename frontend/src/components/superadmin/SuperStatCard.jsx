export default function SuperStatCard({ title, value, hint }) {
  return (
    <div className="
      bg-white dark:bg-solar-bgActive border border-solar-borderLight dark:border-solar-bgActive rounded-xl p-5
    ">
      <p className="text-xs text-solar-textSecondaryLight dark:text-solar-textSecondaryDark">{title}</p>
      <p className="text-2xl font-bold text-solar-gold mt-1">
        {value}
      </p>
      {hint && (
        <p className="text-xs text-solar-success mt-2">
          {hint}
        </p>
      )}
    </div>
  );
}