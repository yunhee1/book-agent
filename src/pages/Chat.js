import React, { useState, useRef, useEffect } from "react";
import { getChatCompletion, accessSpreadsheet } from "../utils/openai";

const Chat = () => {
	const [messages, setMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showStartMenu, setShowStartMenu] = useState(true);
	const messagesEndRef = useRef(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [password, setPassword] = useState("");

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleButtonClick = async (topic) => {
		setShowStartMenu(false);

		// 선택한 주제에 따른 초기 메시지 설정
		const initialMessages = {
			사용법: "라이브데이터 AI의 사용법을 알려주세요.",
			"힌트 찾기": "힌트를 찾는 방법을 알려주세요.",
			"개념 이해": "라이브데이터 AI의 주요 개념을 설명해주세요.",
			"문제 해설": "문제 해설 방법을 알려주세요.",
		};

		// 각 주제별 AI 응답 메시지
		const aiResponses = {
			사용법:
				"라이브데이터 AI 사용법에 대해 알려드리겠습니다. 어떤 부분이 궁금하신가요?\n\n1. 문제 입력 방법\n2. 힌트 요청 방법\n3. 답안 제출 방법",
			"힌트 찾기":
				"문제 해결을 위한 힌트를 찾아드릴게요. 몇 번 문제에 대한 힌트가 필요하신가요?",
			"개념 이해":
				"개념 학습을 도와드리겠습니다. 어떤 개념에 대해 궁금하신가요?\n\n예시: 함수, 배열, 반복문 등",
			"문제 해설":
				"문제 해설을 도와드리겠습니다. 몇 번 문제에 대해 설명해드릴까요?",
		};

		// 선택한 버튼에 해당하는 메시지로 대화 시작
		if (initialMessages[topic]) {
			const userMessage = {
				id: Date.now(),
				text: initialMessages[topic],
				isUser: true,
			};

			const aiMessage = {
				id: Date.now() + 1,
				text: aiResponses[topic],
				isUser: false,
			};

			setMessages([userMessage, aiMessage]);
		}
	};

	const formatMessagesForGPT = (messages) => {
		return messages.map((msg) => ({
			role: msg.isUser ? "user" : "assistant",
			content: msg.text,
		}));
	};

	const handleSendMessage = async () => {
		if (inputMessage.trim() === "" || isLoading) return;

		const newMessage = {
			id: Date.now(),
			text: inputMessage,
			isUser: true,
		};

		setMessages((prev) => [...prev, newMessage]);
		setInputMessage("");
		setIsLoading(true);

		try {
			const chatHistory = [...messages, newMessage];
			const formattedMessages = formatMessagesForGPT(chatHistory);

			/**
			 * 다음은 sheetData의 형태입니다.
			 * [
			 *   {
			 *      "번호": string;
			 *      "난이도": string;
			 *      "문제 원본 이미지": string;
			 *      "제작 문제": string;
			 *      "첫번째 힌트(ID)": string;
			 *      "첫번째 힌트(KC_AI_DT)": string;
			 *      "첫번째 힌트(코멘트)": string;
			 *      "첫번째 힌트 추가 1뎁스 (ID)": string;
			 *      "첫번째 힌트 추가 1뎁스 (KC_AI_DT)": string;
			 *      "첫번째 힌트 1뎁스(코멘트)": string;
			 *      "두번째 힌트(ID)": string;
			 *      "두번째 힌트(KC_AI_DT) ": string;
			 *      "두번째 힌트(코멘트) ": string;
			 *      "두번째 힌트 1뎁스 (ID)": string;
			 *      "두번째 힌트 1뎁스 (KC_AI_DT)": string;
			 *      "두번째 힌트 1뎁스 (코멘트) ": string;
			 *      "세번째 힌트(ID)": string;
			 *      "세번째 힌트(kc)": string;
			 *      "세번째 힌트(코멘트) ": string;
			 *      "세번째 힌트 1뎁스(ID)": string;
			 *      "세번째 힌트 1뎁스(KC_AI_DT)": string;
			 *      "세번째 힌트 1뎁스(코멘트) ": string;
			 *      "정답": string;
			 *      "출제의도(ID)": string;
			 *      "출제의도(KC_AI_DT)": string;
			 *      "출제의도(코멘트)": string;
			 *   }
			 * ]
			 */
			const sheetData = await accessSpreadsheet();
			const keyword = newMessage.text; // 사용자가 입력한 내용을 keyword로 사용
			const relevantData = sheetData.filter((data) =>
				data.column1.includes(keyword)
			);

			const systemMessage = {
				role: "system",
				content: `당신은 라이브데이터 AI 학습 도우미입니다. 
                학생들의 프로그래밍 학습을 돕고, 문제 해결 방법을 안내하며, 
                직접적인 답을 주지 않고 힌트를 통해 스스로 해결할 수 있도록 도와주세요.
                항상 친절하고 이해하기 쉽게 설명해주세요.`,
			};

			const response = await getChatCompletion([
				systemMessage,
				...formattedMessages,
			]);

			setMessages((prev) => [
				...prev,
				{
					id: Date.now(),
					text: `${response}\n\n관련 데이터:\n${JSON.stringify(
						relevantData,
						null,
						2
					)}`,
					isUser: false,
				},
			]);
		} catch (error) {
			console.error("Error:", error);
			setMessages((prev) => [
				...prev,
				{
					id: Date.now(),
					text: "죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.",
					isUser: false,
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handlePasswordChange = (e) => {
		setPassword(e.target.value);
	};

	const handleLogin = () => {
		if (password === "123456") {
			setIsAuthenticated(true);
		} else {
			alert("비밀번호가 틀렸습니다.");
		}
	};

	const handleTitleClick = () => {
		if (isAuthenticated) {
			setShowStartMenu(true);
		}
	};

	return (
		<div className="flex items-center justify-center h-screen">
			<div className="bg-white p-4 rounded-lg shadow-md h-screen w-full max-w-sm sm:max-w-md flex flex-col">
				<div className="flex-1 flex flex-col overflow-hidden">
					<h1
						className="text-center text-xl font-bold mb-4 pb-4 border-b cursor-pointer"
						onClick={handleTitleClick}
					>
						Laivdata AI
					</h1>

					{!isAuthenticated ? (
						<div className="flex flex-col items-center justify-center gap-4">
							<input
								type="password"
								value={password}
								onChange={handlePasswordChange}
								onKeyPress={(e) => e.key === "Enter" && handleLogin()}
								placeholder="비밀번호를 입력하세요"
								className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<button
								onClick={handleLogin}
								className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
							>
								로그인
							</button>
						</div>
					) : (
						<>
							{showStartMenu ? (
								// 시작 메뉴
								<div className="flex-1 flex flex-col items-center justify-center gap-4">
									<div className="text-xl mb-8 font-bold">
										무엇을 도와드릴까요?
									</div>
									<div className="grid grid-cols-2 gap-4 w-full max-w-xs">
										<button
											onClick={() => handleButtonClick("사용법")}
											className="w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50"
										>
											사용법
										</button>
										<button
											onClick={() => handleButtonClick("힌트 찾기")}
											className="w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50"
										>
											힌트 찾기
										</button>
										<button
											onClick={() => handleButtonClick("개념 이해")}
											className="w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50"
										>
											개념 이해
										</button>
										<button
											onClick={() => handleButtonClick("문제 해설")}
											className="w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50"
										>
											문제 해설
										</button>
									</div>
								</div>
							) : (
								// 채팅 인터페이스
								<>
									<div className="flex-1 overflow-y-auto px-2">
										<div className="space-y-4 py-2">
											{messages.map((message) => (
												<div
													key={message.id}
													className={`flex ${
														message.isUser ? "justify-end" : "justify-start"
													}`}
												>
													<div
														className={`max-w-[70%] rounded-lg p-3 break-words ${
															message.isUser
																? "bg-blue-500 text-white"
																: "bg-gray-100 text-gray-800"
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
									<div className="border-t pt-4 mt-4">
										<div className="flex gap-2">
											<input
												type="text"
												value={inputMessage}
												onChange={(e) => setInputMessage(e.target.value)}
												// onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
												placeholder="질문을 입력하세요"
												className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												disabled={isLoading}
											/>
											<button
												onClick={handleSendMessage}
												className={`px-4 py-2 text-white rounded-lg ${
													isLoading
														? "bg-gray-400"
														: "bg-blue-500 hover:bg-blue-600"
												}`}
												disabled={isLoading}
											>
												전송
											</button>
										</div>
									</div>
								</>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default Chat;
