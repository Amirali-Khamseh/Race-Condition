This is a part of my blog post @https://blog.amir-khamseh.com/blog/race-condition

In JavaScript, when multiple asynchronous operations modify or rely on shared data, the result can become unpredictable. This is known as a **race condition**. It happens when the outcome depends on which asynchronous operation finishes first.

One common scenario where this can occur is **search functionality**—especially when each keystroke triggers a new network request without debouncing. Let's dive deeper with an example.

## A Real-World Example: Search Requests

Imagine you have a search bar where the user types quickly:

- First, the user types `"book"`, which sends a network request.
- Immediately after, they type `"books"`—another request is fired.

Now, depending on your backend logic, the response for `"books"` might arrive **before** `"book"`, even though the request for `"book"` was sent earlier. This causes your UI to show results for `"book"` *after* showing results for `"books"`—a confusing and unintended behavior.

This is where **AbortController** comes in.

## What Is AbortController?

`AbortController` is a built-in JavaScript API that helps manage and cancel asynchronous operations, typically `fetch()` requests. It allows you to signal an in-progress request to abort using the `.abort()` method.

### Example

```js
const controller = new AbortController();
const signal = controller.signal;

fetch('/search?q=books', { signal })
  .then(response => response.json())
  .then(data => {
    // process data
  })
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Request aborted');
    } else {
      console.error(err);
    }
  });

// Later, if needed:
controller.abort(); // Aborts the request
``` 
## Use Case from My Work

Recently, I encountered a similar race condition while managing description audio streaming based on video progress logic in one of my projects.

Each time a user modified the video progress bar, the app would fetch corresponding description audio data to stream. If the user moved the progress bar rapidly, multiple audio streams would be triggered, each based on different data coming from the server. This was highly inefficient and caused unwanted audio overlaps.

By using `AbortController`, I was able to cancel all previous ongoing requests and only allow the latest one to be played.

## AbortController in Action

I put together an example on 👉[Github](https://github.com/Amirali-Khamseh/Race-Condition)👈 which shows how such a controller works. It uses an API from [👥jsonplaceholder](https://jsonplaceholder.typicode.com/) and performs the search each time a character is typed via a fetch.
<br/> There's a controller in a global scope that indicates whether any controller was created previously or not.

```js
let controller = null;
```
Here is the most important part on this whole application, each time this function gets called, it creates a new contollers and sets the signal variable to the object signal retiurning from controller and pass it doewn to the fetch and if you call this event listener rapidly, it will have the previous controller and the condition will abort the request 
```js
input.addEventListener('input', async () => {
...
  // Abort previous fetch if it's still pending
  if (controller) controller.abort();

  controller = new AbortController();
  const signal = controller.signal;

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users', { signal });

```
If you type fast you should see similar canceled (aborted) requests in the network tab of your browser.
