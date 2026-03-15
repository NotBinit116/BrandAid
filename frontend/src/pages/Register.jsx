import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function Register(){

  const navigate = useNavigate()

  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [confirm,setConfirm] = useState("")

  function handleRegister(e){
    e.preventDefault()
    navigate("/login")
  }

  return(

    <div className="flex items-center justify-center min-h-screen">

      <div className="bg-white w-[420px] rounded-2xl shadow-lg p-8">

        <div className="text-center mb-6">

          <div className="font-bold text-xl text-blue-700">
            BrandAid
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            Create Your Account
          </h2>

          <p className="text-sm text-gray-500">
            Join BrandAid and elevate your branding game.
          </p>

        </div>

        <form onSubmit={handleRegister}>

          <label className="text-xs text-gray-500">
            FULL NAME
          </label>

          <input
            placeholder="John Doe"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="w-full mt-2 mb-4 p-3 border rounded-full bg-gray-100"
          />

          <label className="text-xs text-gray-500">
            EMAIL ADDRESS
          </label>

          <input
            placeholder="john@example.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full mt-2 mb-4 p-3 border rounded-full bg-gray-100"
          />

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="text-xs text-gray-500">
                PASSWORD
              </label>

              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full mt-2 p-3 border rounded-full bg-gray-100"
              />

            </div>

            <div>

              <label className="text-xs text-gray-500">
                CONFIRM
              </label>

              <input
                type="password"
                placeholder="••••••"
                value={confirm}
                onChange={(e)=>setConfirm(e.target.value)}
                className="w-full mt-2 p-3 border rounded-full bg-gray-100"
              />

            </div>

          </div>

          <div className="flex items-center mt-4 text-xs text-gray-500">

            <input type="checkbox" className="mr-2"/>

            I agree to the Terms and Conditions

          </div>

          <button
            className="w-full mt-6 py-3 rounded-full bg-cyan-500 text-white font-semibold hover:bg-cyan-600"
          >
            Create Account →
          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-6">

          Already have an account?

          <Link to="/login" className="text-blue-600 ml-1">
            Login
          </Link>

        </p>

      </div>

    </div>

  )

}