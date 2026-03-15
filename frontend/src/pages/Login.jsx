import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function Login() {

  const navigate = useNavigate()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [show,setShow] = useState(false)

  function handleLogin(e){
    e.preventDefault()
    navigate("/dashboard")
  }

  return(

    <div className="flex items-center justify-center min-h-screen">

      <div className="bg-white w-[380px] rounded-2xl shadow-lg p-8">

        <div className="text-center mb-6">

          <div className="font-bold text-xl text-blue-700">
            BrandAid
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            Welcome back
          </h2>

          <p className="text-sm text-gray-500">
            Login to your BrandAid account
          </p>

        </div>

        <form onSubmit={handleLogin}>

          <label className="text-xs text-gray-500">
            EMAIL ADDRESS
          </label>

          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full mt-2 mb-4 p-3 border rounded-full bg-gray-100"
          />

          <div className="flex justify-between text-xs text-gray-500">
            <span>PASSWORD</span>
            <span className="text-blue-500 cursor-pointer">
              Forgot Password?
            </span>
          </div>

          <div className="relative">

            <input
              type={show ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full mt-2 p-3 border rounded-full bg-gray-100"
            />

            <button
              type="button"
              className="absolute right-4 top-3 text-gray-500"
              onClick={()=>setShow(!show)}
            >
              👁
            </button>

          </div>

          <div className="flex items-center mt-3 text-xs text-gray-500">

            <input type="checkbox" className="mr-2"/>

            Remember me for 30 days

          </div>

          <button
            className="w-full mt-6 py-3 rounded-full bg-cyan-500 text-white font-semibold hover:bg-cyan-600"
          >
            Login →
          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-6">

          Don't have an account?

          <Link to="/register" className="text-blue-600 ml-1">
            Sign up
          </Link>
        <h1 className="text-5xl text-blue-500 font-bold">
        Tailwind Works
        </h1>
        </p>

      </div>
      
    </div>
    

  )

}