// components/CustomerSupportChatbot.jsx
import React, { useEffect } from "react";

const ChatBot = () => {
  useEffect(() => {
    // Dynamically inject the Jotform embed script once on mount
    const script = document.createElement("script");
    script.src =
      "https://cdn.jotfor.ms/agent/embedjs/0197634198f07cf9b6e1d98eed49af955a23/embed.js?skipWelcome=1&maximizable=1";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script on unmount if needed
      document.body.removeChild(script);
    };
  }, []);

  return null; // No UI here because the widget is handled by the script
};

export default ChatBot;
