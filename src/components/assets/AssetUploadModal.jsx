'use client';

import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { assetAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  Trash2,
  ExternalLink,
  X,
  HardDrive,
  AlertCircle
} from 'lucide-react';

const ALLOWED_EXTENSIONS = ['.docx', '.doc', '.png', '.jpg', '.jpeg', '.pdf'];
const MAX_FILES = 5;
const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getFileIcon(fileName = '', mimeType = '') {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf') || mimeType.includes('pdf')) {
    return <FileText style={{ color: '#ef4444' }} size={20} />;
  }
  if (lower.endsWith('.docx') || lower.endsWith('.doc') || mimeType.includes('word')) {
    return <FileText style={{ color: '#2563eb' }} size={20} />;
  }
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || mimeType.includes('image')) {
    return <ImageIcon style={{ color: '#10b981' }} size={20} />;
  }
  return <FileIcon style={{ color: 'var(--gray-500)' }} size={20} />;
}

export default function AssetUploadModal({ asset, isOpen, onClose, onUpdated, category = 'asset', enforceLimit }) {
  const isLimitEnforced = enforceLimit !== undefined ? enforceLimit : category === 'asset';
  const [uploads, setUploads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const fetchUploads = async () => {
    if (!asset?.id) return;
    try {
      setIsLoading(true);
      const res = await assetAPI.getUploads(asset.id, category);
      if (res && res.data) {
        setUploads(res.data.uploads || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && asset?.id) {
      setSelectedFiles([]);
      fetchUploads();
    }
  }, [isOpen, asset?.id, category]);

  const currentCount = uploads.length;
  const currentTotalBytes = uploads.reduce((acc, u) => acc + (u.file_size || 0), 0);
  const remainingCount = Math.max(0, MAX_FILES - currentCount);
  const remainingBytes = Math.max(0, MAX_TOTAL_SIZE - currentTotalBytes);

  const validateFiles = (newFiles) => {
    const valid = [];
    let addedBytes = 0;

    for (const file of newFiles) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(`"${file.name}" has an unsupported format. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
        continue;
      }
      valid.push(file);
      addedBytes += file.size;
    }

    if (valid.length === 0) return;

    if (isLimitEnforced) {
      if (currentCount + selectedFiles.length + valid.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed. You can only add ${MAX_FILES - (currentCount + selectedFiles.length)} more.`);
        return;
      }

      const currentSelectedBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);
      if (currentTotalBytes + currentSelectedBytes + addedBytes > MAX_TOTAL_SIZE) {
        toast.error(`Total size exceeds 10 MB limit. Available space: ${formatBytes(remainingBytes - currentSelectedBytes)}`);
        return;
      }
    }

    setSelectedFiles((prev) => [...prev, ...valid]);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;
    try {
      setIsUploading(true);
      await assetAPI.uploadFiles(asset.id, selectedFiles, category);
      toast.success(`${selectedFiles.length} file(s) uploaded successfully!`);
      setSelectedFiles([]);
      await fetchUploads();
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (uploadId, fileName) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    try {
      setDeletingId(uploadId);
      await assetAPI.deleteUpload(asset.id, uploadId);
      toast.success('File deleted successfully');
      await fetchUploads();
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to delete file');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  const assetTitle = asset?.dtc_number ? `DTC-${asset.dtc_number}` : asset?.asset_code || 'Asset';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Files & Attachments: ${assetTitle}`}
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HardDrive size={14} />
            <span>
              {enforceLimit ? (
                `${currentCount}/${MAX_FILES} files • ${formatBytes(currentTotalBytes)} of 10 MB used`
              ) : (
                `${currentCount} file${currentCount === 1 ? '' : 's'} attached (${formatBytes(currentTotalBytes)})`
              )}
            </span>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Storage Quota Bar (Only for Asset Management when enforceLimit is true) */}
        {enforceLimit && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
              <span style={{ color: 'var(--gray-700)' }}>Asset Storage Quota</span>
              <span style={{ color: currentTotalBytes > MAX_TOTAL_SIZE * 0.9 ? 'var(--danger-600)' : 'var(--primary-700)' }}>
                {currentCount} / {MAX_FILES} files ({((currentTotalBytes / MAX_TOTAL_SIZE) * 100).toFixed(0)}% space)
              </span>
            </div>
            <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--gray-200)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (currentTotalBytes / MAX_TOTAL_SIZE) * 100)}%`,
                  backgroundColor: currentTotalBytes > MAX_TOTAL_SIZE * 0.9 ? 'var(--danger-500)' : 'var(--primary-600)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Upload Zone */}
        {(!enforceLimit || remainingCount > 0) ? (
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? 'var(--primary-500)' : 'var(--border-color)'}`,
                backgroundColor: isDragging ? 'var(--primary-50)' : 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".docx,.doc,.png,.jpg,.jpeg,.pdf"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-600)',
                }}
              >
                <UploadCloud size={24} />
              </div>
              <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: 'var(--text-sm)' }}>
                Click to browse or drag and drop files here
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                {enforceLimit ? (
                  <>Accepted: <strong>DOCX, PNG, JPG, PDF</strong> • Max <strong>{remainingCount}</strong> more file(s) • Remaining: <strong>{formatBytes(remainingBytes)}</strong></>
                ) : (
                  <>Accepted: <strong>DOCX, PNG, JPG, PDF</strong></>
                )}
              </div>
            </div>

            {/* Selected Files Queue to be Uploaded */}
            {selectedFiles.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-700)' }}>
                  Ready to upload ({selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}):
                </div>
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      {getFileIcon(file.name, file.type)}
                      <span style={{ fontWeight: 500, color: 'var(--gray-800)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '380px' }}>
                        {file.name}
                      </span>
                      <span style={{ color: 'var(--gray-500)', fontSize: '11px' }}>({formatBytes(file.size)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', padding: '4px' }}
                      title="Remove from queue"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <Button
                    variant="accent"
                    size="sm"
                    icon={UploadCloud}
                    onClick={handleUploadSubmit}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: 'var(--text-xs)',
              color: '#92400e',
            }}
          >
            <AlertCircle size={18} />
            <span>Maximum limit of 5 files (10 MB) reached for this asset. Delete an existing file to upload a new one.</span>
          </div>
        )}

        {/* Existing Uploaded Files List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gray-900)' }}>
              Uploaded Files ({uploads.length})
            </h3>
            {isLoading && <Loader size="sm" />}
          </div>

          {isLoading && uploads.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
              Loading files...
            </div>
          ) : uploads.length === 0 ? (
            <div
              style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                backgroundColor: 'var(--gray-50)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-color)',
                color: 'var(--gray-500)',
                fontSize: 'var(--text-sm)',
              }}
            >
              No documents or files uploaded yet for this asset.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {uploads.map((file) => {
                const isDeleting = deletingId === file.id;
                const uploadDate = file.created_at ? new Date(file.created_at).toLocaleDateString() : '';
                const uploader = file.uploaded_by ? `${file.uploaded_by.first_name} ${file.uploaded_by.last_name || ''}`.trim() : null;

                return (
                  <div
                    key={file.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <div style={{ flexShrink: 0 }}>{getFileIcon(file.file_name, file.mime_type)}</div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: 'var(--gray-900)',
                            fontSize: 'var(--text-sm)',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                          title={file.file_name}
                        >
                          {file.file_name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)', display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                          <span>{formatBytes(file.file_size)}</span>
                          <span>•</span>
                          <span>{uploadDate}</span>
                          {uploader && (
                            <>
                              <span>•</span>
                              <span>By {uploader}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
                      {file.view_url && (
                        <a
                          href={file.view_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <Button size="sm" variant="ghost" icon={ExternalLink} title="Preview or Download file">
                            View
                          </Button>
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Trash2}
                        onClick={() => handleDelete(file.id, file.file_name)}
                        disabled={isDeleting}
                        style={{ color: 'var(--danger-600)' }}
                        title="Delete file"
                      >
                        {isDeleting ? '...' : ''}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
