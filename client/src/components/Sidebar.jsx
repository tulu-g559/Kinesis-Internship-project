export default function Sidebar() {

  return (
    <div className="w-[250px] h-screen bg-zinc-950 border-r border-zinc-800 p-5">

      <h1 className="text-2xl font-bold text-green-500">
        KINESIS
      </h1>

      <div className="mt-10 space-y-4">

        <button className="block">
          Dashboard
        </button>

        <button className="block">
          Markets
        </button>

        <button className="block">
          Portfolio
        </button>

        <button className="block">
          AI Agents
        </button>

      </div>

    </div>
  );
}