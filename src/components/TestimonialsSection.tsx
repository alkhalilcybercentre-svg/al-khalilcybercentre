import React, { useState } from 'react';
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  User, 
  MapPin, 
  PlusCircle, 
  Send, 
  Sparkles, 
  X, 
  ShieldCheck,
  ThumbsUp,
  Quote
} from 'lucide-react';
import { TestimonialItem } from '../types';
import { submitCustomerReview } from '../lib/api';

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
  onReviewSubmitted?: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ 
  testimonials = [],
  onReviewSubmitted 
}) => {
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerCity: '',
    rating: 5,
    serviceAvail: 'Jan Seva & Digital Documentation',
    reviewText: '',
    customerMobile: ''
  });

  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const approvedList = testimonials.filter(t => t.isApproved !== false);

  // Stats calculation
  const totalReviews = approvedList.length;
  const avgRating = totalReviews > 0
    ? (approvedList.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  const fiveStarCount = approvedList.filter(t => t.rating === 5).length;
  const fiveStarPct = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 100;

  const popularServices = [
    'Jan Seva & Digital Documentation',
    'Aadhaar Update & PVC Smart Card',
    'Instant PAN Card (2 Hours)',
    'Wedding Cards Offset Printing',
    '4K Drone Photography & Video',
    'UP Govt Job / Scholarship Form',
    'Ayushman Card & Health Schemes',
    'Flex Banner & Business Printing'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.reviewText.trim()) {
      setErrorMessage('Please provide your name and your review feedback.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      await submitCustomerReview(formData);
      setSubmitSuccess(true);
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      setTimeout(() => {
        setIsWriteModalOpen(false);
        setSubmitSuccess(false);
        setFormData({
          customerName: '',
          customerCity: '',
          rating: 5,
          serviceAvail: 'Jan Seva & Digital Documentation',
          reviewText: '',
          customerMobile: ''
        });
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="testimonials" className="relative py-16 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800/80">
      {/* Background radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 -left-24 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Rating Overview Box */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Client Feedback
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Customer Testimonials & Star Ratings
            </h2>
            <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Read authentic feedback from hundreds of satisfied clients who trust AL KHALIL CYBER CENTRE for digital Jan Seva, high-speed printing, and photography services.
            </p>
          </div>

          {/* Aggregate Rating Score Card & Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-4 pr-0 sm:pr-4 sm:border-r border-slate-800">
              <div className="text-center">
                <span className="text-3xl sm:text-4xl font-black text-amber-400">
                  {avgRating}
                </span>
                <span className="text-xs text-slate-500 block">out of 5.0</span>
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {totalReviews} Verified Reviews ({fiveStarPct}% 5-Star)
                </div>
              </div>
            </div>

            <button
              id="write-review-btn"
              onClick={() => setIsWriteModalOpen(true)}
              className="px-5 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Write a Review
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedList.map((test) => (
            <div
              key={test.id}
              id={`testimonial-card-${test.id}`}
              className="relative rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-slate-950/50 backdrop-blur-sm group"
            >
              {/* Top Quote Icon & Rating */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= test.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  {test.isFeatured && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Service Tag */}
                <div className="inline-block px-2.5 py-1 rounded-md bg-slate-800/90 text-cyan-300 text-xs font-medium mb-3 border border-slate-700/50">
                  {test.serviceAvail}
                </div>

                {/* Review Text */}
                <div className="relative mb-6">
                  <Quote className="absolute -top-1 -left-2 w-6 h-6 text-slate-800 -z-0 opacity-50" />
                  <p className="relative z-10 text-slate-300 text-sm leading-relaxed italic">
                    "{test.reviewText}"
                  </p>
                </div>

                {/* Official Response from Center if present */}
                {test.responseFromAdmin && (
                  <div className="mb-4 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Response from AL KHALIL CYBER CENTRE:
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {test.responseFromAdmin}
                    </p>
                  </div>
                )}
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {test.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1">
                      {test.customerName}
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" title="Verified Customer" />
                    </div>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {test.customerCity || 'Uttar Pradesh'}
                    </span>
                  </div>
                </div>

                <span className="text-slate-500 text-[11px]">
                  {new Date(test.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Write a Review Modal */}
        {isWriteModalOpen && (
          <div 
            id="review-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
            onClick={() => setIsWriteModalOpen(false)}
          >
            <div 
              id="review-modal-card"
              className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 my-8 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                id="close-review-modal-btn"
                onClick={() => setIsWriteModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {submitSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Thank You for Your Feedback!
                  </h3>
                  <p className="text-slate-300 text-sm max-w-sm mx-auto">
                    Your rating and review for AL KHALIL CYBER CENTRE have been submitted successfully.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-amber-400" />
                      Rate & Review Our Services
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Share your experience with AL KHALIL CYBER CENTRE to help other visitors.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  {/* Star Rating Picker */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-center">
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Select Your Overall Rating
                    </label>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating !== null ? hoverRating : formData.rating) >= star;
                        return (
                          <button
                            type="button"
                            key={star}
                            id={`star-select-${star}`}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className="p-1 text-slate-600 hover:scale-125 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                active
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs text-amber-400 font-bold block mt-1">
                      {formData.rating} Out of 5 Stars ({formData.rating === 5 ? 'Excellent' : formData.rating === 4 ? 'Very Good' : formData.rating === 3 ? 'Good' : 'Fair'})
                    </span>
                  </div>

                  {/* Name & City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        id="review-input-name"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="e.g. Mohd Rashid"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        City / Village
                      </label>
                      <input
                        type="text"
                        id="review-input-city"
                        value={formData.customerCity}
                        onChange={(e) => setFormData({ ...formData, customerCity: e.target.value })}
                        placeholder="e.g. Bareilly, UP"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Service Used */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Service Availed
                    </label>
                    <select
                      id="review-input-service"
                      value={formData.serviceAvail}
                      onChange={(e) => setFormData({ ...formData, serviceAvail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    >
                      {popularServices.map((svc) => (
                        <option key={svc} value={svc} className="bg-slate-900 text-white">
                          {svc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Your Feedback / Review *
                    </label>
                    <textarea
                      required
                      rows={3}
                      id="review-input-text"
                      value={formData.reviewText}
                      onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                      placeholder="Write how was the turnaround time, print quality, staff support or ease of service..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Optional Mobile */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Mobile Number <span className="text-slate-600">(Optional, kept private)</span>
                    </label>
                    <input
                      type="tel"
                      id="review-input-mobile"
                      value={formData.customerMobile}
                      onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                      placeholder="e.g. 9259837361"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      id="submit-review-btn"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <span>Submitting Review...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Publish Customer Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
