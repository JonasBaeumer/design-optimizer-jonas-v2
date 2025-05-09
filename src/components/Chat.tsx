
import React, { useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/types';
import { ChatContext, TabContext } from '@/pages/Index';

// Import the refactored components
import MessageBubble from './chat/MessageBubble';
import ChatInput from './chat/ChatInput';
import TypingIndicator from './chat/TypingIndicator';
import ChatHeader from './chat/ChatHeader';

const Chat = () => {
  const { 
    messages, 
    setMessages, 
    loading, 
    setLoading, 
    userInputCount, 
    setUserInputCount,
    addSummaryMessage
  } = useContext(ChatContext);
  
  const { currentTab, previousTab, isButtonNavigation, setIsButtonNavigation } = useContext(TabContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add a fourth message when user returns from the components tab
  useEffect(() => {
    // Check if we're returning to chat tab from components tab
    const isReturningFromComponentsTab = currentTab === 'chat' && previousTab === 'components';
    
    // Check if user has interacted enough and if the message doesn't already exist
    const shouldAddSummaryMessage = 
      userInputCount >= 1 && 
      !messages.some(msg => msg.content.includes("I see that you have reviewed all the provided items"));
    
    // Check if this navigation was triggered by button click
    if (isReturningFromComponentsTab && shouldAddSummaryMessage && isButtonNavigation) {
      console.log('Adding summary message after button navigation');
      addSummaryMessage();
      setIsButtonNavigation(false); // Reset the flag
    }
  }, [currentTab, previousTab, userInputCount, messages, isButtonNavigation, setIsButtonNavigation, addSummaryMessage]);

  const handleSubmit = (input: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    
    // Track user input count for sample message display
    const newInputCount = userInputCount + 1;
    setUserInputCount(newInputCount);

    // Simulate AI response based on input count and previous messages
    setTimeout(() => {
      // Check if the summary message already exists (the fourth message)
      const hasSummaryMessage = messages.some(msg => 
        msg.content.includes("I see that you have reviewed all the provided items"));
      
      // If summary message exists, show the final confirmation message
      if (hasSummaryMessage) {
        const finalMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Your final parts list was forwarded to the buyer, he will notify you if any further information is needed.",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, finalMessage]);
      }
      // Display respective sample message based on user input count
      else if (newInputCount === 1) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Thank you for providing your component list! I've checked the availability of all parts needed for these components and found that some are currently out of stock. Fortunately, there are suitable alternatives available. Please review them by clicking the 'Required Components' tab below.",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else if (newInputCount === 2) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Based on the component list you provided, I've analyzed each subpart to determine which ones are critical (non-replaceable) and which ones can be substituted with similar alternatives. I then compared the list of potential alternatives with our current inventory to identify items available for immediate use. This process ensures that the suggestions I provide are both viable and ready to support your design needs.",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // For any subsequent inputs after the second one and before the summary, use the default response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Based on your requirements, I've analyzed our overstock inventory and found several potential substitutions. Here's what I recommend:",
          timestamp: new Date()
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      }
      
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col rounded-lg border bg-card shadow-soft h-[calc(100vh-13rem)]">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}

          {loading && <TypingIndicator />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <ChatInput onSubmit={handleSubmit} disabled={loading} />
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute bottom-24 right-8 rounded-full shadow-soft border opacity-80 hover:opacity-100"
        onClick={scrollToBottom}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Chat;
