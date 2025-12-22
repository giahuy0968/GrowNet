import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useLocation } from 'react-router-dom'
import ChatSidebar from '../components/ChatSidebar'
import ChatWindow from '../components/ChatWindow'
import ChatInfo from '../components/ChatInfo'
import { chatService, type Chat as ChatType } from '../services'
import { useSocket } from '../contexts/SocketContext'
import '../styles/Chat.css'
import {Icon} from '../components/ui/Icon'

export default function Chat() {
  const [chats, setChats] = useState<ChatType[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [loadingChats, setLoadingChats] = useState(true)
  const [chatsError, setChatsError] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)

  const [showMobileInfo, setShowMobileInfo] = useState(false)

  const { socket } = useSocket()
  const location = useLocation()
  const preferredChatRef = useRef<string | null>(null)

  const isMobile = window.innerWidth <= 768

  const chatFromState =
    (location.state as { chatId?: string } | null)?.chatId ?? null


  useEffect(() => {
    if (chatFromState) {
      preferredChatRef.current = chatFromState
      setSelectedChatId(chatFromState)
    }
  }, [chatFromState])

  const loadChats = useCallback(async () => {
    setLoadingChats(true)
    setChatsError(null)
    try {
      const { chats: chatList } = await chatService.getAllChats()
      setChats(chatList)

      setSelectedChatId(prev => {
        const preferred = preferredChatRef.current
        if (preferred && chatList.some(c => c._id === preferred)) {
          preferredChatRef.current = null
          return preferred
        }
        if (prev && chatList.some(c => c._id === prev)) {
          return prev
        }
        return chatList[0]?._id ?? null
      })
    } catch (error: any) {
      setChatsError(error?.message || 'Không thể tải danh sách trò chuyện')
    } finally {
      setLoadingChats(false)
    }
  }, [])

  useEffect(() => {
    loadChats()
  }, [loadChats])

  useEffect(() => {
    if (!socket) return

    const handleRefresh = () => loadChats()

    socket.on('message:new', handleRefresh)
    socket.on('chat:updated', handleRefresh)

    return () => {
      socket.off('message:new', handleRefresh)
      socket.off('chat:updated', handleRefresh)
    }
  }, [socket, loadChats])

  const selectedChat = useMemo(
  () => chats.find(c => c._id === selectedChatId) || null,
  [chats, selectedChatId]
)

  useEffect(() => {
    setShowMobileInfo(false)
  }, [selectedChatId])

  return (
    <div className={isMobile ? 'chat-mobile-container' : 'chat-layout'}>
      {/* ========== DESKTOP: 3 COLUMNS ========== */}
      {!isMobile && (
        <>
          <ChatSidebar
            chats={chats}
            loading={loadingChats}
            error={chatsError}
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
            onRefresh={loadChats}
          />

          <ChatWindow
            chat={selectedChat}
            showSearch={showSearch}
            onChatUpdated={loadChats}
          />

          <ChatInfo
            chat={selectedChat}
            onOpenSearch={() => setShowSearch(prev => !prev)}
          />
        </>
      )}

      {/* ========== MOBILE: STACK LOGIC ========== */}
      {isMobile && (
        <div className="chat-mobile-wrapper">
          {/* 1. HIỂN THỊ DANH SÁCH (SIDEBAR) */}
          {!selectedChatId && (
            <ChatSidebar
              chats={chats}
              loading={loadingChats}
              error={chatsError}
              selectedChatId={selectedChatId}
              onSelectChat={setSelectedChatId}
              onRefresh={loadChats}
            />
          )}

          {/* 2. HIỂN THỊ CỬA SỔ CHAT */}
          {selectedChatId && !showMobileInfo && (
            <ChatWindow
              chat={selectedChat}
              showSearch={showSearch}
              onChatUpdated={loadChats}
              onBack={() => setSelectedChatId(null)} // Quay về danh sách
              onShowInfo={() => setShowMobileInfo(true)} // Mở Info
            />
          )}

          {/* 3. HIỂN THỊ THÔNG TIN (INFO) */}
          {selectedChatId && showMobileInfo && (
            <div className="mobile-info-view">
              <div className="mobile-info-header-bar">
                <button className="back-btn" onClick={() => setShowMobileInfo(false)}>
                  <Icon name="arrow-left" size="md" /> Quay lại
                </button>
              </div>
              <ChatInfo 
                chat={selectedChat} 
                onOpenSearch={() => {
                  setShowSearch(true);
                  setShowMobileInfo(false);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
