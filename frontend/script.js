let isRequestPending = false;

document.getElementById("sendRequest").addEventListener("click", () => {
  if (isRequestPending) return; // Prevent multiple clicks

  isRequestPending = true;

  // Send the request
  fetch("http://localhost:3000/api/data")
    .then((response) => {
      isRequestPending = false; // Reset flag after response

      // Display response status
      document.getElementById(
        "response"
      ).textContent = `Status: ${response.status} ${response.statusText}`;

      // Update rate limit headers
      document.getElementById("remaining").textContent =
        response.headers.get("X-Ratelimit-Remaining") || "N/A";
      document.getElementById("limit").textContent =
        response.headers.get("X-Ratelimit-Limit") || "N/A";
      document.getElementById("retryAfter").textContent =
        response.headers.get("X-Ratelimit-Retry-After") || "N/A";

      return response.text(); // Convert response body to text
    })
    .then((data) => {
      document.getElementById("response").textContent += `\n\n${data}`;
    })
    .catch((error) => {
      isRequestPending = false;
      document.getElementById("response").textContent = `Error: ${error}`;
    });
});
