// Fixed scenes for screenshots: ?shot=editor shows the studio with the demo
// cast loaded; ?shot=cover shows the exported poster alone, filling the frame.
// `ratio` picks the poster size (1:1, 4:5 or 16:9). window.__shotReady is set
// once the scene has painted, so a screenshot waits for the real artwork.
export async function runShot(shot, query, setup) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await setup(query);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
