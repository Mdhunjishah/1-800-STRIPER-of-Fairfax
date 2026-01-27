import { useState } from "react";
import api from "../lib/axios";
import "./SignIn.css";

const SignIn = ({ signUserIn }) => {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [signUp, setSignUp] = useState(false)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if(signUp){
      if (!fname | !lname | !email || !password) {
        setError("Please fill in all fields");
        return;
      }
      
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      const emailRegex = /^[\d|\w]+@1800striper\.com$/

      if(!passwordRegex.test(password)){
        if(!emailRegex.test(email)){
          setError("Weak Password & Invalid Email Domain");
        } else {
          setError("Weak Password");
        }
        return
      }

      if(!emailRegex.test(email)){
        setError("Invalid Email Domain");
        return
      }

      if(!emailRegex.test(email)){
        setError(prev => prev === "" ? "Invalid Email Domain" : prev + " & Invalid Email Domain");
        return;
      }
    } else {
      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }
    }
    

    if(signUp){
      if(fname && lname){
        api.post("http://localhost:5000/api/employee", { first_name: fname, last_name: lname, email: email, password: password })
          .then((res) => {
            if(res.data.success){
              signUserIn(res.data.data)  
            } else {
              setError("An account with this email already exist")
              return
            }
          })
          .catch((error) => {
            console.log(error)
          })
      } else {
        setError("Please fill in all fields");
        return;
      }

      
    } else {
      api.post("http://localhost:5000/api/employee/signin", { email: email, password: password })
        .then((res) => {
          if(res.data.verified){
            signUserIn(res.data.data)
          } else {
            setError("Invalid Email or Password");
          }

        })
        .catch((error) => {
          console.log(error)
        })  
    }
    

  };

  return (
    <div className="signin-container">
      <form className="signin-form" onSubmit={handleSubmit}>
        <h2>{signUp ? "Sign Up" : "Sign In"}</h2>

        {error && <p className="error">{error}</p>}

        {signUp ? (
          <div>
            <label>First Name</label>
            <input
              type="text"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
            />

            <label>Last Name</label>
            <input
              type="text"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
            />
          </div>) : null}

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>{signUp ? "Create Password" : "Password"}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {signUp ? <div>
          <p className="passwordInfo">Passsword Must Include at least:</p>
          <p className="passwordInfo">- 8 Characters</p>
          <p className="passwordInfo">- 1 Special Character</p>
          <p className="passwordInfo">- 1 Uppercase Letter</p>
          <p className="passwordInfo">- 1 Number</p>
        </div> : null}

        <button type="submit">{signUp ? "Sign Up" : "Sign In"}</button>
        <p id="backText" onClick={() => {setError(""); setSignUp(prev => !prev)}}>{signUp ? "back to log in" : "or sign up"}</p>
      </form>
    </div>
  );
}

export default SignIn
