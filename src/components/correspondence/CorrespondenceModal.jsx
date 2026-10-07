'use client';

import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { agencyAPI } from '@/lib/api';
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
  Building,
  Mail,
  User,
  Calendar
} from 'lucide-react';

const ALLOWED_EXTENSIONS = ['.docx', '.doc', '.png', '.jpg', '.jpeg', '.pdf'];

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
    return <FileText style={{ color: '#ef4444' }} size={22} />;
  }
  if (lower.endsWith('.docx') || lower.endsWith('.doc') || mimeType.includes('word')) {
    return <FileText style={{ color: '#2563eb' }} size={22} />;
  }
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || mimeType.includes('image')) {
    return <ImageIcon style={{ color: '#10b981' }} size={22} />;
  }
  return <FileIcon style={{ color: 'var(--gray-500)' }} size={22} />;
}

export default function CorrespondenceModal({ agency, isOpen, onClose, onUpdated }) {
  const [uploads, setUploads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { uploadId, fileName }
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const fetchUploads = async () => {
    if (!agency?.id) return;
    try {
      setIsLoading(true);
      const res = await agencyAPI.getUploads(agency.id);
      if (res && res.data) {
        setUploads(res.data.uploads || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load correspondence files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && agency?.id) {
      setSelectedFiles([]);
      fetchUploads();
    }
  }, [isOpen, agency?.id]);

  const currentCount = uploads.length;
  const currentTotalBytes = uploads.reduce((acc, u) => acc + (u.file_size || 0), 0);

  const validateFiles = (newFiles) => {
    const valid = [];

    for (const file of newFiles) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(`"${file.name}" has an unsupported format. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...valid]);
  };

  const handleFileChange = (e) => {
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

  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;
    try {
      setIsUploading(true);
      await agencyAPI.uploadFiles(agency.id, selectedFiles);
      toast.success(`${selectedFiles.length} file(s) uploaded successfully`);
      setSelectedFiles([]);
      await fetchUploads();
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (uploadId, fileName) => {
    setDeleteTarget({ uploadId, fileName });
  };

  const handleConfirmDeleteFile = async () => {
    if (!deleteTarget) return;
    try {
      setDeletingId(deleteTarget.uploadId);
      await agencyAPI.deleteUpload(agency.id, deleteTarget.uploadId);
      toast.success('File deleted successfully');
      setDeleteTarget(null);
      setUploads((prev) => prev.filter((u) => u.id !== deleteTarget.uploadId));
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to delete file');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building size={20} style={{ color: 'var(--primary-600)' }} />
          <span>Correspondence & Documents — {agency?.name}</span>
        </div>
      }
      maxWidth="720px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
            <HardDrive size={14} />
            <span>
              Total {uploads.length} document{uploads.length === 1 ? '' : 's'} ({formatBytes(currentTotalBytes)})
            </span>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Agency Summary Header Card */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--primary-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--primary-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary-900)', fontSize: '15px' }}>
                {agency?.name}
              </span>
              {agency?.vendor_code && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    fontWeight: 700,
                    letterSpacing: '0.02em'
                  }}
                >
                  Code: {agency.vendor_code}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '9999px',
                backgroundColor: 'var(--primary-200)',
                color: 'var(--primary-800)',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
            >
              {agency?.type || 'DT_Repairing Agency'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--gray-600)', flexWrap: 'wrap' }}>
            {agency?.contact && <span>📞 {agency.contact}</span>}
            {agency?.email && <span>✉️ {agency.email}</span>}
            {agency?.address && <span>📍 {agency.address}</span>}
          </div>
        </div>

        {/* Drag and Drop Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragging ? '2px dashed var(--primary-600)' : '2px dashed var(--gray-300)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 16px',
            textAlign: 'center',
            backgroundColor: isDragging ? 'var(--primary-50)' : 'var(--gray-50)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
          />
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <UploadCloud size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-800)' }}>
              Click or drag files here to upload correspondence
            </div>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
              Work orders, test reports, letters, agreements, inspection certificates, photos (PDF, DOCX, PNG, JPG)
            </div>
          </div>
        </div>

        {/* Staged files to upload */}
        {selectedFiles.length > 0 && (
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-700)' }}>
                Files ready to upload ({selectedFiles.length})
              </span>
              <Button
                size="sm"
                variant="accent"
                icon={UploadCloud}
                onClick={handleUploadSubmit}
                loading={isUploading}
              >
                Upload Selected ({formatBytes(selectedFiles.reduce((acc, f) => acc + f.size, 0))})
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--gray-50)',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    {getFileIcon(file.name, file.type)}
                    <span style={{ fontWeight: 500, color: 'var(--gray-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '350px' }}>
                      {file.name}
                    </span>
                    <span style={{ color: 'var(--gray-400)', fontSize: '11px' }}>({formatBytes(file.size)})</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSelectedFile(idx);
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--gray-400)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Uploaded Files List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-800)' }}>
              Attached Correspondence Documents ({uploads.length})
            </span>
            {isLoading && <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Refreshing...</span>}
          </div>

          {isLoading && uploads.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
              <Loader />
            </div>
          ) : uploads.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'var(--gray-50)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--gray-500)',
                fontSize: '13px'
              }}
            >
              No correspondence documents attached yet. Upload repair letters, testing reports, or orders above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {uploads.map((file) => {
                const uploaderName = file.uploaded_by
                  ? `${file.uploaded_by.first_name || ''} ${file.uploaded_by.last_name || ''}`.trim() || file.uploaded_by.cpf_number
                  : null;
                const formattedDate = file.created_at ? new Date(file.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '';

                return (
                  <div
                    key={file.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--gray-200)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      <div style={{ flexShrink: 0 }}>
                        {getFileIcon(file.file_name, file.mime_type)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: '13px',
                            color: 'var(--gray-900)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '380px'
                          }}
                          title={file.file_name}
                        >
                          {file.file_name}
                        </span>
                        <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px', alignItems: 'center' }}>
                          <span>{formatBytes(file.file_size)}</span>
                          {formattedDate && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Calendar size={11} /> {formattedDate}
                            </span>
                          )}
                          {uploaderName && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <User size={11} /> {uploaderName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {file.view_url && (
                        <a
                          href={file.view_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--primary-50)',
                            color: 'var(--primary-700)',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none'
                          }}
                          title="Open / View Document"
                        >
                          <ExternalLink size={13} />
                          <span>View</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteClick(file.id, file.file_name)}
                        disabled={deletingId === file.id}
                        style={{
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--gray-200)',
                          backgroundColor: '#fff',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Delete Document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteFile}
        title="Delete Document"
        message={
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--gray-700)', lineHeight: 1.5 }}>
            Are you sure you want to delete <strong>&ldquo;{deleteTarget?.fileName}&rdquo;</strong>? This action cannot be undone.
          </p>
        }
        confirmLabel="Delete Document"
        loading={!!deletingId}
        icon={Trash2}
      />
    </>
  );
}
