import React, { useState } from 'react'
import ChatSidebar from '../components/ChatSidebar'
import ChatWindow from '../components/ChatWindow'
import ChatInfo from '../components/ChatInfo'
import '../styles/Chat.css'

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState<string | null>('Trần Văn B')
  const [selectedRole, setSelectedRole] = useState<'mentor' | 'mentee'>('mentee')
  const [showSearch, setShowSearch] = useState(false)

  return (
    <div className="chat-layout">
      <ChatSidebar
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
      />

      <ChatWindow chatName={selectedChat} showSearch={showSearch} />

      <ChatInfo chatName={selectedChat} role={selectedRole} onOpenSearch={() => setShowSearch(prev => !prev)} />
    </div>
  )
}
