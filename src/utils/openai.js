import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.REACT_APP_OPENAI_API_KEY,
	dangerouslyAllowBrowser: true,
});

export const getChatCompletion = async (messages) => {
	try {
		const completion = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: messages,
			temperature: 0.7,
			max_tokens: 1000,
		});

		return completion.choices[0].message.content;
	} catch (error) {
		console.error("OpenAI API 오류:", error);
		throw error;
	}
};

async function accessSpreadsheet() {
	const sheetId = process.env.REACT_APP_GOOGLE_SHEET_ID;
	const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
	const range = "Sheet1!A1:Z";

	const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

	try {
		console.log(apiKey);
		const response = await fetch(url);

		const result = await response.json();

		const rows = result.values;

		console.log(rows);

		const jsonDataArr = [];

		console.log("row0");
		console.log(rows[0]);

		for (let i = 1; i < rows.length; i++) {
			const jsonData = {};
			for (let j = 0; j < rows[0].length; j++) {
				const colName = rows[0][j];
				jsonData[colName] = rows[i][j];
			}
			jsonDataArr.push(jsonData);
		}

		console.log(jsonDataArr);

		return jsonDataArr;
	} catch (e) {
		console.log(e);
		throw e;
	}
}

// async function accessSpreadsheet() {
// 	console.log("Sheet ID:", process.env.REACT_APP_GOOGLE_SHEET_ID);
// 	console.log("Client Email:", process.env.REACT_APP_GOOGLE_CLIENT_EMAIL);
// 	console.log(
// 		"Private Key exists:",
// 		!!process.env.REACT_APP_GOOGLE_PRIVATE_KEY
// 	);

// 	const doc = new GoogleSpreadsheet(
// 		process.env.REACT_APP_GOOGLE_SHEET_ID,
// 		auth
// 	);

// 	//     client_email: process.env.REACT_APP_GOOGLE_CLIENT_EMAIL, // await doc.useServiceAccountAuth({ // 서비스 계정 인증
// 	//     private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
// 	// });

// 	console.log("doc auth fin");

// 	// 문서 로드
// 	await doc.loadInfo();
// 	console.log("스프레드시트 연결 성공!");
// 	console.log("스프레드시트 제목:", doc.title);

// 	const sheet = doc.sheetsByIndex[0];
// 	console.log("시트 제목:", sheet.title);

// 	const rows = await sheet.getRows();
// 	console.log("가져온 행 수:", rows.length);

// 	const data = rows.map((row) => ({
// 		column1: row.column1,
// 		column2: row.column2,
// 	}));

// 	console.log("변환된 데이터:", data);
// 	return data;
// }

export { accessSpreadsheet };
