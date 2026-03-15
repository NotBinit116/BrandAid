import { useState } from "react"
import { posts } from "../data/dummyData"
import SentimentColumn from "../components/SentimentColumn"
import FeedbackModal from "../components/FeedbackModal"

export default function Dashboard(){

  const [selected,setSelected] = useState(null)

  return(

    <div style={{padding:"40px"}}>

      <h1>Dashboard</h1>

      <div style={{
        display:"flex",
        gap:"20px",
        marginTop:"30px"
      }}>

        {Object.keys(posts).map(sentiment =>(

          <SentimentColumn
            key={sentiment}
            title={sentiment}
            posts={posts[sentiment]}
            onSelect={setSelected}
          />

        ))}

      </div>

      {selected &&
        <FeedbackModal
          post={selected}
          close={()=>setSelected(null)}
        />
      }

    </div>

  )

}