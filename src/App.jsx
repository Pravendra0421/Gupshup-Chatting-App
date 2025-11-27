import {BrowserRouter as Router,Route,Routes} from 'react-router-dom';
import AuthGuard from './components/auth/AuthGuard';
import SignupPage from "./pages/Signup";
import LoginPage from "./pages/Login";
import Chat from "./pages/Chat";
export default function App(){
  return(
    <Router>
      <Routes>
        <Route path="/register" element={<SignupPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/" element={<AuthGuard><Chat/></AuthGuard>}/>
      </Routes>
    </Router>
  )
}