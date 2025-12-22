import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { chatService, meetingService, type Chat, type Meeting, type Message } from '../services';
import '../styles/ChatWindow.css';
import { Icon } from './ui/Icon';
import ScheduleMeetingModal from './ScheduleMeetingModal';

interface ChatWindowProps {
  chat: Chat | null;
  showSearch?: boolean;
  onChatUpdated?: () => void;
  onBack?: () => void;
  onShowInfo?: () => void;
}

export default function ChatWindow({ chat, showSearch = false, onChatUpdated, onBack, onShowInfo }: ChatWindowProps) {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [meetingError, setMeetingError] = useState<string | null>(null);
  const { user } = useAuth();
  const { socket } = useSocket();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!chat?._id) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    chatService.getMessages(chat._id)
      .then(({ messages }) => {
        if (isMounted) {
          setMessages(messages);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err?.message || 'Không thể tải tin nhắn');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [chat?._id]);

  useEffect(() => {
    if (!socket || !chat?._id) return;

    socket.emit('chat:join', chat._id);

    const handleIncomingMessage = (payload: Message & { chatId?: string }) => {
      if (payload.chatId && payload.chatId !== chat._id) return;
      setMessages(prev => {
        if (prev.some(existing => existing._id === payload._id)) {
          return prev;
        }
        return [...prev, payload];
      });
    };

    socket.on('message:new', handleIncomingMessage);

    return () => {
      socket.off('message:new', handleIncomingMessage);
    };
  }, [socket, chat?._id]);

  const resolveUserId = (entity: any) => {
    if (!entity) return undefined;
    if (typeof entity === 'string') return entity;
    return entity._id || entity.id;
  };

  const loadMeetings = useCallback(async () => {
    if (!chat?._id) {
      setMeetings([]);
      return;
    }
    setMeetingLoading(true);
    setMeetingError(null);
    try {
      const { meetings: meetingList } = await meetingService.listByChat(chat._id);
      setMeetings(meetingList);
    } catch (err: any) {
      setMeetingError(err?.message || 'Không thể tải lịch hẹn');
    } finally {
      setMeetingLoading(false);
    }
  }, [chat?._id]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const broadcastMessage = useCallback((message: Message, chatId: string) => {
    socket?.emit('message:send', { ...message, chatId });
  }, [socket]);

  const filteredMessages = useMemo(() => {
    if (!showSearch || !searchTerm.trim()) return messages;
    const normalized = searchTerm.toLowerCase();
    return messages.filter(msg => msg.content?.toLowerCase().includes(normalized));
  }, [messages, searchTerm, showSearch]);

  const activeParticipant = useMemo(() => {
    if (!chat?.participants) return null;
    return chat.participants.find(participant => resolveUserId(participant) !== user?._id) || chat.participants[0];
  }, [chat?.participants, user?._id]);

  const participantName = typeof activeParticipant === 'string'
    ? activeParticipant
    : activeParticipant?.fullName || activeParticipant?.username || 'Người dùng';

  const participantAvatar = typeof activeParticipant === 'string'
    ? undefined
    : activeParticipant?.avatar;

  const handleSend = async () => {
    if (!chat?._id || !messageText.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const newMessage = await chatService.sendMessage(chat._id, { content: messageText.trim() });
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      broadcastMessage(newMessage, chat._id);
      onChatUpdated?.();
    } catch (err: any) {
      setError(err?.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleUploadButton = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleAttachmentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!chat?._id) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (messageText.trim()) {
        formData.append('caption', messageText.trim());
      }

      const newMessage = await chatService.uploadAttachment(chat._id, formData);
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      broadcastMessage(newMessage, chat._id);
      onChatUpdated?.();
    } catch (err: any) {
      setError(err?.message || 'Không thể tải tệp');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleInstantMeeting = async () => {
    if (!chat?._id || videoLoading) return;
    setVideoLoading(true);
    setError(null);
    try {
      const meeting = await meetingService.createInstant(chat._id);
      setMeetings(prev => [meeting, ...prev]);
      if (meeting.videoLink) {
        window.open(meeting.videoLink, '_blank', 'noopener');
      }
      if (meeting.videoLink) {
        const linkMessage = await chatService.sendMessage(chat._id, {
          content: ` Bắt đầu cuộc gọi: ${meeting.videoLink}`
        });
        setMessages(prev => [...prev, linkMessage]);
        broadcastMessage(linkMessage, chat._id);
      }
      onChatUpdated?.();
    } catch (err: any) {
      setError(err?.message || 'Không thể khởi tạo cuộc gọi');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleMeetingCreated = async (meeting: Meeting) => {
    setMeetings(prev => [meeting, ...prev]);
    if (!chat?._id) return;
    try {
      const start = format(new Date(meeting.startTime), 'HH:mm dd/MM', { locale: vi });
      const note = ` ${meeting.title} - ${start}${meeting.videoLink ? ` | ${meeting.videoLink}` : ''}`;
      const infoMessage = await chatService.sendMessage(chat._id, { content: note });
      setMessages(prev => [...prev, infoMessage]);
      broadcastMessage(infoMessage, chat._id);
    } catch (err) {
      console.error(err);
    }
  };

  const formatFileSize = (size?: number) => {
    if (!size) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = size;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
      value /= 1024;
      unit += 1;
    }
    return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
  };

  const meetingsSorted = useMemo(() => (
    [...meetings].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  ), [meetings]);

  const upcomingMeeting = useMemo(() => {
    const now = Date.now();
    return meetingsSorted.find(meeting => new Date(meeting.endTime).getTime() > now) || null;
  }, [meetingsSorted]);

  const participantsForMeeting = useMemo(() => (
    (chat?.participants ?? [])
      .map(participant => {
        if (typeof participant === 'string') {
          return null;
        }
        return {
          id: participant._id,
          email: participant.email,
          name: participant.fullName || participant.username || participant.email
        };
      })
      .filter(Boolean) as { id: string; email?: string; name?: string }[]
  ), [chat?.participants]);

  if (!chat) {
    return (
      <div className="chat-window empty">
        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          {onBack && (
            <button className="mobile-back-btn" onClick={onBack} aria-label="Quay lại">
               <Icon name="arrow-left" size="md" /> 
            </button>
          )}

          <img src={participantAvatar || '/user_avt.png'} alt={participantName} className="chat-avatar" onClick={onShowInfo} style={{ cursor: 'pointer' }}/>
          <div onClick={onShowInfo} style={{ cursor: onShowInfo ? 'pointer' : 'default' }}>
            <h3>{participantName}</h3>
            <span className="last-seen">
              Cập nhật lần cuối {chat.updatedAt ? format(new Date(chat.updatedAt), 'HH:mm dd/MM', { locale: vi }) : 'N/A'}
            </span>
          </div>
        </div>
        <div className="chat-actions">
          <button
            className="icon-btn"
            aria-label="Bắt đầu cuộc gọi video"
            onClick={handleInstantMeeting}
            disabled={videoLoading}
          >
            <Icon name="phone" size="md" aria-hidden />
          </button>
          <button
            className="icon-btn"
            aria-label="Đặt lịch hẹn"
            onClick={() => setScheduleOpen(true)}
          >
            <Icon name="calendar" size="md" aria-hidden />
          </button>
          {!showSearch && (
            <button className="icon-btn" aria-label="Tìm kiếm">
              <Icon name="search" size="md" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {meetingLoading && (
        <div className="meeting-banner" role="status">Đang đồng bộ lịch Google</div>
      )}
      {meetingError && (
        <div className="meeting-banner error">{meetingError}</div>
      )}
      {!meetingLoading && !meetingError && upcomingMeeting && (
        <div className="meeting-banner">
          <div>
            <p>Cuộc hẹn sắp tới</p>
            <strong>{upcomingMeeting.title}</strong>
            <span>{format(new Date(upcomingMeeting.startTime), 'HH:mm dd/MM', { locale: vi })}</span>
          </div>
          <button
            type="button"
            className="join-btn"
            onClick={() => upcomingMeeting.videoLink && window.open(upcomingMeeting.videoLink, '_blank', 'noopener')}
            disabled={!upcomingMeeting.videoLink}
          >
            Tham gia
          </button>
        </div>
      )}

      {showSearch && (
        <div className="chat-search-bar" role="search" aria-label="Tìm kiếm tin nhắn">
          <input
            type="text"
            placeholder="Tìm kiếm tin nhắn trong cuộc hội thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <div className="messages-container">
        {loading && <p className="helper-text">Đang tải tin nhắn...</p>}
        {error && <p className="helper-text error">{error}</p>}
        {!loading && !error && filteredMessages.length === 0 && (
          <p className="helper-text">Chưa có tin nhắn nào trong cuộc trò chuyện này</p>
        )}

        {filteredMessages.map(message => {
          const senderId = resolveUserId(message.senderId);
          const isOwnMessage = senderId?.toString() === user?._id?.toString();
          const timestamp = message.createdAt
            ? format(new Date(message.createdAt), 'HH:mm', { locale: vi })
            : '';

          return (
            <div
              key={message._id}
              className={`message ${isOwnMessage ? 'sent' : 'received'}`}
            >
              {!isOwnMessage && (
                <img src={participantAvatar || '/user_avt.png'} alt="" className="message-avatar" />
              )}
              <div className="message-bubble">
                {message.type === 'image' && message.fileUrl && (
                  <img src={message.fileUrl} alt={message.fileName || 'Hình ảnh'} className="message-image" />
                )}
                {message.type === 'file' && message.fileUrl && (
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="file-bubble"
                  >
                    <Icon name="attach" size="sm" aria-hidden />
                    <div>
                      <div className="file-title">{message.fileName || message.content}</div>
                      <div className="file-meta">{formatFileSize(message.fileSize)}</div>
                    </div>
                  </a>
                )}
                {message.type === 'text' && (
                  <p>{message.content}</p>
                )}
                {message.type !== 'text' && message.content && (
                  <p className="message-caption">{message.content}</p>
                )}
                <span className="message-time">{timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-input-container">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleAttachmentUpload}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*"
        />
        <button className="icon-btn" aria-label="Đính kèm" onClick={handleUploadButton} disabled={uploading}>
          <Icon name="attach" size="md" aria-hidden />
        </button>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="icon-btn" aria-label="Ghi chú" disabled>
          <Icon name="edit" size="md" aria-hidden />
        </button>
        <button className="send-btn" onClick={handleSend} aria-label="Gửi" disabled={sending || uploading}>
          <Icon name="send" size="md" aria-hidden />
        </button>
      </div>

      {chat?._id && (
        <ScheduleMeetingModal
          open={scheduleOpen}
          onClose={() => setScheduleOpen(false)}
          chatId={chat._id}
          participants={participantsForMeeting}
          onCreated={handleMeetingCreated}
        />
      )}
    </div>
  );
}
