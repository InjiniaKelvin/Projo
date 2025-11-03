// Mock for codegenNativeComponent to prevent web compilation errors
module.exports = function codegenNativeComponent(componentName, options) {
 // Return a basic React component for web
 const React = require('react');
 
 return React.forwardRef((props, ref) => {
 return React.createElement('div', {
 ...props,
 ref,
 style: {
 ...props.style,
 // Basic styling for map placeholder
 backgroundColor: '#f0f0f0',
 border: '1px solid #ccc',
 borderRadius: '4px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 minHeight: '200px',
 ...props.style
 }
 }, props.children || 'Map component (web fallback)');
 });
};
