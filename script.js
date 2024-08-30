async function suggestImprovement() {
  try {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.toString().trim() === '') {
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const selectedText = selection.toString().trim();

    // Fetching intro message.
    const introMessage = getIntroMessage();

    // Creating tooltip.
    const { tooltip, loadingInterval } = createTooltip(rect, introMessage);

    if (tooltip == null) {
      return;
    }

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3.1",
        prompt: `Propose any improvements on the following text. The response should contain only a paragraph consisting of the improved version in plain text only without prefixing anything. The text is: '${selectedText}'`
      })
    });

    // Clearing load inteval.
    clearInterval(loadingInterval);

    // Ensure the request was successful
    if (!response.ok) {
      tooltip.textContent = "Oops! The circuits are on a coffee break. Try again later.";
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await updateTooltipContent(tooltip, response);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function updateTooltipContent(tooltip, response) {
  // Stream the response body
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let answer = '';

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;

    // Decode the streamed chunk of data
    const chunk = decoder.decode(value, { stream: !done });

    if (chunk != null && chunk.trim()) {
      // Parse the individual JSON response
      const jsonResponse = JSON.parse(chunk.trim());
      answer += jsonResponse.response;
      tooltip.textContent = answer;
    }
  }
}

function createTooltip(rect, introMessage) {
  // Checking if there is the tooltip.
  // If it is, we destroy it.
  let tooltip = document.getElementById("suggestion-tooltip");
  if (tooltip != null) {
    tooltip.remove();
    return { tooltip: null, loadingInterval: null };
  }

  tooltip = document.createElement('div');
  tooltip.setAttribute('id', 'suggestion-tooltip');
  tooltip.textContent = introMessage;
  tooltip.style.position = 'absolute';
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  // Adjust for positioning above the selected text
  tooltip.style.top = `${rect.top + window.scrollY - 30}px`;
  tooltip.className = 'cyberpunk';

  document.body.appendChild(tooltip);

  const loadingInterval = setInterval(() => {
    tooltip.textContent += '.';
  }, 2000);

  return { tooltip, loadingInterval };
}

function getIntroMessage() {
  const lexicoreMessages = [
    "Calibrating metaphors... This might take a byte.",
    "Scouring the lexicon... No word left unturned.",
    "Deploying the thesaurus drones... Hold tight!",
    "Optimizing puns... The wordplay is strong with this one.",
    "Aligning the syntax stars... Almost in perfect orbit.",
    "Consulting with the grammar gremlins... Negotiations in progress.",
    "Decoding the essence of eloquence... Stand by.",
    "Tuning the humor algorithm... Laughs are 99% loaded.",
    "Shuffling verbs and nouns... The magic is about to happen.",
    "Brewing some linguistic tea... The steeping is almost done."
  ];

  const randomIndex = Math.floor(Math.random() * lexicoreMessages.length);
  return lexicoreMessages[randomIndex];
}

// Main function or any other code that needs to run on Ctrl+Q
(function () {
  suggestImprovement();
})();
