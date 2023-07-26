import React, { useState } from 'react';
import { Route, Routes, useLocation, useParams } from 'react-router-dom';
import AdminDashboard from '../admin/admindashboard';
import UserDashBoard from '../user/userdashboard';
import { Login, Registration } from './LoginRegistration';
import ProtectedRoutes from '../utilis/ProtectedRoutes';

interface Authen {
  number: number;
  new_id?: number;
}

function Authenticate() {
  let location = useLocation();
  let new_id = location.state?.new_id;
  let { admin } = useParams();

  const matchResult = typeof admin === "string" ? admin.match(/\d+/) : null;
  const number = matchResult ? parseInt(matchResult[0]) : NaN;


  const matchResultString = typeof admin === "string" ? admin.match(/admin/) : null;
  const new_id_check = matchResultString ? matchResultString[0] : NaN;
  if (new_id_check === "admin" && (new_id === (undefined) || !new_id)) {
    new_id = 1
  }
  // const auth = useAuth()
  // console.log("Auth in Authenicate", auth.auth)
  console.log("New Id in Authenicate", new_id)
  return (
    <Routes>
      <Route path='/' element={new_id === 1 ? <Admin Authen={{ number, new_id }} /> : <User Authen={{ number, new_id }} />} />
      <Route element={<ProtectedRoutes />}>
        {
          <Route path=':user/*' element={new_id ? <AdminDashboard /> : <UserDashBoard />} />
        }
      </Route>
      {/* <Route path=':user/*' element={auth.auth ? new_id ? : : <Authenticate/>}/> */}
    </Routes>
  )
}

function Admin({ Authen }: { Authen: Authen }) {
  const [registered, setRegistered] = useState(false);
  return (<div>
    <h1>Admin</h1>
    {!registered ? <button onClick={() => setRegistered(true)}>Do you wish to register</button> : null}
    {!registered ? <Login number={Authen.number} new_id={Authen.new_id} /> : <Registration />}
  </div>)
}

function User({ Authen }: { Authen: Authen }) {
  const [registered, setRegistered] = useState(false);
  return (<div>
    <h1>User</h1>
    {!registered ? <button onClick={() => setRegistered(true)}>Do you wish to register</button> : null}
    {!registered ? <Login number={Authen.number} new_id={Authen.new_id} /> : <Registration />}
  </div>
  )
}

export default Authenticate;