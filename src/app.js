document.addEventListener("DOMContentLoaded", () => {
  const submitButton = document.getElementById("submitButton");
  const nameInput = document.getElementById("nameInput");
  const messageInput = document.getElementById("messageInput");
  const overlay = document.getElementById("overlay");
  const content = document.getElementById("content");
  const messageBox = document.getElementById("messageBox");
  const gifImage = document.querySelector('img[alt="Loading animation"]');
  const backgroundMusic = new Audio("./src/assets/sfx/sound.mp3");
  const lang = getQueryParam("lang") || "VN";
  const exitCheckbox = document.getElementById("exitCheckbox");
  const exitButton = document.getElementById("exit");
  const storedName = localStorage.getItem("name");
  const storedMessage = localStorage.getItem("message");
  let languageData;

  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.5;

  if (storedName) nameInput.value = storedName;
  if (storedMessage) messageInput.value = storedMessage;

  const exitParam = getQueryParam("exit");
  if (exitParam === "y") {
    exitCheckbox.checked = true;
    exitButton.style.display = "block";
  } else {
    exitCheckbox.checked = false;
    exitButton.style.display = "none";
  }

  exitCheckbox.addEventListener("change", () => {
    const exitValue = exitCheckbox.checked ? "y" : "n";
    localStorage.setItem("exit", exitValue);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?exit=${exitValue}`
    );
    exitButton.style.display = exitCheckbox.checked ? "block" : "none";
  });

  const userName = getQueryParam("name");
  const userMessage = getQueryParam("message");

  overlay.style.display = userName ? "center" : "none";

  fetch("./src/lang/lang.json")
    .then((response) => response.json())
    .then((data) => {
      languageData = data;
      applyLanguage(languageData[lang]);

      userName ? handleUserName() : showNamePrompt();
    })
    .catch((err) => console.error("Failed to load language JSON:", err));

  function getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
  }

  function applyLanguage(language) {
    Object.entries(language).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) {
        element.textContent = value;
      }
    });

    const nameLabel = document.getElementById("labelNameInput");
    const messageLabel = document.getElementById("labelMessageInput");

    if (nameLabel) nameLabel.textContent = language.nameInput;
    if (messageLabel) messageLabel.textContent = language.messageInput;
  }

  function showNamePrompt() {
    const namePrompt = document.getElementById("namePrompt");
    namePrompt.style.display = "block";

    submitButton.addEventListener("click", handleSubmission);
  }

  function handleSubmission() {
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (name && message) {
      const encodedMessage = encodeMessage(message);
      const exitParam = getQueryParam("exit") || "n";
      const newUrl = `${window.location.origin}${
        window.location.pathname
      }?name=${encodeURIComponent(
        name
      )}&lang=${lang}&message=${encodedMessage}&exit=${exitParam}`;

      navigator.clipboard
        .writeText(newUrl)
        .then(() => {
          alert(languageData[lang].successMessages.linkCopied);
          window.location.href = newUrl;
        })
        .catch(() => {
          alert(languageData[lang].errorMessages.copyFailed);
          window.location.href = newUrl;
        });
    } else {
      alert(languageData[lang].errorMessages.invalidNameOrMessage);
    }
  }

  nameInput.addEventListener("input", () => {
    const name = nameInput.value.trim();
    if (name) {
      localStorage.setItem("name", name);
    } else {
      localStorage.removeItem("name");
    }
  });

  messageInput.addEventListener("input", () => {
    const message = messageInput.value.trim();
    if (message) {
      localStorage.setItem("message", message);
    } else {
      localStorage.removeItem("message");
    }
  });

  submitButton.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (name && message) {
      localStorage.setItem("name", name);
      localStorage.setItem("message", message);
    }
  });

  function handleUserName() {
    document.getElementById("namePrompt").style.display = "none";

    document
      .getElementById("birthdayButton")
      .addEventListener("click", handleBirthday);
    document
      .getElementById("notBirthdayButton")
      .addEventListener("click", handleNotBirthday);
    document
      .getElementById("retryButton")
      .addEventListener("click", () => location.reload());
  }

  function handleBirthday() {
    messageBox.textContent = languageData[lang].birthdayMessage;
    gifImage.src = "./src/assets/images/uwu.gif";
    messageBox.className = "message-box success";
    messageBox.style.display = "block";

    toggleButtons(false);
    setTimeout(() => backgroundMusic.play(), 5000);
    setTimeout(() => overlay.classList.add("fade-out"), 3000);
    setTimeout(() => {
      overlay.style.display = "none";
      content.style.display = "block";
      const script = document.createElement("script");
      script.type = "module";
      script.src = "./src/main.js";
      document.body.appendChild(script);
    }, 4000);

    document.getElementById("exit").style.display = "none";
  }

  function handleNotBirthday() {
    gifImage.src = "./src/assets/images/no.gif";
    messageBox.style.display = "none";
    document.getElementById("retryButton").style.display = "block";
    toggleButtons(false);
    document.getElementById("exit").style.display = "none";
  }

  function toggleButtons(visible) {
    ["birthdayButton", "notBirthdayButton", "question"].forEach((id) => {
      const button = document.getElementById(id);
      if (button) button.style.display = visible ? "block" : "none";
    });
  }

  document.getElementById("changeLangButton").addEventListener("click", () => {
    const newLang = lang === "VN" ? "EN" : "VN";
    const exitParam = getQueryParam("exit") || "n";
    const newUrl = `${window.location.origin}${window.location.pathname}?lang=${newLang}&exit=${exitParam}`;
    window.location.href = newUrl;
  });

  document.getElementById("exit").addEventListener("click", () => {
    const baseUrl = window.location.origin + window.location.pathname;
    window.history.replaceState(null, "", baseUrl);
    location.reload();
  });
});
