import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';

export default function Sidebar(props) {
  return (
    <div className="sidebar">
      <div className="Details">
        <h3>Details</h3>
        <div id="info">
          <p><b>Name:</b> {props.name}</p>
          <p><b>Email:</b> {props.email}</p>
          <p><b>Dept:</b> {props.dept_name}</p>
        </div>
      </div>
      <div className="course-list">
        <h3>Courses</h3>
        <ul id="course-list">
          {props.courses && props.courses.length > 0 ? (
            props.courses.map((course) => (
              <li key={course.course_id}>
                <Link to={`/course-info/${course.course_id}`}>
                  {course.course_id} - {course.title}
                </Link>
              </li>
            ))
          ) : (
            <li>No enrolled courses</li>
          )}
        </ul>
      </div>
      <div className="logout">
        <button id="logout-btn" onClick={props.onLogout}>Logout</button>
      </div>
    </div>
  );
}
