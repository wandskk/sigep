import { Loader } from "@/components/ui/Loader";

export default function GestorLoading() {
  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="min-h-[50vh] flex items-center justify-center">
            <Loader size="lg" variant="border" text="" />
          </div>
        </div>
      </div>
    </div>
  );
}
