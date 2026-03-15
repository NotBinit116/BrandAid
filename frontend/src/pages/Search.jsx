import { useState } from "react"
import SearchBar from "../components/SearchBar"
import LimitedPopup from "../components/LimitedPopup"
import { posts } from "../data/dummyData"

export default function Search(){

  const [searched,setSearched] = useState(false)
  const [showPopup,setShowPopup] = useState(false)

  return(

    <div style={{padding:"40px"}}>

      <h1>BrandAid</h1>

      <SearchBar onSearch={()=>setSearched(true)} />

      {searched && (

        <div style={{
          display:"flex",
          gap:"20px",
          marginTop:"40px"
        }}>

          {Object.keys(posts).map(sentiment =>(

            <div key={sentiment}>

              <h3>{sentiment}</h3>

              {posts[sentiment].slice(0,5).map(p =>(
                <p key={p.id}>{p.text}</p>
              ))}

              <button onClick={()=>setShowPopup(true)}>
                View More
              </button>

            </div>

          ))}

        </div>

      )}

      {showPopup && <LimitedPopup close={()=>setShowPopup(false)} />}

    </div>

  )

}