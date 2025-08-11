const topicInput = document.getElementById("topic")
const generateBtn = document.getElementById("generate")
const ideasList = document.getElementById("ideas")
const loading = document.getElementById("loading")
const emptyState = document.getElementById("empty-state")

// Enhanced generate function with better UX
generateBtn.addEventListener("click", generateIdeas)

// Allow Enter key to trigger generation
topicInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !generateBtn.disabled) {
    generateIdeas()
  }
})

// Auto-focus input on page load
topicInput.focus()

async function generateIdeas() {
  const topic = topicInput.value.trim()

  if (!topic) {
    showError("Please enter a topic to generate ideas.")
    topicInput.focus()
    return
  }

  // Update UI for loading state
  setLoadingState(true)
  hideEmptyState()
  clearIdeas()

  try {
    const res = await fetch("/api/idea", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || "Failed to generate ideas")
    }

    if (data.error) {
      throw new Error(data.error)
    }

    displayIdeas(data.ideas)
  } catch (error) {
    console.error("Error generating ideas:", error)
    showError("Error generating ideas: " + error.message)
    showEmptyState()
  } finally {
    setLoadingState(false)
  }
}

function setLoadingState(isLoading) {
  loading.style.display = isLoading ? "flex" : "none"
  loading.hidden = !isLoading
  generateBtn.disabled = isLoading

  if (isLoading) {
    generateBtn.innerHTML = `
      <div class="spinner"></div>
      <span class="btn-text">Generating...</span>
    `
  } else {
    generateBtn.innerHTML = `
      <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      <span class="btn-text">Generate Ideas</span>
    `
  }
}

function displayIdeas(ideas) {
  if (!ideas || ideas.length === 0) {
    showError("No ideas were generated. Please try a different topic.");
    showEmptyState();
    return;
  }

  ideas.forEach((idea, index) => {
    const li = document.createElement("li");    
    const parts = idea.split(/\*\*(.*?)\*\*/);

    parts.forEach((part, i) => {
      if (i % 2 === 1) {
        const strong = document.createElement("strong");
        strong.textContent = part;
        li.appendChild(strong);
      } else {
        const textNode = document.createTextNode(part);
        li.appendChild(textNode);
      }
    });

    li.style.animationDelay = `${index * 0.1}s`;
    li.classList.add("fade-in");
    ideasList.appendChild(li);
  });
}

function clearIdeas() {
  ideasList.innerHTML = ""
}

function showEmptyState() {
  emptyState.style.display = "block"
}

function hideEmptyState() {
  emptyState.style.display = "none"
}

function showError(message) {
  // Create a temporary error message
  const errorDiv = document.createElement("div")
  errorDiv.className = "error-message"
  errorDiv.textContent = message
  errorDiv.style.cssText = `
    background: #fee2e2;
    color: #dc2626;
    padding: 1rem 1.25rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    border: 1px solid #fecaca;
    font-weight: 500;
  `

  // Insert before results section
  const resultsSection = document.querySelector(".results-section")
  resultsSection.insertBefore(errorDiv, resultsSection.firstChild)

  // Remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove()
    }
  }, 5000)
}

// Add CSS animation for fade-in effect
const style = document.createElement("style")
style.textContent = `
  .fade-in {
    animation: fadeInUp 0.6s ease forwards;
    opacity: 0;
    transform: translateY(20px);
  }
  
  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .error-message {
    animation: slideIn 0.3s ease;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
document.head.appendChild(style)
