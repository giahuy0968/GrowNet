import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ChatSidebar from '../components/ChatSidebar'
import ChatWindow from '../components/ChatWindow'
import ChatInfo from '../components/ChatInfo'
import { chatService, type Chat as ChatType } from '../services'
import { useSocket } from '../contexts/SocketContext'
import '../styles/Chat.css'

export default function Chat() {
  const [chats, setChats] = useState<ChatType[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [loadingChats, setLoadingChats] = useState(true)
  const [chatsError, setChatsError] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const { socket } = useSocket()

  const loadChats = useCallback(async () => {
    setLoadingChats(true)
    setChatsError(null)
    try {
      const { chats: chatList } = await chatService.getAllChats()
      setChats(chatList)
      setSelectedChatId(prev => {
        if (prev && chatList.some(chat => chat._id === prev)) {
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

    const handleRefresh = () => {
      loadChats()
    }

    socket.on('message:new', handleRefresh)
    socket.on('chat:updated', handleRefresh)

    return () => {
      socket.off('message:new', handleRefresh)
      socket.off('chat:updated', handleRefresh)
    }
  }, [socket, loadChats])

  const selectedChat = useMemo(() => {
    if (!selectedChatId) return null
    return chats.find(chat => chat._id === selectedChatId) ?? null
  }, [chats, selectedChatId])

  return (
    <div className="chat-layout">
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
    </div>
  )
}
