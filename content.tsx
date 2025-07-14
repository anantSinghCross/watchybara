import { type PlasmoCSConfig } from "~node_modules/plasmo/dist/type"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN"
}

const WatchybaraMain = () => {
  <div>
    <button className="bg-black text-white rounded">Start Watchybara</button>
  </div>
}

export default WatchybaraMain