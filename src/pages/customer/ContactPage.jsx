import React, { useState } from 'react';
import {
  Phone,
  MapPin,
  MessageCircle,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { sendContactMessage } from '../../services/messageService';

export default function ContactPage() {
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Natural+Blend+83%2F1+Amman+Shannathi+Karaikudi+630001+Tamil+Nadu+India";
  const whatsappUrl = "https://wa.me/916381109883?text=Hello%20Natural%20Blend,%20I%20have%20an%20enquiry.";

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Please enter your mobile number.');
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage('Please enter your message.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await sendContactMessage({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || 'YOUR EMAIL',
        subject: formData.subject.trim() || 'Product Inquiry',
        message: formData.message.trim()
      });

      setSuccess(true);
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setErrorMessage('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-xs text-center space-y-3">
        <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
          Customer Support & Store Location
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact Natural Blend
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Reach out to us directly or visit our local store in Karaikudi for pure natural care products.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left Column: Business Details & Map */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Store Information
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-slate-900 font-bold text-sm block">Natural Blend Store</strong>
                  <p className="text-slate-600 font-semibold mt-0.5">Owner: M. Kavitha M.Sc</p>
                  <p className="text-slate-600">83/1, Amman Shannathi</p>
                  <p className="text-slate-600">Karaikudi – 630001</p>
                  <p className="text-slate-600">Tamil Nadu, India</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-slate-900 font-bold block">Phone & WhatsApp</strong>
                  <p className="text-slate-700 font-extrabold text-sm">6381109883</p>
                </div>
              </div>
{/* 
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-slate-900 font-bold block">Email Address</strong>
                  <p className="text-slate-600">YOUR EMAIL</p>
                </div>
              </div> */}

              {/* <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-slate-900 font-bold block">Store Hours</strong>
                  <p className="text-slate-600">YOUR WORKING HOURS</p>
                </div>
              </div> */}
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Chat
              </a>

              <a
                href="tel:6381109883"
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-4 h-4" /> Call 6381109883
              </a>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-emerald-700" /> Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Send Us a Message</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fill out the form below and we will respond promptly.</p>
          </div>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-4 rounded-2xl flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Your message has been sent successfully. We will get back to you soon!</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  placeholder="YOUR EMAIL"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div> */}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="e.g. Product Inquiry"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message *</label>
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Write your query or message here..."
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending Message...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Message
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
