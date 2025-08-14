// resources/js/Components/Spinner.jsx
import React from 'react';
import { Dots } from 'react-preloaders'; // Import Dots spinner from react-spinners
import '../../css/app.css'; // Optional: Custom CSS for styling the spinner

const Loader = () => {
    return (
        <div className="spinner-container">
            <Dots animation="fade" background='rgba(0, 0, 0, 0.5)' color="#3498db" size={60} />
        </div>
    );
};

export default Loader;
