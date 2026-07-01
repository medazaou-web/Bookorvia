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
  user_id: string;
  created_at: string;
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

export default function AdminSupportPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [newMessage, setNewMessage] = useState("");
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [ticketUsers, setTicketUsers] = useState<Record<string, any>>({});
  const [updatingTicket, setUpdatingTicket] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser && profile) {
      loadTickets();
    }
  }, [currentUser, profile]);

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

      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!prof || !["admin", "support", "support_manager"].includes(prof.role)) {
        router.push("/dashboard");
        return;
      }

      setProfile(prof);
      setLoading(false);
    } catch (e) {
      console.error("Auth error:", e);
      router.push("/login");
    }
  }

  async function loadTickets() {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (error) throw error;

      setTickets(data ?? []);

      const userIds = [...new Set((data ?? []).map((t) => t.user_id))];
      if (userIds.length > 0) {
        const users: Record<string, any> = {};
        for (const userId of userIds) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("id", userId)
            .single();
          if (prof) {
            users[userId] = prof;
          }
        }
        setTicketUsers(users);
      }

      if (data && data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
    } catch (e) {
      console.error("Error loading tickets:", e);
    }
  }

  async function loadMessages() {
    if (!selectedTicket) return;
    
    // Show loading only on initial load
    if (messages.length === 0 && !initialLoadComplete) {
      setMessageLoading(true);
    }
    
    try {
      const { data, error } = await supabase
        .from("support_ticket_messages")
        .select("*")
        .eq("ticket_id", selectedTicket.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data ?? []);
      setInitialLoadComplete(true);
    } catch (e) {
      console.error("Error loading messages:", e);
    } finally {
      setMessageLoading(false);
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedTicket) return;

    setSubmittingMessage(true);
    try {
      const now = new Date().toISOString();
      const { error: messageErr } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: selectedTicket.id,
          sender_id: currentUser.id,
          sender_role: profile.role,
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
    } catch (e) {
      console.error("Error sending message:", e);
    } finally {
      setSubmittingMessage(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!selectedTicket) return;
    setUpdatingTicket(true);
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", selectedTicket.id);

      if (error) throw error;

      setSelectedTicket({ ...selectedTicket, status: newStatus });
      await loadTickets();
    } catch (e) {
      console.error("Error updating status:", e);
    } finally {
      setUpdatingTicket(false);
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const statusMatch = statusFilter === "all" || ticket.status === statusFilter;
    const priorityMatch = priorityFilter === "all" || ticket.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-900";
      case "high":
        return "bg-amber-100 text-amber-900";
      case "normal":
        return "bg-blue-100 text-blue-900";
      case "low":
        return "bg-slate-100 text-slate-900";
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-indigo-600 animate-spin"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Support Tickets</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Chat-based support ticket management</p>

      <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-300px)] overflow-hidden">
        {/* Tickets Sidebar */}
        <div className="md:col-span-1 flex flex-col bg-white/60 dark:bg-slate-900/40 backdrop-blur rounded-2xl border border-white/60 dark:border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/40 dark:border-white/10">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">Filters</h3>
            <div className="space-y-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-4 text-center text-slate-600 dark:text-slate-400 text-sm">
                <div className="text-3xl mb-2">📭</div>
                No tickets
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {filteredTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedTicket?.id === ticket.id
                        ? "bg-indigo-100 border border-indigo-300"
                        : "bg-white/50 hover:bg-white/80 border border-white/40"
                    }`}
                  >
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{ticket.subject}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {ticketUsers[ticket.user_id]?.full_name || "Unknown"}
                    </p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${getStatusColor(ticket.status)}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 flex flex-col bg-white/60 dark:bg-slate-900/40 backdrop-blur rounded-2xl border border-white/60 dark:border-white/10 overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-white/40 dark:border-white/10 bg-white/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1">
                    <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">{selectedTicket.subject}</h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {ticketUsers[selectedTicket.user_id]?.full_name || "Unknown User"}
                    </p>
                  </div>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingTicket}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status.toUpperCase()}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority.toUpperCase()}
                  </span>
                  <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-bold">
                    {selectedTicket.category}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white/30 to-white/50 dark:from-slate-800/10 dark:to-slate-800/20">
                {messageLoading && messages.length === 0 ? (
                  <div className="text-center text-slate-600 dark:text-slate-400 text-sm py-8">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-indigo-600 animate-spin"></div>
                      Loading...
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-slate-600 dark:text-slate-400 text-sm py-8">
                    <div className="text-3xl mb-2">💬</div>
                    No messages
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_role === "user" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-2xl ${
                          msg.sender_role === "user"
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none"
                            : "bg-indigo-600 dark:bg-indigo-600 text-white rounded-br-none"
                        }`}
                      >
                        {msg.sender_role !== "user" && (
                          <p className="text-xs font-bold mb-1 opacity-70">
                            {msg.sender_role.charAt(0).toUpperCase() + msg.sender_role.slice(1)}
                          </p>
                        )}
                        <p className="text-sm break-words">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.sender_role === "user" ? "text-slate-600 dark:text-slate-400" : "text-indigo-200 dark:text-indigo-300"}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {selectedTicket.status !== "closed" && (
                <div className="p-4 border-t border-white/40 dark:border-white/10 bg-white/50 dark:bg-slate-800/50">
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
                      className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:placeholder:text-slate-400 dark:disabled:placeholder:text-slate-600"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={submittingMessage || !newMessage.trim()}
                      className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {selectedTicket.status === "closed" && (
                <div className="p-4 border-t border-white/40 dark:border-white/10 bg-slate-100 dark:bg-slate-800 text-center text-sm text-slate-700 dark:text-slate-300 font-medium">
                  ✓ Closed ticket - replies disabled
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-slate-600 dark:text-slate-400">
              <div>
                <div className="text-4xl mb-2">📬</div>
                <p className="text-lg font-medium">No ticket selected</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
