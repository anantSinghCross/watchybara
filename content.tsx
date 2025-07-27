import cssText from "data-text:~style.css"
import { useEffect, useRef, useState } from "react"
import {
  IoCopyOutline,
  IoMicOffOutline,
  IoMicOutline,
  IoSend,
  IoVideocamOffOutline,
  IoVideocamOutline
} from "react-icons/io5"
import Peer from "simple-peer"
import { io, Socket } from "socket.io-client"

import { type PlasmoCSConfig } from "~node_modules/plasmo/dist/type"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

interface Call {
  isReceivingCall: boolean
  from: string
  friendName: string
  signal: object | null
}

interface Chat {
  from: string
  text: string
}

const SIDEBAR_WIDTH = 250 // 96 * 4px (tailwind w-96)
const SERVER_URL = "https://google-meet-clone-server.onrender.com/"

const WatchybaraSidebar = () => {
  const peer = useRef(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [mySocketId, setMySocketId] = useState<string | null>("")
  const [friendSocketId, setFriendSocketId] = useState<string | null>("")
  const [isCopied, setIsCopied] = useState(false)
  const [stream, setStream] = useState(null)
  const [myName, setMyName] = useState("")
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [call, setCall] = useState<Call>({
    isReceivingCall: false,
    from: "",
    friendName: "",
    signal: null
  })
  const myVideo = useRef(null)
  const myFriendsVideo = useRef(null)
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState<Array<Chat>>([])
  // Remove: const [dataChannel, setDataChannel] = useState(null)
  const chatEndRef = useRef(null)
  const [videoPresent, setVideoPresent] = useState(false)

  // Add a flag to prevent feedback loop on remote seek
  let isRemoteSeek = false

  // Video synchronization functions
  const getVideoInfo = () => {
    // Netflix
    const netflixVideo = document.querySelector("video") as HTMLVideoElement
    if (netflixVideo) {
      return {
        currentTime: netflixVideo.currentTime,
        duration: netflixVideo.duration,
        paused: netflixVideo.paused,
        playbackRate: netflixVideo.playbackRate,
        platform: "netflix"
      }
    }

    // Prime Video
    const primeVideo = document.querySelector(
      ".webPlayerElement video"
    ) as HTMLVideoElement
    if (primeVideo) {
      return {
        currentTime: primeVideo.currentTime,
        duration: primeVideo.duration,
        paused: primeVideo.paused,
        playbackRate: primeVideo.playbackRate,
        platform: "prime"
      }
    }

    return null
  }

  const controlVideo = (action, data) => {
    const video = (document.querySelector("video") ||
      document.querySelector(".webPlayerElement video")) as HTMLVideoElement
    if (!video) return

    switch (action) {
      case "play":
        video.play()
        break
      case "pause":
        video.pause()
        break
      case "seek":
        if (Math.abs(video.currentTime - data.time) > 0.5) {
          isRemoteSeek = true
          video.currentTime = data.time
        }
        break
      case "setPlaybackRate":
        video.playbackRate = data.rate
        break
    }
  }

  const sendVideoCommand = (command: string, data?: object) => {
    if (peer.current) {
      peer.current.send(
        JSON.stringify({
          type: "video-control",
          command,
          data,
          timestamp: Date.now()
        })
      )
    }
  }

  const setupVideoMonitoring = () => {
    const video = document.querySelector("video") as HTMLVideoElement
    if (!video) {
      setVideoPresent(false)
      return
    }
    setVideoPresent(true)
    video.addEventListener(
      "play",
      () => {
        sendVideoCommand("play")
      },
      { passive: true }
    )

    video.addEventListener(
      "pause",
      () => {
        sendVideoCommand("pause")
      },
      { passive: true }
    )

    video.addEventListener(
      "seeked",
      () => {
        if (isRemoteSeek) {
          isRemoteSeek = false
          return // Don't send a sync if this was a remote-triggered seek
        }
        sendVideoCommand("seek", { time: video.currentTime })
      },
      { passive: true }
    )
  }

  // Effects
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Connect to the signaling server
    const s = io(SERVER_URL)
    setSocket(s)

    s.on("me", () => {
      console.log("Connected to signaling server", s.id)
      setMySocketId(s.id)
    })
    s.on("disconnect", () => {
      console.log("Disconnected from signaling server")
    })
    s.on("callUser", ({ from, name: friendName, signal }) => {
      setCall({ isReceivingCall: true, from, friendName, signal })
    })
    s.on("callAccepted", ({ signal, to, receiverName }) => {
      setCallAccepted(true)
      setCall({
        isReceivingCall: false,
        from: to,
        friendName: receiverName,
        signal
      })
      peer.current.signal(signal)
    })

    return () => {
      s.disconnect()
    }
  }, [])

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream)
        myVideo.current.srcObject = currentStream
      })
    return () => {}
  }, [])

  useEffect(() => {
    if (!socket) return
    // Remove socket.io chatMessage handler
    return () => {}
  }, [socket])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages])

  useEffect(() => {
    // Setup video monitoring when component mounts
    setupVideoMonitoring()

    // Use MutationObserver to detect when video elements are added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && (node as Element).querySelector) {
            const video = (node as Element).querySelector("video")
            if (video) {
              setupVideoMonitoring()
            }
          }
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => observer.disconnect()
  }, [])

  // Handlers
  const callFriend = (friendSocketId: string) => {
    const newPeer = new Peer({ initiator: true, trickle: false, stream })
    // Set up data channel for chat
    newPeer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: friendSocketId,
        signalData: data,
        from: mySocketId,
        name: myName
      })
    })
    newPeer.on("stream", (friendsStream) => {
      myFriendsVideo.current.srcObject = friendsStream
    })
    newPeer.on("data", (data) => {
      try {
        const message = JSON.parse(data.toString())
        if (message.type === "video-control") {
          controlVideo(message.command, message.data)
        } else {
          // Handle chat messages
          setChatMessages((prev) => [
            ...prev,
            { from: friendSocketId, text: data.toString() }
          ])
        }
      } catch (e) {
        // Handle plain text chat messages
        setChatMessages((prev) => [
          ...prev,
          { from: friendSocketId, text: data.toString() }
        ])
      }
    })
    peer.current = newPeer
  }

  const answerCall = () => {
    setCallAccepted(true)
    setCall((prevState) => ({
      isReceivingCall: false,
      from: prevState.from,
      friendName: prevState.friendName,
      signal: prevState.signal
    }))
    const newPeer = new Peer({ initiator: false, trickle: false, stream })
    newPeer.on("signal", (data) =>
      socket.emit("answerCall", {
        signal: data,
        to: call.from,
        receiverName: myName
      })
    )
    newPeer.on("stream", (friendsStream) => {
      myFriendsVideo.current.srcObject = friendsStream
    })
    newPeer.on("data", (data) => {
      try {
        const message = JSON.parse(data.toString())
        if (message.type === "video-control") {
          controlVideo(message.command, message.data)
        } else {
          // Handle chat messages
          setChatMessages((prev) => [
            ...prev,
            { from: call.from, text: data.toString() }
          ])
        }
      } catch (e) {
        // Handle plain text chat messages
        setChatMessages((prev) => [
          ...prev,
          { from: call.from, text: data.toString() }
        ])
      }
    })
    newPeer.signal(call.signal)
    peer.current = newPeer
  }

  const leaveCall = () => {
    setCallEnded(true)
    peer.current.destroy()
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mySocketId)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2500)
  }

  const handleMute = () => {
    setIsMuted((prev) => {
      if (stream) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = prev // If currently muted, enable; if unmuted, disable
        })
      }
      return !prev
    })
  }

  const handleVideoToggle = () => {
    setIsVideoOff((prev) => {
      if (stream) {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = prev // If currently video off, enable; if on, disable
        })
      }
      return !prev
    })
  }

  const sendMessage = () => {
    if (chatInput.trim() && peer.current) {
      peer.current.send(chatInput)
      setChatMessages((prev) => [
        ...prev,
        { from: mySocketId, text: chatInput }
      ])
      setChatInput("")
    }
  }

  // Add a button to sync current times
  const handleSyncNow = () => {
    const video = document.querySelector("video") as HTMLVideoElement
    if (video) {
      sendVideoCommand("seek", { time: video.currentTime })
    }
  }

  return (
    <div
      className=" text-gray-400"
      style={{
        pointerEvents: "none",
        position: "absolute",
        height: "100svh",
        width: `${screenWidth - 15}px`,
        zIndex: 9999,
        boxSizing: "border-box"
      }}>
      <div
        className="flex flex-col justify-between gap-2"
        style={{
          pointerEvents: "auto",
          padding: "15px",
          borderRadius: "10px 0 0 10px",
          backgroundColor: "#000000",
          width: `${SIDEBAR_WIDTH}px`,
          position: "absolute",
          top: "0px",
          right: "0px",
          height: "100svh"
        }}>
        <div className="flex flex-col gap-2">
          <div className="">
            <div className="flex flex-col text-xs">
              <div className="flex justify-between p-1">
                <p>WatchID</p>
                {isCopied && <p className=" animate-pulse">Copied!</p>}
              </div>
              <div className="flex items-center">
                <span className="font-mono w-full text-white p-1 rounded bg-gray-800 ">
                  {mySocketId ? (
                    mySocketId
                  ) : (
                    <p className=" animate-pulse">...</p>
                  )}
                </span>
                <p className="text-gray-400 p-1 pl-2" onClick={handleCopy}>
                  <IoCopyOutline size={15} />
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs">
            Share your WatchID with the person you want to start the video call
            with.
          </p>
          <input
            className="p-1 rounded text-blue-400 font-mono text-xs bg-gray-800 border border-gray-600 focus:outline-none"
            placeholder="Your Name..."
            type="text"
            onChange={(e) => setMyName(e.target.value)}
          />
          <input
            className="p-1 rounded text-blue-400 font-mono text-xs bg-gray-800 border border-gray-600 focus:outline-none"
            placeholder="Friend's WatchID here..."
            type="text"
            onChange={(e) => setFriendSocketId(e.target.value)}
          />
          <button
            disabled={friendSocketId === ""}
            className="rounded p-1 bg-gradient-to-tr from-blue-500 to-indigo-500 text-white hover:to-indigo-600 hover:from-blue-600 shadow-xl shadow-blue-500/50 hover:shadow-blue-500/30 disabled:from-gray-500 disabled:to-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
            onClick={() => callFriend(friendSocketId)}>
            Invite
          </button>
          <div className="relative group">
            <video
              className="rounded-xl aspect-auto w-full -scale-x-100"
              ref={myVideo}
              muted
              autoPlay
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-xl">
                <span className="text-white text-lg font-bold">
                  {myName || "You"}
                </span>
              </div>
            )}
            {isMuted && (
              <p className="text-white text-xs absolute top-0 left-0 p-1 m-2 rounded-md bg-blue-500 opacity-70">
                <IoMicOffOutline size={15} />
              </p>
            )}
            <div className="absolute flex gap-2 invisible right-0 bottom-0 m-2">
              <button
                className="group-hover:visible text-white p-1 bg-blue-500 hover:bg-blue-600 rounded-full shadow"
                onClick={handleVideoToggle}>
                {isVideoOff ? (
                  <IoVideocamOutline size={15} />
                ) : (
                  <IoVideocamOffOutline size={15} />
                )}
              </button>
              <button
                className="group-hover:visible text-white p-1 bg-blue-500 hover:bg-blue-600 rounded-full shadow"
                onClick={handleMute}>
                {isMuted ? (
                  <IoMicOutline size={15} />
                ) : (
                  <IoMicOffOutline size={15} />
                )}
              </button>
            </div>
          </div>
          <video
            className="rounded-xl aspect-auto w-full -scale-x-100"
            ref={myFriendsVideo}
            autoPlay
          />
          {call?.isReceivingCall && (
            <div className="flex flex-col gap-2 text-xs rounded-lg bg-gray-500/50 p-2">
              <p>{call?.friendName} is inviting you to join a video call</p>
              <button
                className="px-2 py-1 self-end bg-blue-600 hover:bg-blue-700 text-white rounded"
                onClick={answerCall}>
                Accept
              </button>
            </div>
          )}
          {callAccepted && !callEnded && videoPresent && (
            <button
              className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white self-end"
              onClick={handleSyncNow}>
              Sync Now
            </button>
          )}
          {callAccepted && !callEnded && (
            <button
              className="text-xs px-2 py-1 self-end bg-red-600 hover:bg-red-700 text-white rounded"
              onClick={leaveCall}>
              Leave
            </button>
          )}
        </div>
        {/* Chat area at the bottom */}
        <div className="bg-gray-900 rounded-lg p-2 mt-2">
          <div
            className={`flex flex-col max-h-48 overflow-y-auto ${chatMessages?.length > 0 ? "mb-1" : ""}`}
            style={{ scrollbarGutter: "stable" }}>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.from === mySocketId
                    ? "text-blue-400 text-xs mb-1 self-start"
                    : "text-white text-xs mb-1 self-end"
                }>
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-1">
            <input
              disabled={!peer.current}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage()
              }}
              placeholder="Type a message..."
              className="flex-1 rounded border border-gray-700 bg-gray-800 text-white p-1 text-xs focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white rounded p-1 text-xs disabled:bg-gray-600"
              disabled={!chatInput.trim() || !peer.current}>
              <IoSend size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const SidebarContent = () => {
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === "SHOW_WATCHYBARA_MAIN_WIDGET") {
        setShowSidebar(true)
      }
    }
    chrome.runtime.onMessage.addListener(handleMessage)
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  useEffect(() => {
    if (showSidebar) {
      // Shift page content to the left
      document.body.style.transition = "margin-right 0.3s"
      document.body.style.marginRight = `${SIDEBAR_WIDTH + 15 + 15}px`
    } else {
      // Restore page content
      document.body.style.marginRight = ""
    }
    // Clean up on unmount
    return () => {
      document.body.style.marginRight = ""
    }
  }, [showSidebar])

  return showSidebar ? <WatchybaraSidebar /> : null
}

export default SidebarContent
