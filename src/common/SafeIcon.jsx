import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

// Pass the icon component itself. Only the icons a page imports are bundled.
const SafeIcon = ({ icon, ...props }) => (icon ? React.createElement(icon, props) : <FiAlertTriangle {...props} />);

export default SafeIcon;
