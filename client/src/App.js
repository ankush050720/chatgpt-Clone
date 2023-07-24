import logo from './logo.svg';
import './normal.css';
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

function App(props) {

  const profileImageUrl = props.location.state?.profileImageUrl;
  const profileName = props.location.state?.profileName ;

  const chatLogContainerRef = useRef(null);
  const chatboxRef = useRef(null);

  useEffect(() => {
    getEngines();
    window.addEventListener('resize', handleWindowResize);
    handleWindowResize();
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(true);
  const [input, setInput] = useState("");
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState("gpt-3.5-turbo");
  const [isLoading, setIsLoading] = useState(true);
  const [chatLog, setChatLog] = useState([{
    user : "gpt" , 
    message : `Hello ${profileName}! How can I assist you today?`
  }]);

  function clearChat() {
    setChatLog([{
      user : "gpt" , 
      message : "Hello ${profileName}! How can I assist you today?"
    }]);
  }

  useEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
    checkIfUserAtBottom();
    chatLogContainerRef.current.addEventListener('scroll', checkIfUserAtBottom);
  }, [chatLog]);

  function checkIfUserAtBottom() {
    const container = chatLogContainerRef.current;
    const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
    setIsAtBottom(isAtBottom);
  }

  function scrollToBottom() {
    if (chatLogContainerRef.current) {
      const container = chatLogContainerRef.current;
      container.scrollTop = container.scrollHeight - container.clientHeight;
    }
  }

  function scrollToBottomOnClick() {
    scrollToBottom();
    setIsAtBottom(true); // Set isAtBottom to true after clicking the button to hide it
  }

  function toggleDarkMode() {
    setIsDarkMode((prevIsDarkMode) => !prevIsDarkMode);
  }

  function handleModelItemClick(modelId) {
    setCurrentModel(modelId);
    setSelectedModelId(modelId);
  }

  function toggleSideMenu() {
    setIsSideMenuOpen((prevIsSideMenuOpen) => !prevIsSideMenuOpen);
  }

  function handleWindowResize() {
    // Update the state based on window size
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      setIsSideMenuOpen(false);
    }
  }

  function getEngines() {
    fetch("http://localhost:3080/models")
      .then((res) => res.json())
      .then((data) => {
        data.models.forEach((element) => {
          // console.log(element.id);
        });
        setModels(data.models);
        setIsLoading(false);
      });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let chatLogNew = [
      ...chatLog,
      {
        user: "me",
        message: `${input}`,
      },
    ];
    setInput("");
    setChatLog(chatLogNew);

    const response = await fetch("https://ankj-chatgpt-clone.onrender.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: chatLogNew, currentModel }),
    });

    const data = await response.json();
    setChatLog([
      ...chatLogNew,
      {
        user: "gpt",
        message: `${data.message}`,
      },
    ]);
    console.log(data.message);
  }

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <aside className={`sidemenu ${isSideMenuOpen ? "" : "closed"}`}>
        <div className={`side-menu-button-container ${isSideMenuOpen ? "" : "closed"}`}>
          <div className="side-menu-button" onClick={clearChat}>
            <span>+</span>
            New Chat
          </div>
          {isSideMenuOpen && (
            <button className="toggle-menu-button" onClick={toggleSideMenu}>
              ◀
            </button>
          )}
        </div>

        <div className="model-container">
          <h3>Models</h3>
          <div className="models">
            {isLoading ? (
              <div>Loading...</div>
            ) : models && models.length > 0 ? (
              models.map((model) => (
                <div
                  key={model.id}
                  className={`model-item ${selectedModelId === model.id ? "selected" : ""}`}
                  onClick={() => handleModelItemClick(model.id)}
                >
                  {model.id}
                </div>
              ))
            ) : (
              <div>No models available</div>
            )}
          </div>
        </div>
        <div className='theme-box'> 
        Change Theme
        <div className={`dark-light-toggle ${isDarkMode ? 'dark' : 'light'}`} onClick={toggleDarkMode}>
          {isDarkMode ? <FaSun />: <FaMoon />}
        </div>
        </div>
        
      </aside>
      {!isSideMenuOpen && (
        <button className="toggle-menu-button-closed" onClick={toggleSideMenu}>
        ☰
        </button>
      )}
      <section className="chatbox" ref={chatboxRef}>
        <div className="chat-log-container" ref={chatLogContainerRef}>
          <div className="chat-log">
            {chatLog.map((message, index) => (
              <ChatMessage key={index} message={message} profileImageUrl={profileImageUrl}/>
            ))}
          </div>
          <div className="chat-input-holder">
            <form onSubmit={handleSubmit}>
              <div className="input-container">
                <input
                  rows="1"
                  className="chat-input-textarea"
                  placeholder="Send a message"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
            </form>
          </div>
        </div>
        {!isAtBottom && (
          <button className="scroll-to-bottom-button" onClick={scrollToBottomOnClick}>
            ▼
          </button>
        )}
      </section>
    </div>
  );
}

const ChatMessage = ({ message , profileImageUrl }) => {
  const [showTyping, setShowTyping] = useState(true);
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    if (showTyping) {
      const interval = setInterval(() => {
        setVisibleCharacters((prevVisibleCharacters) => {
          const nextVisibleCharacters = prevVisibleCharacters + 1;
          if (nextVisibleCharacters >= message.message.length) {
            clearInterval(interval);
            setTimeout(() => setShowTyping(false), 1000);
          }
          return nextVisibleCharacters;
        });
      }, 35); // Adjust typing speed here
      return () => clearInterval(interval);
    }
  }, [showTyping, message.message]);

  return (
    <div className={`chat-message ${message.user === "gpt" && "chatgpt"}`}>
      <div className="chat-message-center">
        <div className={`avatar ${message.user === "gpt" && "chatgpt"}`}>
          {message.user === "gpt" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={32}
              height={32}
              fill="none"
              strokeWidth={1.5}
              viewBox="0 0 41 41"
              className="h-6 w-6"
            >
              <title>{"ChatGPT"}</title>
                        <text x={-9999} y={-9999}>
                            {"ChatGPT"}
                        </text>
                        <path
                            fill="currentColor"
                            d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835A9.964 9.964 0 0 0 18.306.5a10.079 10.079 0 0 0-9.614 6.977 9.967 9.967 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 7.516 3.35 10.078 10.078 0 0 0 9.617-6.981 9.967 9.967 0 0 0 6.663-4.834 10.079 10.079 0 0 0-1.243-11.813ZM22.498 37.886a7.474 7.474 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496ZM6.392 31.006a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744ZM4.297 13.62A7.469 7.469 0 0 1 8.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.01L7.04 23.856a7.504 7.504 0 0 1-2.743-10.237Zm27.658 6.437-9.724-5.615 3.367-1.943a.121.121 0 0 1 .113-.01l8.052 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.65-1.132Zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763Zm-21.063 6.929-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225Zm1.829-3.943 4.33-2.501 4.332 2.5v5l-4.331 2.5-4.331-2.5V18Z"/>
            </svg>
          )}

          {message.user === "me" && (
            <img src={profileImageUrl} alt="Profile" className="profile-image" />
          )}
        </div>
        <div className="message">
          {showTyping ? (
            <>
              {message.message.substring(0, visibleCharacters)}
              <span className="typing-indicator">|</span>
            </>
          ) : (
            message.message
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
