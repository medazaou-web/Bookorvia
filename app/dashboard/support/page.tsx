"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../../lib/supabase/browserClient";

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at?: string;
  last_message_at?: string;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: string;
  message: string;
  created_at: string;
}

export default function SupportPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newTicketData, setNewTicketData] = useState({
    subject: "",
    category: "general",
    priority: "normal",
    message: "",
  });
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadTickets();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages();
      const interval = setInterval(loadMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedTicket]);

  async function loadUser() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = (userData as any)?.user;
      if (!user) {
        router.push("/login");
        return;
      }
      setCurrentUser(user);
    } catch (e) {
      console.error("Error loading user:", e);
      router.push("/login");
    }
  }

  async function loadTickets() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (err) throw err;
      setTickets(data ?? []);

      if (data && data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages() {
    if (!selectedTicket) return;
    
    // Show loading only on initial load
    if (messages.length === 0 && !initialLoadComplete) {
      setMessageLoading(true);
    }
    
    try {
      const { data, error: err } = await supabase
        .from("support_ticket_messages")
        .select("*")
        .eq("ticket_id", selectedTicket.id)
        .order("created_at", { ascending: true });

      if (err) throw err;
      setMessages(data ?? []);
      setInitialLoadComplete(true);
    } catch (e: any) {
      console.error("Error loading messages:", e);
    } finally {
      setMessageLoading(false);
    }
  }

  async function handleCreateTicket() {
    if (!newTicketData.subject.trim() || !newTicketData.message.trim()) {
      setError("Subject and message are required");
      return;
    }

    setCreatingTicket(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const { data: ticketData, error: ticketErr } = await supabase
        .from("support_tickets")
        .insert({
          user_id: currentUser.id,
          subject: newTicketData.subject,
          category: newTicketData.category,
          priority: newTicketData.priority,
          status: "open",
          created_at: now,
          updated_at: now,
          last_message_at: now,
        })
        .select()
        .single();

      if (ticketErr) throw ticketErr;

      const { error: messageErr } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: ticketData.id,
          sender_id: currentUser.id,
          sender_role: "user",
          message: newTicketData.message,
          created_at: now,
        });

      if (messageErr) throw messageErr;

      setNewTicketData({ subject: "", category: "general", priority: "normal", message: "" });
      setShowNewTicketForm(false);
      await loadTickets();
      setSelectedTicket(ticketData);
    } catch (e: any) {
      setError(e?.message || "Failed to create ticket");
    } finally {
      setCreatingTicket(false);
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedTicket) return;

    if (selectedTicket.status === "closed") {
      setError("This ticket is closed. You cannot reply to closed tickets.");
      return;
    }

    setSubmittingMessage(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const { error: messageErr } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: selectedTicket.id,
          sender_id: currentUser.id,
          sender_role: "user",
          message: newMessage,
          created_at: now,
        });

      if (messageErr) throw messageErr;

      const { error: updateErr } = await supabase
        .from("support_tickets")
        .update({ last_message_at: now, updated_at: now })
        .eq("id", selectedTicket.id);

      if (updateErr) throw updateErr;

      setNewMessage("");
      await loadMessages();
      await loadTickets();
    } catch (e: any) {
      setError(e?.message || "Failed to send message");
    } finally {
      setSubmittingMessage(false);
    }
  }

  const filteredTickets =
    statusFilter === "all"
      ? tickets
      : tickets.filter((t) => t.status === statusFilter);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-900";
      case "high":
        return "bg-amber-100 text-amber-900";
      case "normal":
        return "bg-blue-100 text-blue-900";
      default:
        return "bg-slate-100 text-slate-900";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-900";
      case "in_progress":
        return "bg-amber-100 text-amber-900";
      case "resolved":
        return "bg-emerald-100 text-emerald-900";
      case "closed":
        return "bg-slate-100 text-slate-900";
      default:
        return "bg-slate-100 text-slate-900";
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)] max-h-[calc(100vh-200px)] overflow-hidden">

      {/* Tickets List Sidebar */}
      <div className="md:col-span-1 flex flex-col bg-white/60 backdrop-blur rounded-2xl border border-white/60 overflow-hidden">
        <div className="p-4 border-b border-white/40">
          <button
            onClick={() => setShowNewTicketForm(!showNewTicketForm)}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:shadow-lg transition-all active:scale-95"
          >
            + New Ticket
          </button>
        </div>

        {/* New Ticket Form */}
        {showNewTicketForm && (
          <div className="p-4 border-b border-white/40 bg-indigo-50/50 space-y-3">
            <input
              type="text"
              placeholder="Subject"
              value={newTicketData.subject}
              onChange={(e) => setNewTicketData({ ...newTicketData, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <select
              value={newTicketData.category}
              onChange={(e) => setNewTicketData({ ...newTicketData, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="general">General</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="feature_request">Feature Request</option>
            </select>
            <select
              value={newTicketData.priority}
              onChange={(e) => setNewTicketData({ ...newTicketData, priority: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="low">Low Priority</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <textarea
              placeholder="Describe your issue..."
              value={newTicketData.message}
              onChange={(e) => setNewTicketData({ ...newTicketData, message: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none h-20"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateTicket}
                disabled={creatingTicket}
                className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all"
              >
                {creatingTicket ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => setShowNewTicketForm(false)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="p-3 border-b border-white/40 flex gap-1 overflow-x-auto">
          {["all", "open", "in_progress", "resolved", "closed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {status === "all" ? "All" : status === "in_progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-600 text-sm">
              <div className="inline-flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin"></div>
                Loading...
              </div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-4 text-center text-slate-600 text-sm">
              <div className="text-3xl mb-2">📭</div>
              No tickets yet
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto space-y-2 p-3">
                {paginatedTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedTicket?.id === ticket.id
                        ? "bg-indigo-100 border border-indigo-300"
                        : "bg-white/50 hover:bg-white/80 border border-white/40"
                    }`}
                  >
                    <h4 className="font-bold text-sm text-slate-900 truncate">{ticket.subject}</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {new Date(ticket.last_message_at || ticket.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${getStatusColor(ticket.status)}`}>
                        {ticket.status === "in_progress" ? "In Progress" : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="border-t border-white/40 p-3 bg-white/30">
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-2 py-1 rounded text-xs border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      ← Prev
                    </button>
                    
                    <div className="flex gap-0.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-6 h-6 rounded text-xs font-semibold transition-all ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white'
                              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 rounded text-xs border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="md:col-span-2 flex flex-col bg-white/60 backdrop-blur rounded-2xl border border-white/60 overflow-hidden">
        {selectedTicket ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/40 bg-white/50">
              <h2 className="font-bold text-lg text-slate-900">{selectedTicket.subject}</h2>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status === "in_progress" ? "In Progress" : selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${getPriorityColor(selectedTicket.priority)}`}>
                  {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                </span>
                <span className="text-xs text-slate-600">
                  {selectedTicket.category.charAt(0).toUpperCase() + selectedTicket.category.slice(1)}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white/30 to-white/50">
              {messageLoading && messages.length === 0 ? (
                <div className="text-center text-slate-600 text-sm py-8">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin"></div>
                    Loading messages...
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-slate-600 text-sm py-8">
                  <div className="text-3xl mb-2">💬</div>
                  No messages yet
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-2xl ${
                        msg.sender_role === "user"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-slate-200 text-slate-900 rounded-bl-none"
                      }`}
                    >
                      {msg.sender_role !== "user" && (
                        <p className="text-xs font-bold mb-1 opacity-70">
                          {msg.sender_role.charAt(0).toUpperCase() + msg.sender_role.slice(1)}
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.sender_role === "user" ? "text-indigo-200" : "text-slate-600"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Closed Message */}
            {selectedTicket.status === "closed" && (
              <div className="p-4 bg-slate-100 border-t border-white/40">
                <p className="text-sm text-slate-700 text-center">
                  ✓ This ticket is closed. You cannot reply to closed tickets.
                </p>
                <button
                  onClick={() => setShowNewTicketForm(true)}
                  className="mt-3 w-full px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all"
                >
                  Create a new ticket
                </button>
              </div>
            )}

            {/* Message Input */}
            {selectedTicket.status !== "closed" && (
              <div className="p-4 border-t border-white/40 bg-white/50">
                {error && (
                  <div className="mb-3 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your reply..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={submittingMessage}
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:placeholder:text-slate-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={submittingMessage || !newMessage.trim()}
                    className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all"
                  >
                    {submittingMessage ? "..." : "Send"}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-slate-600">
            <div>
              <div className="text-4xl mb-2">📬</div>
              <p className="text-lg font-medium">No ticket selected</p>
              <p className="text-sm mt-1">Create or select a ticket to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
