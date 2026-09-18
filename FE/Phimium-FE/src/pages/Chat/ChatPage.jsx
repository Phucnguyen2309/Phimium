import { ChatSidebar } from './components/ChatSidebar.jsx'
import { ChatWindow } from './components/ChatWindow.jsx'
import { ChatTourInfo } from './components/ChatTourInfo.jsx'

export default function ChatPage() {
  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden">
      {/* 
        Responsive Layout Strategy:
        - Mobile: Only shows ChatWindow by default (Sidebar hidden, TourInfo accessible via a drawer or bottom sheet in a real app). For simplicity in this demo, we'll just stack or show ChatWindow.
        - Desktop: 3-column layout. 
      */}
      
      <div className="hidden md:block w-72 shrink-0 h-full">
        <ChatSidebar />
      </div>
      
      <div className="flex-1 min-w-0 h-full">
        <ChatWindow />
      </div>

      <div className="hidden lg:block w-80 shrink-0 h-full">
        <ChatTourInfo />
      </div>
    </div>
  )
}
