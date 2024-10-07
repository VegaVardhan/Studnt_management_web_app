import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProfessorAdminPanel.css';

function ProfessorAdminPanel() {

    const { course_id } = useParams();
    const [professor, setProfessor] = useState(null);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(course_id);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:5000/admin-data', { credentials: 'include' })
            .then(response => {
                if (response.status === 401) {
                    navigate('/login'); // Redirect to login if unauthorized
                    return null;
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    setProfessor(data.professor);
                    setCourses(data.courses);
                }
            });
    }, [navigate]);

    useEffect(() => {
        if (selectedCourse) {
          fetch(`http://localhost:5000/course-details/${selectedCourse}`, { credentials: 'include' })
            .then(response => response.json())
            .then(data => {
              setStudents(data);
            });
        }
      }, [selectedCourse]);

    const submitMarks = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {};
        formData.forEach((value, key) => {
            const [field, email] = key.split('_');
            if (!data[email]) data[email] = {};
            data[email][field] = value;
        });

        fetch(`http://localhost:5000/submit-marks/${selectedCourse}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            setSelectedCourse(selectedCourse);
        })
        .catch(error => console.error('Error:', error));
    };

    const logout = () => {
        fetch('http://localhost:5000/logout', { method: 'POST', credentials: 'include' })
            .then(() => navigate('/login'));
    };

    if (!professor) {
        return <p>Loading...</p>;
    }

    return (
        <div className="main-container">
            <div className="content">
                <div className="student-details">
                    {selectedCourse ? (
                        <form onSubmit={submitMarks}>
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
                                    {students.map(student => (
                                        <tr key={student.email}>
                                            <td>{student.name}</td>
                                            <td><input type="number" name={`quiz1_${student.email}`} defaultValue={student.quiz1 || ''} /></td>
                                            <td><input type="number" name={`midsem_${student.email}`} defaultValue={student.midsem || ''} /></td>
                                            <td><input type="number" name={`quiz2_${student.email}`} defaultValue={student.quiz2 || ''} /></td>
                                            <td><input type="number" name={`endsem_${student.email}`} defaultValue={student.endsem || ''} /></td>
                                            <td>{student.grade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button type="submit">Submit Marks</button>
                        </form>
                    ) : (
                        <p>Select a course to view student details and add marks.</p>
                    )}
            </div>
        </div>
        <div className="logout">
            <button id="logout-btn" onClick={logout}>Logout</button>
        </div>
        </div>
    );
}

export default ProfessorAdminPanel;
