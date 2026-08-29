import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquarePlus, Search, Cpu, ShieldCheck, Zap, ArrowRight, CheckCircle2, FileText, Lock, Sparkles, LayoutDashboard } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useUserAuth } from '../context/UserAuthContext';

export function LandingPage() {
  const { isAuthenticated } = useUserAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold mb-6 border border-blue-200">
              <Cpu className="w-3.5 h-3.5" />
              <span>Automated Priority & Sentiment Resolution</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Transparent, AI-Powered Customer <span className="text-blue-600 underline decoration-blue-300 underline-offset-4">Resolution</span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              LOOP connects your grievance directly to intelligent automated categorization and dedicated support investigation. Submit your issue, receive instant updates, and track progress with complete transparency.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/complaint"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/35"
              >
                <MessageSquarePlus className="w-5 h-5 mr-2" />
                Submit a Complaint
              </Link>

              <Link
                to="/track"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-xs transition-colors"
              >
                <Search className="w-5 h-5 mr-2 text-slate-500" />
                Track My Complaint
              </Link>

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5 mr-2 text-indigo-600" />
                  My Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How LOOP Resolution Works</h2>
            <p className="mt-3 text-slate-600 text-sm">Three straightforward steps to get your issue addressed, investigated, and resolved.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 card-hover">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Submit Details</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Provide your location, category, and issue description. Attach supporting document proof or receipts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 card-hover">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Email OTP Verification</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Enter the instant verification code sent to your email to verify authenticity and activate ticket triage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 card-hover">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Track & Receive Resolution</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Monitor status step-by-step and receive official resolution notices delivered directly to your inbox.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold mb-4">
                <Lock className="w-3.5 h-3.5" />
                <span>Customer Privacy Guarantee</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                Built for High Transparency & Customer Privacy
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-6">
                LOOP operates with strict boundaries protecting customer data. Track your ticket status in real-time, view verified updates, and leave feedback on the resolution quality.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2.5 shrink-0" />
                  Secure OTP email verification prevents unauthorized submissions
                </li>
                <li className="flex items-center text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2.5 shrink-0" />
                  Automated priority & category analysis guarantees timely handling
                </li>
                <li className="flex items-center text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2.5 shrink-0" />
                  Direct official response delivery to your verified email
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 custom-shadow space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">LOOP System Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Operational
                </span>
              </div>
              <div className="space-y-4 text-xs text-slate-600">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">AI Response Engine</p>
                    <p className="mt-0.5">Automated triage analysis initiates within seconds of submission.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Unique Tracking Ticket</p>
                    <p className="mt-0.5">Every complaint receives an encrypted identifier (e.g. LOOP-2026-XXXXXX).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="text-base font-bold text-slate-900 mb-2">How do I track my complaint?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Click on "Track" in the navigation bar, enter your assigned Complaint ID (e.g. LOOP-2026-849201) along with your verified email address.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="text-base font-bold text-slate-900 mb-2">Why do I need to verify my email?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Email OTP verification ensures that all submitted complaints come from authentic account owners, preventing spam and enabling direct delivery of resolution notifications.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="text-base font-bold text-slate-900 mb-2">How do I submit feedback after my issue is resolved?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Once your complaint is marked as Resolved, a feedback rating module appears on your tracking page where you can rate the handling and share additional comments.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
