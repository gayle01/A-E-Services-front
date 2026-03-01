﻿﻿﻿import { ChevronLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function WorkerLogUpdateScreen({
  categories = [],
  workers = [],
  isCompany = false,
  isClientRequest = false,
  initialClientName = '',
  onBack,
  onSubmit
}) {
  const normalizedCategories = categories.length > 0 ? categories : ['General'];
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(normalizedCategories[0]);
  const [assignedWorkerId, setAssignedWorkerId] = useState(isCompany && workers.length > 0 ? workers[0].id : '');
  const [clientName, setClientName] = useState(initialClientName);
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [beforePhotoUrl, setBeforePhotoUrl] = useState('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('');
  const [beforeUploadedImage, setBeforeUploadedImage] = useState('');
  const [afterUploadedImage, setAfterUploadedImage] = useState('');
  const [errors, setErrors] = useState({});
  const beforeCameraRef = useRef(null);
  const beforeGalleryRef = useRef(null);
  const afterCameraRef = useRef(null);
  const afterGalleryRef = useRef(null);

  const isValidUrl = (value) => {
    if (!value) return true;
    try {
      // Basic URL check to avoid malformed proof links
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!normalizedCategories.includes(category)) {
      setCategory(normalizedCategories[0]);
    }
  }, [normalizedCategories, category]);

  const setPreviewFromFile = (file, type) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      if (type === 'before') {
        setBeforeUploadedImage(dataUrl);
        setBeforePhotoUrl('');
      } else {
        setAfterUploadedImage(dataUrl);
        setAfterPhotoUrl('');
      }
    };
    reader.readAsDataURL(file);
  };

  const beforePreview = beforeUploadedImage || beforePhotoUrl.trim();
  const afterPreview = afterUploadedImage || afterPhotoUrl.trim();

  useEffect(() => {
    if (isClientRequest) {
      setClientName(initialClientName || '');
      setAssignedWorkerId('');
    }
  }, [isClientRequest, initialClientName]);

  const handleSubmit = () => {
    const nextErrors = {};

    if (!title.trim()) nextErrors.title = 'Work title is required.';
    if (isCompany && !assignedWorkerId && !clientName.trim()) nextErrors.assignedWorkerId = 'Assign to a worker or specify client.';
    if (!category) nextErrors.category = 'Please select a category.';
    if (!isClientRequest && !clientName.trim()) nextErrors.clientName = 'Client name is required.';
    if (!location.trim()) nextErrors.location = 'Location is required.';
    if (!isClientRequest && !assignedWorkerId) {
      if (!beforePreview) nextErrors.beforePhotoUrl = 'Add before proof via URL or photo upload.';
      if (!afterPreview) nextErrors.afterPhotoUrl = 'Add after proof via URL or photo upload.';
      if (beforePhotoUrl.trim() && !isValidUrl(beforePhotoUrl.trim())) nextErrors.beforePhotoUrl = 'Enter a valid URL (https://...).';
      if (afterPhotoUrl.trim() && !isValidUrl(afterPhotoUrl.trim())) nextErrors.afterPhotoUrl = 'Enter a valid URL (https://...).';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit?.({
      title: title.trim(),
      category,
      assignedWorkerId,
      clientName: clientName.trim(),
      location: location.trim(),
      note: note.trim(),
      beforePhotoUrl: beforePreview,
      afterPhotoUrl: afterPreview
    });
  };

  return (
    <div className="min-h-screen p-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-2xl border border-white bg-white/90 flex items-center justify-center hover:bg-white transition shadow-sm"
        >
          <ChevronLeft size={20} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{isClientRequest ? 'Request Service' : 'Log New Work Update'}</h1>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Required fields are marked with <span className="text-red-500">*</span>. {isClientRequest ? 'Add clear request details so the company can review and assign quickly.' : 'Fill accurate details so client verification is fast.'}
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-700">Work Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. AC repair"
            className="w-full mt-1 bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm"
          />
          <p className="text-[11px] text-gray-500 mt-1">Short title describing the task done.</p>
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {isCompany && workers.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-gray-700">Assign To</label>
            <select
              value={assignedWorkerId}
              onChange={(event) => setAssignedWorkerId(event.target.value)}
              className="w-full mt-1 bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-700">Category <span className="text-red-500">*</span></label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full mt-1 bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm"
          >
            {normalizedCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
        </div>

        {!isClientRequest && (
          <div>
            <label className="text-xs font-semibold text-gray-700">Client Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              placeholder="Client full name"
              className="w-full mt-1 bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm"
            />
            {errors.clientName && <p className="text-xs text-red-500 mt-1">{errors.clientName}</p>}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-700">Work Location <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. 14 Oxford Street"
            className="w-full mt-1 bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm"
          />
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700">Progress Note (Optional)</label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Describe exactly what was done, materials used, and current status."
            rows={4}
            className="w-full mt-1 bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm resize-none"
          />
          <p className="text-[11px] text-gray-500 mt-1">Optional: mention measurable outcomes and what remains (if anything).</p>
          {errors.note && <p className="text-xs text-red-500 mt-1">{errors.note}</p>}
        </div>

        {!isClientRequest && !assignedWorkerId && (
        <>
        <div>
          <label className="text-xs font-semibold text-gray-700">Before Photo URL <span className="text-red-500">*</span></label>
          <input
            type="url"
            value={beforePhotoUrl}
            onChange={(event) => {
              const value = event.target.value;
              setBeforePhotoUrl(value);
              if (value.trim() && beforeUploadedImage) {
                setBeforeUploadedImage('');
              }
            }}
            placeholder="https://..."
            className="w-full mt-1 bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm"
          />
          <p className="text-[11px] text-gray-500 mt-1">Paste a proof link or use camera/gallery buttons below.</p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => beforeCameraRef.current?.click()}
              className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50"
            >
              Take Photo
            </button>
            <button
              type="button"
              onClick={() => beforeGalleryRef.current?.click()}
              className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50"
            >
              Upload from Gallery
            </button>
          </div>
          <input
            ref={beforeCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => setPreviewFromFile(event.target.files?.[0], 'before')}
          />
          <input
            ref={beforeGalleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => setPreviewFromFile(event.target.files?.[0], 'before')}
          />
          {beforePreview ? (
            <img
              src={beforePreview}
              alt="Before preview"
              className="mt-2 w-full h-36 object-cover rounded-xl border border-gray-200"
            />
          ) : (
            <div className="mt-2 w-full h-24 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 flex items-center justify-center">
              Before proof preview
            </div>
          )}
          {errors.beforePhotoUrl && <p className="text-xs text-red-500 mt-1">{errors.beforePhotoUrl}</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700">After Photo URL <span className="text-red-500">*</span></label>
          <input
            type="url"
            value={afterPhotoUrl}
            onChange={(event) => {
              const value = event.target.value;
              setAfterPhotoUrl(value);
              if (value.trim() && afterUploadedImage) {
                setAfterUploadedImage('');
              }
            }}
            placeholder="https://..."
            className="w-full mt-1 bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm"
          />
          <p className="text-[11px] text-gray-500 mt-1">Paste a proof link or use camera/gallery buttons below.</p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => afterCameraRef.current?.click()}
              className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50"
            >
              Take Photo
            </button>
            <button
              type="button"
              onClick={() => afterGalleryRef.current?.click()}
              className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50"
            >
              Upload from Gallery
            </button>
          </div>
          <input
            ref={afterCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => setPreviewFromFile(event.target.files?.[0], 'after')}
          />
          <input
            ref={afterGalleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => setPreviewFromFile(event.target.files?.[0], 'after')}
          />
          {afterPreview ? (
            <img
              src={afterPreview}
              alt="After preview"
              className="mt-2 w-full h-36 object-cover rounded-xl border border-gray-200"
            />
          ) : (
            <div className="mt-2 w-full h-24 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 flex items-center justify-center">
              After proof preview
            </div>
          )}
          {errors.afterPhotoUrl && <p className="text-xs text-red-500 mt-1">{errors.afterPhotoUrl}</p>}
        </div>
        </>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full mt-5 bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition"
      >
        {isClientRequest ? 'Send Service Request' : assignedWorkerId ? 'Assign Job' : 'Submit for Client Verification'}
      </button>
    </div>
  );
}

export default WorkerLogUpdateScreen;
