import useAuthStore from "../store/authStore";

export default function Navbar() {

  const user = useAuthStore((state) => state.user);

  return (
    <div className="h-[70px] bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6">

      <h1 className="text-xl font-bold">
        AGON Dashboard
      </h1>

      <div>
        {user?.username}
      </div>

    </div>
  );
}