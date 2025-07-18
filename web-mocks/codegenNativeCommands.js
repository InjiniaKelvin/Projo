// Mock for codegenNativeCommands to prevent web compilation errors
module.exports = function codegenNativeCommands(options) {
  return function(commands) {
    // Return empty object for web - these commands don't work on web anyway
    return {};
  };
};
