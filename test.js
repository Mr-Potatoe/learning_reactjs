// Fetch blog posts from JSONPlaceholder
fetch('https://jsonplaceholder.typicode.com/posts')
  .then(res => res.json())
  .then(async data => {
    const [firstPost] = data;

    const { userId, id, title, body } = firstPost;

    console.log("Post ID:", id);
    console.log("Title:", title);
    console.log("User ID:", userId);
    console.log("Body:", body);

    // Set up timeout control (optional but recommended)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

    try {
      const res = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        body: JSON.stringify({
          q: body,
          source: "auto",
          target: "bg", // Translate to Bulgarian
          format: "text",
          api_key: "" // Leave empty if not using an API key
        }),
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal
      });

      clearTimeout(timeout); // Stop the timeout once response is received

      const translated = await res.json();
      console.log("Translated:", translated);
    } catch (err) {
      console.error("Translation failed:", err.message);
    }
  })
  .catch(err => {
    console.error("Something went wrong:", err.message);
  });
