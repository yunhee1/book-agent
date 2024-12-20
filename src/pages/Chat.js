import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getChatCompletion } from '../utils/openai';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // OpenAI API에 보낼 메시지 히스토리 형식으로 변환
    const formatMessages = (msgs) => {
        return msgs.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text
        }));
    };

    const handleSendMessage = async () => {
        if (inputMessage.trim() === '' || isLoading) return;
        
        const newMessage = {
            id: Date.now(),
            text: inputMessage,
            isUser: true
        };
        
        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // 이전 대화 내용을 포함하여 API 요청
            const chatHistory = [...messages, newMessage];
            const formattedMessages = formatMessages(chatHistory);
            
            const response = await getChatCompletion(formattedMessages);
            
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: response,
                isUser: false
            }]);
        } catch (error) {
            console.error('메시지 전송 오류:', error);
            alert('메시지 전송 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-4 rounded-lg shadow-md h-[100vh] w-full max-w-sm sm:max-w-md flex flex-col">
          <div className="flex-1 flex flex-col overflow-hidden">
            <h1 className="text-center text-xl font-bold mb-4 pb-4 border-b">SuMA</h1>
            
            {/* 채팅 메시지 영역 */}
            <div className="flex-1 overflow-y-auto px-2">
                <div className="space-y-4 py-2">
                    {messages.map(message => (
                        <div 
                            key={message.id}
                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div 
                                className={`max-w-[70%] rounded-lg p-3 break-words ${
                                    message.isUser 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {message.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                                입력 중...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
          </div>
          
          {/* 입력창 영역 */}
          <div className="border-t pt-4 mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="메시지를 입력하세요"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button 
                onClick={handleSendMessage}
                className={`px-4 py-2 text-white rounded-lg ${
                    isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                }`}
                disabled={isLoading}
              >
                전송
              </button>
            </div>
          </div>
        </div>
      </div>
    );
};
export default Chat;