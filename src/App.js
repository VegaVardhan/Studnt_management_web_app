import React, {useState,useEffect} from 'react';
import CourseInfo from './components/CourseInfo';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import ProfessorAdminPanel from './components/ProfessorAdminPanel';
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

function App() {

  const [isLoggedIn, setIsLoggedIn]=useState(false);
  const [userRights, setUserRights] = useState(null);
  const [userData, setUserData] = useState(null);

  const handleLogin = (rights) => {
    setIsLoggedIn(true);
    setUserRights(rights);
  };

  const handleLogout = async () => {
    await fetch('http://localhost:5000/logout', { method: 'POST', credentials: 'include' });
    setIsLoggedIn(false);
    setUserRights(null);
    setUserData(null);
  };

  useEffect(() => {
    if (isLoggedIn && userRights !== null) {
      const fetchUserData = async () => {
        const response = await fetch(`http://localhost:5000/${userRights === 0 ? 'student-details' : 'professor-details'}`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        setUserData(data);
      };
      fetchUserData();
    }
  }, [isLoggedIn, userRights]);

  return (
    <BrowserRouter>
        {isLoggedIn ? (
            <div className="main-container">
                {userData ? (
                    <Sidebar
                        name={userData[0]?.name}
                        email={userData[0]?.email}
                        dept_name={userData[0]?.dept_name}
                        courses={userData}
                        onLogout={handleLogout}
                    />
                ) : (
                    <div>Loading user data...</div>
                )}
                <Routes>
                  {userRights === 0 ? (
                    <Route path="/course-info/:course_id" element={<CourseInfo userRights={userRights} />} />
                  ) : (
                    <Route path="/course-info/:course_id" element={<ProfessorAdminPanel />} />
                  )}
                  <Route path="/" element={<Navigate to={userRights === 1 ? "/admin-panel" : "/course-info"} />} />
                </Routes>
            </div>
        ) : (
            <Login onLogin={handleLogin} />
        )}
    </BrowserRouter>
);
}

export default App;
