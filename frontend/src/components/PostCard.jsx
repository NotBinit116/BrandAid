export default function PostCard({ post, onClick }){

  return (

    <div
      onClick={onClick}
      style={{
        border:"1px solid #ddd",
        padding:"10px",
        marginTop:"10px",
        borderRadius:"6px",
        cursor:"pointer",
        background:"white"
      }}
    >

      <p>{post.text}</p>

      <small>{post.platform}</small>

    </div>

  )

}