export default function LimitedPopup({ close }){

  return (

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
        textAlign:"center"
      }}>

        <h2>Login Required</h2>

        <p>You can only view limited results.</p>

        <div style={{marginTop:"20px"}}>

          <a href="/login">Login</a>

          <span style={{margin:"0 10px"}}>|</span>

          <a href="/register">Register</a>

        </div>

        <button
          onClick={close}
          style={{marginTop:"20px"}}
        >
          Close
        </button>

      </div>

    </div>

  )

}