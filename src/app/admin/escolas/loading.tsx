export default function SchoolsLoading() {
  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="h-10 w-96 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 