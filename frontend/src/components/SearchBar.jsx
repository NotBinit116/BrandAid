export default function SearchBar({ onSearch }) {

  return (

    <div style={{
      display:"flex",
      gap:"10px",
      marginTop:"20px"
    }}>

      <input
        placeholder="Search brand..."
        style={{
          padding:"10px",
          width:"300px",
          borderRadius:"6px",
          border:"1px solid #ccc"
        }}
      />

      <button
        onClick={onSearch}
        style={{
          padding:"10px 20px",
          background:"#2563EB",
          color:"white",
          border:"none",
          borderRadius:"6px"
        }}
      >
        Search
      </button>

    </div>

  )

}