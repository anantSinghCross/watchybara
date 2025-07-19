import { useEffect, useState } from "react"
import { type PlasmoCSConfig } from "~node_modules/plasmo/dist/type"
import { io, Socket } from "socket.io-client"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
}

const SIDEBAR_WIDTH = 200; // 96 * 4px (tailwind w-96)
const SERVER_URL = "https://google-meet-clone-server.onrender.com/"

const WatchybaraSidebar = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Connect to the signaling server
    const s = io(SERVER_URL);
    setSocket(s);

    s.on("connect", () => {
      console.log("Connected to signaling server", s.id);
    });
    s.on("disconnect", () => {
      console.log("Disconnected from signaling server");
    });
    // Add more event listeners as needed

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        color:"gray",
        position: "absolute",
        height: "100svh",
        width: `${screenWidth-15}px`,
        zIndex: 9999,
        boxSizing: "border-box"
      }}
    >
      <div
        className=" p-2"
        style={{
          padding: "15px",
          borderRadius: "10px 0 0 10px",
          backgroundColor: "#000000",
          width: `${SIDEBAR_WIDTH}px`,
          position: "absolute",
          top: "0px",
          right: "0px",
          height: "100svh"
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>📺 Watchybara</h2>
        <p style={{ fontSize: "0.875rem" }}>You're now in a video call</p>
        {/* Video or WebRTC component goes here */}
      </div>
    </div>
  );
};

const SidebarContent = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === "SHOW_WATCHYBARA_MAIN_WIDGET") {
        setShowSidebar(true);
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  useEffect(() => {
    if (showSidebar) {
      // Shift page content to the left
      document.body.style.transition = "margin-right 0.3s";
      document.body.style.marginRight = `${SIDEBAR_WIDTH + 15+ 15}px`;
    } else {
      // Restore page content
      document.body.style.marginRight = "";
    }
    // Clean up on unmount
    return () => {
      document.body.style.marginRight = "";
    };
  }, [showSidebar]);

  return showSidebar ? <WatchybaraSidebar /> : null;
};

export default SidebarContent