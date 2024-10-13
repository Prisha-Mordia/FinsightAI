'use client'

import React, { useState, useEffect } from 'react'
import { Send, DollarSign } from 'lucide-react'

export function FinancialChatInterface() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! 👋 Welcome to our financial chat. How can I assist you today?', displayContent: '' },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    if (isTyping) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        const timer = setTimeout(() => {
          setMessages(prevMessages => 
            prevMessages.map((msg, index) => 
              index === prevMessages.length - 1 
                ? { ...msg, displayContent: msg.content.slice(0, (msg.displayContent?.length || 0) + 1) }
                : msg
            )
          )
          if (lastMessage.displayContent?.length === lastMessage.content.length) {
            setIsTyping(false)
          }
        }, 50)
        return () => clearTimeout(timer)
      }
    }
  }, [messages, isTyping])

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { role: 'user', content: input }
      setMessages(prev => [...prev, userMessage])
      setInput('')
      setIsTyping(true)

      try {
        const response = await fetch(`http://localhost:5000/finance/advice`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ question: input})
        })
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        const botMessage = { 
          role: 'assistant', 
          content: data.advice || 'No result found, please try again.',
          displayContent: ''
        }
        setMessages(prev => [...prev, botMessage])
      } catch (error) {
        console.error('Error:', error)
        const errorMessage = { 
          role: 'assistant', 
          content: 'Sorry, there was an error processing your request. Please try again.',
          displayContent: ''
        }
        setMessages(prev => [...prev, errorMessage])
      }
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
        <div className="flex-1 p-4 overflow-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3/4 p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 bg-opacity-50 backdrop-filter backdrop-blur-sm'
                }`}
              >
                {message.role === 'assistant' && (
                  <DollarSign className="inline-block w-4 h-4 mr-2 text-blue-600" />
                )}
                {message.role === 'assistant' ? (message.displayContent || '') : message.content}
                {message.role === 'assistant' && isTyping && index === messages.length - 1 && (
                  <span className="inline-block w-1 h-4 ml-1 bg-blue-600 animate-blink"></span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about finances..."
              className="flex-1 p-2 rounded-lg bg-white bg-opacity-50 backdrop-filter backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              aria-label="Chat input"
            />
            <button
              onClick={handleSend}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}