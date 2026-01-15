import React from 'react';

interface Props {
  data: any;
}

const Row = ({ label, value }: { label: string; value: any }) => (
  <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
    <span className="font-medium text-gray-600 dark:text-gray-400">{label}</span>
    <span className="font-semibold text-gray-900 dark:text-gray-100">{value ?? '—'}</span>
  </div>
);

const ArtDetails: React.FC<Props> = ({ data }) => {
  const a = data?.attributes || {};
  return (
    <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-6 space-y-5">
      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Artwork Details</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Row label="Artist" value={a.artist} />
        <Row label="Medium" value={a.medium} />
        <Row label="Canvas Size" value={a.canvas_size} />
        <Row label="Year Created" value={a.year_created} />
        <Row label="Signed" value={a.signed === true ? 'Yes' : a.signed === false ? 'No' : '—'} />
        <Row label="Provenance" value={a.provenance} />
        <Row label="Certificate of Authenticity" value={a.certificate_of_authenticity ? 'Yes' : '—'} />
      </div>
      {Array.isArray(a.gallery_images) && a.gallery_images.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Gallery</h5>
          <div className="flex gap-3 overflow-x-auto mt-2">
            {a.gallery_images.map((url: string, idx: number) => (
              <img key={idx} src={url} alt={`Artwork ${idx + 1}`} className="h-20 w-28 object-cover rounded-xl border" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtDetails;

