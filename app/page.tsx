'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Search, 
  Plus, 
  MessageSquare, 
  Settings, 
  HelpCircle, 
  Image as ImageIcon,
  Menu,
  X,
  Zap,
  Globe,
  BookOpen,
  Camera,
  LogIn,
  LogOut,
  Clock
} from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  image?: string
}

interface ChatHistory {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
}

interface User {
  name: string
  email: string
  isLoggedIn: boolean
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. I can help you with deep searches, analyze images, and provide intelligent answers. Try my advanced features!",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [deepSearch, setDeepSearch] = useState(false)
  const [isTemporaryChat, setIsTemporaryChat] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [user, setUser] = useState<User>({ name: '', email: '', isLoggedIn: false })
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [chatHistory] = useState<ChatHistory[]>([
    { id: '1', title: 'AI Assistant Chat', lastMessage: 'Hello! How can I help...', timestamp: new Date() },
    { id: '2', title: 'Deep Research', lastMessage: 'Researching quantum...', timestamp: new Date(Date.now() - 86400000) },
    { id: '3', title: 'Image Analysis', lastMessage: 'Analyzing uploaded...', timestamp: new Date(Date.now() - 172800000) }
  ])
  const [mounted, setMounted] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    setMounted(true)
    scrollToBottom()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (user.name && user.email) {
      setUser({ ...user, isLoggedIn: true })
      setShowLoginModal(false)
    }
  }

  const handleLogout = () => {
    setUser({ name: '', email: '', isLoggedIn: false })
    setIsTemporaryChat(false)
  }

  const handleWebSearch = () => {
    const searchMessage = `Please perform a comprehensive web search for: "${inputValue}" and provide the most current and relevant information available.`
    setInputValue(searchMessage)
  }

  const handleResearch = () => {
    const researchMessage = `Please conduct detailed academic research on: "${inputValue}". Include recent studies, expert opinions, statistical data, and comprehensive analysis with citations.`
    setInputValue(researchMessage)
    setDeepSearch(true)
  }

  const handleTemporaryChat = () => {
    setIsTemporaryChat(true)
    setMessages([{
      id: Date.now().toString(),
      text: "This is a temporary chat. Your conversation won't be saved to history. How can I help you?",
      sender: 'bot',
      timestamp: new Date()
    }])
  }

  const generateBotResponse = async (userMessage: string, hasImage: boolean = false): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          deepSearch: deepSearch,
          hasImage: hasImage
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.response || "I'm sorry, I couldn't process your request at the moment."
    } catch (error) {
      console.error('Error getting AI response:', error)
      return `I'm having trouble connecting to my AI services: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again in a moment.`
    }
  }

  const handleSend = async () => {
    if (inputValue.trim() === '' && !selectedFile) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      image: imagePreview || undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setImagePreview(null)
    setSelectedFile(null)
    setIsTyping(true)

    try {
      const botResponse = await generateBotResponse(inputValue, !!selectedFile)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error while processing your request. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startNewChat = () => {
    setMessages([{
      id: Date.now().toString(),
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }])
    setInputValue('')
    setImagePreview(null)
    setSelectedFile(null)
    setIsTemporaryChat(false)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-80 bg-slate-900/80 backdrop-blur-xl border-r border-blue-500/20 flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-blue-500/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">AI Assistant</h2>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={startNewChat}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium"
            >
              <Plus className="w-5 h-5" />
              New Chat
            </button>
            
            <button
              onClick={handleTemporaryChat}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isTemporaryChat 
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700/70'
              }`}
            >
              <Clock className="w-5 h-5" />
              Temporary Chat
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Recent Chats</h3>
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <motion.div
                key={chat.id}
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-blue-400 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{chat.title}</h4>
                    <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {mounted ? chat.timestamp.toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-blue-500/20 space-y-2">
          {user.isLoggedIn ? (
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium"
            >
              <LogIn className="w-5 h-5" />
              Login
            </button>
          )}
          
          <button 
            onClick={() => setShowHelp(true)}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
          >
            <HelpCircle className="w-4 h-4" />
            Help & Support
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          
          <div className="pt-2 border-t border-blue-500/20">
            <p className="text-xs text-gray-500 text-center">Created by Omkar</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 backdrop-blur-xl border-b border-blue-500/20 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"
                >
                  <Bot className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    AI Chat Assistant
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </h1>
                  <p className="text-sm text-gray-400">
                    {isTemporaryChat ? 'Temporary Chat - Not Saved' : 'Powered by Advanced AI'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Feature Buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDeepSearch(!deepSearch)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  deepSearch 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                    : 'bg-slate-800/50 text-gray-300 hover:bg-slate-800/70'
                }`}
              >
                <Zap className="w-4 h-4" />
                Deep Search
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-slate-800/50 text-gray-300 hover:bg-slate-800/70 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Upload Image
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWebSearch}
                className="px-4 py-2 bg-slate-800/50 text-gray-300 hover:bg-slate-800/70 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Web Search
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResearch}
                className="px-4 py-2 bg-slate-800/50 text-gray-300 hover:bg-slate-800/70 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Research
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`p-2 rounded-full ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-slate-800/50 text-white backdrop-blur-sm border border-blue-500/20'
                      }`}
                    >
                      {message.image && (
                        <Image 
                          src={message.image} 
                          alt="Uploaded" 
                          width={400}
                          height={300}
                          className="rounded-lg mb-3 max-w-full h-auto object-cover"
                        />
                      )}
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {mounted ? message.timestamp.toLocaleTimeString() : ''}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/50 text-white backdrop-blur-sm border border-blue-500/20">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="w-2 h-2 bg-blue-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                          className="w-2 h-2 bg-cyan-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                          className="w-2 h-2 bg-blue-400 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-slate-900/60 backdrop-blur-xl border-t border-blue-500/20 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-4 p-3 bg-slate-800/50 rounded-lg flex items-center gap-3">
                <Image src={imagePreview} alt="Preview" width={64} height={64} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{selectedFile?.name}</p>
                  <p className="text-xs text-gray-400">Image ready for analysis</p>
                </div>
                <button
                  onClick={() => {
                    setImagePreview(null)
                    setSelectedFile(null)
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            
            <div className="flex gap-3">
              <motion.div
                whileFocus={{ scale: 1.02 }}
                className="flex-1 relative"
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={deepSearch ? "Deep search mode - Ask me anything with enhanced research..." : "Ask me anything or search for information..."}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/40 focus:bg-slate-800/70 transition-all"
                />
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-4 bg-slate-800/50 text-gray-300 hover:bg-slate-800/70 rounded-full font-medium transition-all duration-200"
              >
                <ImageIcon className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={isTyping || (inputValue.trim() === '' && !selectedFile)}
                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-medium hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </motion.button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-blue-500/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Login to AI Assistant</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/40"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/40"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium"
                >
                  Login
                </button>
              </form>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full mt-4 py-3 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-blue-500/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Help & User Guide</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6 text-gray-300">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Getting Started
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Welcome to AI Assistant! Start by typing your question in the input field and press Enter or click Send. 
                    The AI will respond with intelligent answers based on your query.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    Deep Search Mode
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Enable Deep Search for comprehensive, detailed responses with enhanced research. 
                    This mode provides more in-depth analysis and context for complex questions.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-cyan-400" />
                    Image Upload
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Upload images for analysis. Click the camera icon or image button to select a file, 
                    then ask questions about the image or request analysis.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-400" />
                    Web Search
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Click the Web Search button to perform real-time web searches. 
                    The AI will find the most current information available on the internet.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-yellow-400" />
                    Research Mode
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Use Research mode for academic-style responses with citations, 
                    statistical data, and comprehensive analysis of your topic.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-400" />
                    Temporary Chat
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Enable Temporary Chat for conversations that won&apos;t be saved to your history. 
                    Perfect for sensitive topics or quick questions.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <LogIn className="w-5 h-5 text-blue-400" />
                    User Account
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Login to save your chat history, customize settings, and access premium features. 
                    Your data is secure and private.
                  </p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4 border border-blue-500/20">
                  <h3 className="text-lg font-semibold text-white mb-3">Pro Tips</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Be specific in your questions for better answers</li>
                    <li>• Use Deep Search for complex topics</li>
                    <li>• Combine text with images for rich analysis</li>
                    <li>• Try Research mode for academic work</li>
                    <li>• Use Temporary Chat for privacy</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
