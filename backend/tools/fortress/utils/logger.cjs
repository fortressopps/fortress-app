exports.log = function(level, message) {
  const ts = new Date().toISOString();
  console.log(`[FORTRESS:TOOL][${ts}][${level}] ${message}`);
};
