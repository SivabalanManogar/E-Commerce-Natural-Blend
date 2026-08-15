import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, CheckCircle2, Phone, Mail, Calendar, Eye, X } from 'lucide-react';
import { subscribeToMessages, markMessageRead, deleteMessage } from '../../services/messageService';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages((list) => {
      setMessages(list);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleView = async (msg) => {
    setSelectedMsg(msg);
    if (msg.status === 'New') {
      await markMessageRead(msg.id);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await deleteMessage(id);
    if (selectedMsg && selectedMsg.id === id) {
      setSelectedMsg(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Customer Messages</h1>
        <p className="text-xs text-slate-500 mt-0.5">Inquiries submitted via the website contact form.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No contact messages received yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${msg.status === 'New' ? 'bg-amber-50/50 font-medium' : 'hover:bg-slate-50'
                  }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-slate-900">{msg.name}</strong>
                    {msg.status === 'New' && (
                      <span className="bg-amber-500 text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(msg.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700">{msg.subject || 'No Subject'}</p>
                  <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">{msg.message}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleView(msg)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Read
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Modal */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">{selectedMsg.subject}</h3>
              <button onClick={() => setSelectedMsg(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p><strong>From:</strong> {selectedMsg.name}</p>
              <p className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <strong>Phone:</strong> <a href={`tel:${selectedMsg.phone}`} className="text-emerald-700 underline">{selectedMsg.phone}</a>
              </p>
              <p className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <strong>Email:</strong> {selectedMsg.email}
              </p>
              <p className="text-slate-400 text-[10px]">
                Received on: {new Date(selectedMsg.createdAt).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
              {selectedMsg.message}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMsg(null)}
                className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
