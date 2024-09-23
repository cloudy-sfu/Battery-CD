importScripts("https://unpkg.com/javascript-lp-solver/prod/solver.js");
onmessage = function(event) {
  const model = event.data;
  const result = solver.Solve(model);
  postMessage(result); // Send result back to the main thread
};
