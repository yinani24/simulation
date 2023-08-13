import React, { useState } from 'react';
import { Route, Routes, useLocation, useParams } from 'react-router-dom';
import AdminDashboard from '../admin/admindashboard';
import UserDashBoard from '../user/userdashboard';
import Login from './Login';
import Registration from './Registration';
import ProtectedRoutes from '../utilis/ProtectedRoutes';
import { Button, Text } from '@chakra-ui/react';

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
  else if (!new_id_check && !new_id) {
    new_id = 0
  }
  // console.log(new_id_check)
  // const auth = useAuth()
  //console.log("Auth in Authenicate", auth.auth)
  console.log("New Id in Authenicate", new_id)
  return (
    <Routes>
      <Route path='/' element={new_id === 1 ? <Admin Authen={{ number, new_id }} /> : <User Authen={{ number, new_id }} />} />
      <Route element={ <ProtectedRoutes/> }>
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
  return (<div className='flex flex-col w-1/4'>
    <Text className='m-2' fontFamily='sans-serif' color='orange.500' as='b' fontSize='30px'>Admin</Text>
    {!registered ? <Button className='m-2' onClick={() => setRegistered(true)}>Do you wish to register</Button> : null}
    {!registered ? <Login number={Authen.number} new_id={Authen.new_id} /> : <Registration number={Authen.number} new_id={Authen.new_id} />}
  </div>)
}

function User({ Authen }: { Authen: Authen }) {
  const [registered, setRegistered] = useState(false);
  return (<div className='flex flex-col w-1/4'>
    <Text className='m-2' fontFamily='sans-serif' color='orange.500' as='b' fontSize='30px'>User</Text>
    {!registered ? <Button className='m-2' onClick={() => setRegistered(true)}>Do you wish to register</Button> : null}
    {!registered ? <Login number={Authen.number} new_id={Authen.new_id} /> : <Registration number={Authen.number} new_id={Authen.new_id}/>}
  </div>
  )
}

export default Authenticate;