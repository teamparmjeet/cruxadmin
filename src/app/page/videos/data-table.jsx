'use client';
import Image from "next/image";
// SVG Icons for Actions, styled with Tailwind
const EditIcon = () => (
  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

// A helper object to map status to Tailwind CSS classes for the badges
const statusStyles = {
  Published: 'bg-blue-100 text-blue-800',
  Blocked: 'bg-red-100 text-red-800',
  Processing: 'bg-yellow-100 text-yellow-800',
};

export function DataTable({ data }) {
  const handleEdit = (videoId) => alert(`Editing video: ${videoId}`);
  const handleDelete = (videoId) => {
    if (confirm(`Are you sure you want to delete video: ${videoId}?`)) {
      alert(`Deleting video: ${videoId}`);
    }
  };

  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 font-medium text-left text-gray-600 uppercase tracking-wider hidden sm:table-cell">Thumbnail</th>
              <th className="px-4 py-3 font-medium text-left text-gray-600 uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 font-medium text-left text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 font-medium text-left text-gray-600 uppercase tracking-wider hidden md:table-cell">Uploader</th>
              <th className="px-4 py-3 font-medium text-left text-gray-600 uppercase tracking-wider hidden md:table-cell">Upload Date</th>
              <th className="px-4 py-3 font-medium text-right text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((video) => (
                <tr key={video._id} className="hover:bg-gray-50">
                  <td className="p-4 hidden sm:table-cell">
                    <Image
                      alt=""
                      className="w-28 aspect-video rounded-md object-cover"
                      width={50}
                      height={50}
                      src={video.thumbnailUrl}
                    />
                  </td>
                  <td className="p-4 font-medium text-gray-900">{video.title}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${statusStyles[video.status] || 'bg-gray-100 text-gray-800'}`}>
                      {video.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 hidden md:table-cell">{video.username}</td>
                  <td className="p-4 text-gray-600 hidden md:table-cell">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(video.id)} className="p-1.5 text-gray-500 rounded-full hover:bg-gray-200 hover:text-blue-600 transition-colors" title="Edit">
                        <EditIcon />
                      </button>
                      <button onClick={() => handleDelete(video.id)} className="p-1.5 text-gray-500 rounded-full hover:bg-gray-200 hover:text-red-600 transition-colors" title="Delete">
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No videos found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}