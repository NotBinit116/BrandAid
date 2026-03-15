import PostCard from "./PostCard"

export default function SentimentColumn({ title, posts, onSelect }){

  return (

    <div style={{
      background:"white",
      padding:"15px",
      borderRadius:"8px",
      width:"300px"
    }}>

      <h3>{title}</h3>

      {posts.map(post => (

        <PostCard
          key={post.id}
          post={post}
          onClick={()=> onSelect(post)}
        />

      ))}

    </div>

  )

}