import Header from "~/app/components/Header";

export default function Loading() {
  return (
    <>
      <Header />
      <div className="animate-pulse max-w-2xl mx-auto py-4">
        <div className="flex items-center gap-4 mb-6">
          <button className="h-6 w-32 bg-white/10 rounded-lg">
            <div className="flex items-center gap-2"></div>
          </button>
          <div className="flex-1"></div>
          <button className="h-6 w-32 bg-white/10 rounded-lg"></button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10"></div>
            <div className="h-8 w-64 bg-white/10 rounded"></div>
            <div className="h-6 w-96 bg-white/10 rounded font-mono"></div>
          </div>

          <div className="space-y-4">
            <div className="h-8 w-48 bg-white/10 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
              <div className="aspect-square bg-white/10 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
