import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './CourseInfo.css';

export default function CourseInfo() {
  const { course_id } = useParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [userRights, setUserRights] = useState(null);

  useEffect(() => {
    const fetchUserRights = async () => {
      const response = await fetch('http://localhost:5000/user-rights', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      setUserRights(data.rights);
    };
    fetchUserRights();
  }, []);

  useEffect(() => {
    const fetchCourseInfo = async () => {
      const response = await fetch(`http://localhost:5000/course-info/${course_id}`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      setCourseInfo(data);
    };
    fetchCourseInfo();
  }, [course_id]);
  
  return (
    <div className="content">
      <h2>{course_id}</h2>
      {courseInfo ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quiz-1</th>
              <th>Mid-sem</th>
              <th>Quiz-2</th>
              <th>End-sem</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(courseInfo) ? courseInfo.map((info, index) => (
              <tr key={index}>
                {info.name && <td>{info.name}</td>}
                <td>{info.quiz1}</td>
                <td>{info.midsem}</td>
                <td>{info.quiz2}</td>
                <td>{info.endsem}</td>
                <td>{info.grade}</td>
              </tr>
            )) : (
              <tr>
                <td>{courseInfo.quiz1}</td>
                <td>{courseInfo.midsem}</td>
                <td>{courseInfo.quiz2}</td>
                <td>{courseInfo.endsem}</td>
                <td>{courseInfo.grade}</td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
