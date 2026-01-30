import { useState, useRef, useEffect } from 'react'
import { useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { motion, AnimatePresence } from 'framer-motion'
import './SymptomChecker.css'

const translations = {
  ar: {
    title: 'فاحص الأعراض بالذكاء الاصطناعي',
    placeholder: 'صف أعراضك هنا...',
    send: 'إرسال',
    sending: 'جاري الإرسال...',
    possibleConditions: 'الحالات المحتملة',
    recommendedSpecialty: 'التخصص الموصى به',
    urgencyLevel: 'مستوى الاستعجال',
    generalAdvice: 'نصائح عامة',
    bookAppointment: 'احجز موعد',
    newConversation: 'محادثة جديدة',
    error: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    greeting: 'مرحباً! أنا مساعد تبرا الطبي. كيف يمكنني مساعدتك اليوم؟ صف لي أعراضك وسأساعدك في فهمها.',
    urgencyLevels: {
      emergency: 'طوارئ - توجه للمستشفى فوراً',
      urgent: 'عاجل - راجع طبيب خلال 24-48 ساعة',
      routine: 'روتيني - احجز موعد خلال أسبوع',
      self_care: 'عناية ذاتية - يمكن العلاج في المنزل'
    },
    probability: {
      high: 'احتمال عالي',
      medium: 'احتمال متوسط',
      low: 'احتمال منخفض'
    }
  },
  en: {
    title: 'AI Symptom Checker',
    placeholder: 'Describe your symptoms...',
    send: 'Send',
    sending: 'Sending...',
    possibleConditions: 'Possible Conditions',
    recommendedSpecialty: 'Recommended Specialty',
    urgencyLevel: 'Urgency Level',
    generalAdvice: 'General Advice',
    bookAppointment: 'Book Appointment',
    newConversation: 'New Conversation',
    error: 'An error occurred. Please try again.',
    greeting: 'Hello! I\'m Tabra\'s medical assistant. How can I help you today? Describe your symptoms and I\'ll help you understand them.',
    urgencyLevels: {
      emergency: 'Emergency - Go to hospital immediately',
      urgent: 'Urgent - See a doctor within 24-48 hours',
      routine: 'Routine - Schedule within a week',
      self_care: 'Self Care - Can be managed at home'
    },
    probability: {
      high: 'High probability',
      medium: 'Medium probability',
      low: 'Low probability'
    }
  }
}

export default function SymptomChecker({ lang = 'ar', onBookAppointment }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [conversationHistory, setConversationHistory] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const analyzeSymptoms = useAction(api.symptoms.actions.analyzeSymptoms)
  const t = translations[lang] || translations.ar
  const isRTL = lang === 'ar'

  // Add greeting message on mount
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: t.greeting }])
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setError(null)

    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    // Add to conversation history for API
    const newHistory = [...conversationHistory, { role: 'user', content: userMessage }]

    setLoading(true)

    try {
      const result = await analyzeSymptoms({
        symptoms: userMessage,
        language: lang,
        conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined
      })

      if (result.success) {
        if (result.ready && result.analysis) {
          // Analysis is complete
          setAnalysis(result.analysis)
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: t.generalAdvice + ': ' + (isRTL ? result.analysis.generalAdvice_ar : result.analysis.generalAdvice) || '',
            isAnalysis: true
          }])
        } else {
          // Still gathering info - add assistant response
          const assistantMessage = isRTL && result.message_ar ? result.message_ar : result.message
          setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])

          // Update conversation history
          setConversationHistory([
            ...newHistory,
            { role: 'assistant', content: assistantMessage }
          ])
        }
      } else {
        setError(result.error || t.error)
        setMessages(prev => [...prev, { role: 'assistant', content: t.error, isError: true }])
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError(t.error)
      setMessages(prev => [...prev, { role: 'assistant', content: t.error, isError: true }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewConversation = () => {
    setMessages([{ role: 'assistant', content: t.greeting }])
    setConversationHistory([])
    setAnalysis(null)
    setError(null)
    setInput('')
  }

  const handleBookAppointment = () => {
    if (onBookAppointment && analysis) {
      onBookAppointment({
        specialty: analysis.recommendedSpecialty,
        urgency: analysis.urgencyLevel
      })
    }
  }

  const getUrgencyClass = (level) => {
    switch (level) {
      case 'emergency': return 'urgency-emergency'
      case 'urgent': return 'urgency-urgent'
      case 'routine': return 'urgency-routine'
      case 'self_care': return 'urgency-self-care'
      default: return ''
    }
  }

  const getProbabilityClass = (prob) => {
    switch (prob) {
      case 'high': return 'prob-high'
      case 'medium': return 'prob-medium'
      case 'low': return 'prob-low'
      default: return ''
    }
  }

  return (
    <div className={`symptom-checker ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="symptom-checker-header">
        <h2 className="symptom-checker-title">{t.title}</h2>
        {(messages.length > 1 || analysis) && (
          <button className="new-conversation-btn" onClick={handleNewConversation}>
            {t.newConversation}
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="chat-container">
        <div className="messages-list">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'} ${msg.isError ? 'message-error' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {msg.content}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              className="message message-assistant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              className="analysis-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Urgency Level */}
              <div className={`urgency-card ${getUrgencyClass(analysis.urgencyLevel)}`}>
                <h3>{t.urgencyLevel}</h3>
                <p>{t.urgencyLevels[analysis.urgencyLevel]}</p>
              </div>

              {/* Recommended Specialty */}
              <div className="result-card specialty-card">
                <h3>{t.recommendedSpecialty}</h3>
                <p className="specialty-name">
                  {isRTL && analysis.recommendedSpecialty_ar
                    ? analysis.recommendedSpecialty_ar
                    : analysis.recommendedSpecialty}
                </p>
                <button className="book-btn" onClick={handleBookAppointment}>
                  {t.bookAppointment}
                </button>
              </div>

              {/* Possible Conditions */}
              <div className="result-card conditions-card">
                <h3>{t.possibleConditions}</h3>
                <ul className="conditions-list">
                  {analysis.possibleConditions.map((condition, idx) => (
                    <li key={idx} className="condition-item">
                      <div className="condition-header">
                        <span className="condition-name">
                          {isRTL && condition.name_ar ? condition.name_ar : condition.name}
                        </span>
                        <span className={`probability-badge ${getProbabilityClass(condition.probability)}`}>
                          {t.probability[condition.probability]}
                        </span>
                      </div>
                      {condition.description && (
                        <p className="condition-description">{condition.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="disclaimer">
                {analysis.disclaimer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      {!analysis && (
        <div className="input-container">
          <textarea
            className="symptom-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.placeholder}
            rows={2}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            {loading ? t.sending : t.send}
          </button>
        </div>
      )}
    </div>
  )
}
