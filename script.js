const input = document.getElementById('search-input');
const resultBox = document.getElementById('search-result');

let controller = null;

input.addEventListener('input', async () => {
  const query = input.value.trim().toLowerCase();

  if (!query) {
    resultBox.innerHTML = "<li>Results will appear here...</li>";
    return;
  }

  // Abort previous fetch if it's still pending
  if (controller) controller.abort();

  controller = new AbortController();
  const signal = controller.signal;

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users', { signal });
    const users = await response.json();
    const filtered = users.filter(user => user.name.toLowerCase().includes(query));

    if (filtered.length === 0) {
      resultBox.innerHTML = `<li>No results found for "${query}"</li>`;
    } else {
      resultBox.innerHTML = filtered
        .map(user => `<li><strong>${user.name}</strong> (${user.email})</li>`)
        .join('');
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log(`Request aborted for: ${query}`);
    } else {
      console.error(err);
      resultBox.innerHTML = `<li>Error fetching data</li>`;
    }
  }
});
