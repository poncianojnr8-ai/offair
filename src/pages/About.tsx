import { Navigate } from "react-router-dom";

// The About page has been replaced by Interviews.
// This redirect keeps any old links working.
const About = () => <Navigate to="/interviews" replace />;

export default About;
