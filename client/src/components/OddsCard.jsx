export default function OddsCard({
  title,
  odds
}) {

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-green-500 transition">

      <div className="text-sm text-zinc-400">
        Outcome
      </div>

      <div className="text-xl font-bold mt-2">
        {title}
      </div>

      <div className="text-3xl font-bold text-green-500 mt-4">
        {odds}
      </div>

    </div>
  );
}