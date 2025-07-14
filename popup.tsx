import './styles.css'

function IndexPopup() {

  const handleClick = async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if(tab.id){
      chrome.tabs.sendMessage(tab.id, {type: "SHOW_WATCHYBARA_MAIN_WIDGET"});
    }
  }

  return (
    <div className="bg-gray-900">
      <div className="rounded-2xl p-10 w-max bg-gray-800 text-sm text-gray-300 border-8 border-gray-900">
        <div className="flex flex-col items-center gap-4">
          <h2>
            Welcome to Watchybara!
          </h2>
          <button className="rounded-lg px-10 py-2 bg-gradient-to-tr from-blue-500 to-indigo-500 text-white text-nowrap hover:to-indigo-600 hover:from-blue-600 shadow-xl shadow-blue-500/50 hover:shadow-blue-500/30" onClick={handleClick}>Start Watchybara</button>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
