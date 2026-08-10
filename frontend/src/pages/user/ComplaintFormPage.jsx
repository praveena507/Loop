import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { api } from '../../services/api';
import { Send, AlertCircle, Sparkles, Building, Mail, User, Tag, Paperclip, Upload, FileText, Check, Image as ImageIcon, X } from 'lucide-react';

export function ComplaintFormPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    place: '',
    category: 'Service',
    reason: '',
    description: '',
    attachmentUrl: ''
  });
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    'Product',
    'Service',
    'Payment',
    'Technical Issue',
    'Account',
    'Delivery',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Proof attachment file size must be under 10MB.');
      return;
    }

    setAttachmentFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachmentPreview(reader.result);
      setFormData(prev => ({ ...prev, attachmentUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview(null);
    setFormData(prev => ({ ...prev, attachmentUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.place.trim() || !formData.reason.trim()) {
      setError('Please fill in all required fields marked with *.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitComplaint(formData);
      if (res.success) {
        sessionStorage.setItem('loop_pending_complaint', JSON.stringify({
          complaintId: res.complaint.id,
          complaintNumber: res.complaint.complaintNumber,
          email: formData.email.trim(),
          devOtp: res.devOtp
        }));
        navigate('/verify-email');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Submit Your Complaint</h1>
            <p className="mt-2 text-sm text-slate-600">
              Attach proof documents or receipts below. LOOP Gemini AI will analyze your evidence and determine priority automatically.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 custom-shadow p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Location / Place & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Place / Location *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="place"
                      required
                      placeholder="e.g. New York Store #12 / Online Checkout"
                      value={formData.place}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Complaint Category / Section *
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Complaint Reason */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Complaint Reason / Subject *
                </label>
                <input
                  type="text"
                  name="reason"
                  required
                  placeholder="e.g. Double charged on checkout terminal"
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Additional Details */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Additional Details
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Provide extra context, transaction IDs, or timeline details to help our team resolve your issue quickly."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Attach Proof Document & Screenshot Dropzone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                  <span>Attach Proof Document / Receipt / Screenshot</span>
                  <span className="text-2xs text-blue-600 font-semibold">Gemini AI Document Analysis</span>
                </label>

                {!attachmentPreview ? (
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all group cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Click or drag proof file to upload (Receipt, Photo Proof, Screenshot)
                    </p>
                    <p className="text-2xs text-slate-400 mt-1">PNG, JPG, WEBP, or PDF up to 10MB</p>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      {attachmentFile?.type?.startsWith('image/') ? (
                        <img src={attachmentPreview} alt="Proof Thumbnail" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{attachmentFile?.name || 'Attached Document Proof'}</p>
                        <span className="text-2xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          Proof Ready for AI OCR Analysis ✓
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="p-1.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 rounded-lg shadow-2xs transition-colors"
                      title="Remove Attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* URL Fallback */}
                <div className="mt-3">
                  <span className="text-2xs text-slate-400 font-medium block mb-1">Or paste direct Document Proof URL:</span>
                  <div className="relative">
                    <Paperclip className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      name="attachmentUrl"
                      placeholder="https://example.com/receipt-proof.pdf"
                      value={formData.attachmentUrl}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* AI Priority & Proof Note */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center space-x-2.5 text-blue-700 text-xs font-medium">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Gemini AI automatically inspects attached document proof, calculates section impact, and assigns priority.</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting Complaint & Proof...</span>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Complaint & Proof</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
