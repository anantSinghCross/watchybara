import { useState } from "react"
import './styles.css'

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div className="bg-blue-400">
      <div className="rounded-2xl p-4 bg-blue-50 text-sm border-4 border-blue-400">
        <h2>
          Welcome to your{" "}
          <a href="https://www.plasmo.com" target="_blank">
            Plasmo
          </a>{" "}
          Extension!
        </h2>
        <input className="my-2 p-2 outline-blue-400 rounded-lg" onChange={(e) => setData(e.target.value)} value={data} />
        <p>{data}</p>
      </div>
    </div>
  )
}

export default IndexPopup
