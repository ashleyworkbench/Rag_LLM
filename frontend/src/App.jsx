import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import ReferencePanel from './components/ReferencePanel'
import Toast from './components/Toast'

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f0f13]">
      <Sidebar />
      <ChatWindow />
      <ReferencePanel />
      <Toast />
    </div>
  )
}
