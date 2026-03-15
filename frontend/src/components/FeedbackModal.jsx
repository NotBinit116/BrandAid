export default function FeedbackModal({ post, close }){

  return(

    <div style={{
      position:"fixed",
      inset:0,
      background:"rgba(0,0,0,0.4)",
      display:"flex",
      justifyContent:"center",
      alignItems:"center"
    }}>

      <div style={{
        background:"white",
        padding:"30px",
        borderRadius:"8px",
        width:"400px"
      }}>

        <h2>Feedback Detail</h2>

        <p>{post.text}</p>

        <p><b>Platform:</b> {post.platform}</p>

        <button style={{
          background:"#EF4444",
          color:"white",
          padding:"10px",
          border:"none",
          borderRadius:"6px"
        }}>
          Report
        </button>

        <br/><br/>

        <button onClick={close}>Close</button>

      </div>

    </div>

  )

}