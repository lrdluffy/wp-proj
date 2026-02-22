import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { TableSkeleton } from '../components/Skeleton';
import { FileText, Upload, Search, X, AlertCircle, Download, Eye, Calendar } from 'lucide-react';
import type { Case, Evidence, DocumentFile } from '../types';
import { formatDate } from '../utils/format';

interface CaseWithDocuments extends Case {
  documentCount: number;
  documents: Evidence[];
}

const Documents: React.FC = () => {
  const [cases, setCases] = useState<CaseWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [viewingCase, setViewingCase] = useState<CaseWithDocuments | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCases({ page: 1 });
      const casesWithDocs = await Promise.all(
        data.results.map(async (caseItem) => {
          try {
            const evidenceData = await apiService.getEvidenceByCase(caseItem.id);
            const documentEvidence = evidenceData.results.filter(
              (e) => e.evidence_type === 'DOCUMENT'
            );
            const totalDocs = documentEvidence.reduce(
              (sum, e) => sum + (e.documents?.length || 0),
              0
            );
            return {
              ...caseItem,
              documentCount: totalDocs,
              documents: documentEvidence,
            };
          } catch (error) {
            console.error(`Error fetching evidence for case ${caseItem.id}:`, error);
            return {
              ...caseItem,
              documentCount: 0,
              documents: [],
            };
          }
        })
      );
      setCases(casesWithDocs);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = (caseItem?: Case) => {
    setSelectedCase(caseItem || null);
    setSelectedFile(null);
    setDescription('');
    setUploadError(null);
    setUploadSuccess(false);
    setUploadModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
      if (!description) {
        setDescription(`Document: ${file.name}`);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file');
      return;
    }

    if (!selectedCase) {
      setUploadError('Please select a case');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      await apiService.uploadDocumentToCase(selectedCase.id, selectedFile, description);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadModalOpen(false);
        fetchCases(); // Refresh the list
      }, 1500);
    } catch (error: any) {
      setUploadError(
        error.response?.data?.error || error.message || 'Failed to upload document'
      );
    } finally {
      setUploading(false);
    }
  };

  const filteredCases = cases.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.case_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDocuments = (caseItem: CaseWithDocuments) => {
    setViewingCase(caseItem);
    setViewerModalOpen(true);
  };

  const getDocumentUrl = (document: DocumentFile): string => {
    // Document URL is relative, need to construct full URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const baseUrl = apiBaseUrl.replace('/api', '');
    return `${baseUrl}${document.url}`;
  };

  const handleDownloadDocument = (document: DocumentFile) => {
    const url = getDocumentUrl(document);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.name;
    // Add auth token to request if available
    const token = localStorage.getItem('token');
    if (token) {
      fetch(url, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      })
        .then((response) => response.blob())
        .then((blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          link.href = blobUrl;
          link.click();
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch((error) => {
          console.error('Error downloading document:', error);
          // Fallback to direct link
          link.click();
        });
    } else {
      link.click();
    }
  };

  const handleViewDocument = (document: DocumentFile) => {
    const url = getDocumentUrl(document);
    const token = localStorage.getItem('token');
    
    // For PDFs and images, open in new tab
    const fileExtension = document.name.split('.').pop()?.toLowerCase();
    const viewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
    
    if (viewableTypes.includes(fileExtension || '')) {
      // Open in new tab with auth
      if (token) {
        fetch(url, {
          headers: {
            'Authorization': `Token ${token}`,
          },
        })
          .then((response) => response.blob())
          .then((blob) => {
            const blobUrl = window.URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
          })
          .catch((error) => {
            console.error('Error viewing document:', error);
            // Fallback to direct link
            window.open(url, '_blank');
          });
      } else {
        window.open(url, '_blank');
      }
    } else {
      // For other file types, trigger download
      handleDownloadDocument(document);
    }
  };

  // Get all documents from all evidence items for a case
  const getAllDocuments = (caseItem: CaseWithDocuments): Array<{ evidence: Evidence; document: DocumentFile }> => {
    const allDocs: Array<{ evidence: Evidence; document: DocumentFile }> = [];
    caseItem.documents.forEach((evidence) => {
      evidence.documents?.forEach((doc) => {
        allDocs.push({ evidence, document: doc });
      });
    });
    return allDocs;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Registration & Review</h2>
          <p className="text-gray-600">Manage case documents and evidence files</p>
        </div>
        <button
          onClick={() => handleUploadClick()}
          className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Upload className="h-5 w-5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents by case number or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Documents Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : filteredCases.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">No documents found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Case Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {caseItem.case_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{caseItem.title}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          caseItem.status === 'CLOSED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {caseItem.status_display}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatDate(caseItem.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{caseItem.documentCount} file{caseItem.documentCount !== 1 ? 's' : ''}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleUploadClick(caseItem)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Upload document"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                        {caseItem.documentCount > 0 && (
                          <button
                            onClick={() => handleViewDocuments(caseItem)}
                            className="text-gray-600 hover:text-gray-900"
                            title="View documents"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Upload Document</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-900">Document uploaded successfully!</p>
              </div>
            ) : (
              <>
                {/* Case Selection */}
                {!selectedCase && (
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Select Case
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        const caseId = parseInt(e.target.value);
                        if (caseId) {
                          const caseItem = cases.find((c) => c.id === caseId);
                          setSelectedCase(caseItem || null);
                        }
                      }}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">-- Select a case --</option>
                      {cases.map((caseItem) => (
                        <option key={caseItem.id} value={caseItem.id.toString()}>
                          {caseItem.case_number} - {caseItem.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedCase && (
                  <>
                    <div className="mb-4 rounded-md bg-gray-50 p-3">
                      <p className="text-sm text-gray-600">Case</p>
                      <p className="font-medium text-gray-900">
                        {selectedCase.case_number} - {selectedCase.title}
                      </p>
                    </div>

                    {/* File Selection */}
                    <div className="mb-4">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Document File
                      </label>
                      <div className="flex items-center space-x-2">
                        <label 
                          className="flex cursor-pointer items-center space-x-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          htmlFor="file-upload"  
                        >
                          <Upload className="h-4 w-4" />
                          <span>{selectedFile ? selectedFile.name : 'Choose File'}</span>
                        </label>
                        <input
                          type="file"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        />
                        {selectedFile && (
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {selectedFile && (
                        <p className="mt-1 text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Description (optional)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="Enter document description..."
                      />
                    </div>

                    {/* Error Message */}
                    {uploadError && (
                      <div className="mb-4 flex items-center space-x-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setUploadModalOpen(false)}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        disabled={uploading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading || !selectedCase}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewerModalOpen && viewingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-lg bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Document Viewer</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {viewingCase.case_number} - {viewingCase.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setViewerModalOpen(false);
                  setViewingCase(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {getAllDocuments(viewingCase).length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-500">No documents found for this case</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getAllDocuments(viewingCase).map(({ evidence, document }, index) => (
                    <div
                      key={`${evidence.id}-${index}`}
                      className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <h4 className="font-medium text-gray-900">{document.name}</h4>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="text-xs text-gray-500">
                              Evidence: {evidence.evidence_number}
                            </p>
                            {evidence.description && (
                              <p className="text-xs text-gray-500">
                                Description: {evidence.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">
                                  Uploaded: {formatDate(document.uploaded_at)}
                                </span>
                              </div>
                              <span className="text-xs">
                                Status: {evidence.status_display}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleViewDocument(document)}
                            className="flex items-center space-x-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                            title="View document"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(document)}
                            className="flex items-center space-x-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            title="Download document"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Total: {getAllDocuments(viewingCase).length} document{getAllDocuments(viewingCase).length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => {
                    setViewerModalOpen(false);
                    setViewingCase(null);
                  }}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;