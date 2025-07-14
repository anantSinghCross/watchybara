import { useEffect, useState } from "react"
import { type PlasmoCSConfig } from "~node_modules/plasmo/dist/type"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
}

const WatchybaraMain = () => {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] bg-white shadow-lg rounded-2xl p-4 w-96">
      <h2 className="text-xl font-bold">🦙 SnugLlama</h2>
      <p className="text-sm">You're now in a video call</p>
      {/* Video or WebRTC component goes here */}
  </div>
  )
}

const SidebarContent = () => {
  const [showMainWidget, setShowMainWidget] = useState(false);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message) => {
      if(message.type === "SHOW_WATCHYBARA_MAIN_WIDGET"){
        setShowMainWidget(true);
      }
    })
  }, [])

  return showMainWidget ? <WatchybaraMain/> : null
}

export default SidebarContent