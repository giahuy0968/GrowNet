import React, { useState } from 'react'
import ChatSidebar from '../components/ChatSidebar'
import ChatWindow from '../components/ChatWindow'
import ChatInfo from '../components/ChatInfo'
import '../styles/Chat.css'

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState<string | null>('Trần Văn B')

  return (
    <div className="chat-layout">
      <ChatSidebar 
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
      />
      
      <ChatWindow chatName={selectedChat} />
      
      <ChatInfo chatName={selectedChat} />
    </div>
  )
}
