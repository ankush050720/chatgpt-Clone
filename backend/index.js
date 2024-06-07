const { Configuration, OpenAIApi } = require("openai");
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const configuration = new Configuration({
    organization : process.env.ORGANIZATION ,
    apiKey : process.env.API_KEY ,
});
const openai = new OpenAIApi(configuration);

const frontendDomain = 'https://ankj-chatgpt-client.onrender.com';
const corsOptions = {
  origin: frontendDomain,
};

const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/openai-community/gpt2';
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3080;

app.get('/' , async (req, res) => {
   res.send("Everything is working fine") ;
});

// app.post('/' , async (req , res) =>{
//     const {message , currentModel} = req.body ;
//     console.log(message , "message") ;
//     console.log(currentModel , "currentModel") ;
//     if (currentModel.startsWith("gpt-3.5")){
//         const messages = [];
//         for (let i = 0; i < message.length; i++) {
//             if (message[i].user === "me") {
//                 messages.push({ role: "user", content: message[i].message });
//             } else {
//                 messages.push({ role: "assistant", content: message[i].message });
//             }
//         }
//         const response = await openai.createChatCompletion({
//         model:  `${currentModel}`,
//         messages:messages ,
//         max_tokens: 300,
//         temperature: 0.5,
//         });
//       console.log(response.data.choices[0].message.content) ;
//       res.json({
//         message : response.data.choices[0].message.content,
//       });
//     }else {
//         const response = await openai.createCompletion({
//         model: `${currentModel}`,
//         prompt: `${message[message.length - 1].message}`,
//         max_tokens: 100,
//         temperature: 0.5,
//       });
//       console.log(response.data.choices[0].text) ;
//       res.json({
//         message : response.data.choices[0].text,
//       });
//     }
// });

app.post('/', async (req, res) => {
    const { message, currentModel } = req.body;
    console.log(message, "message");
    console.log(currentModel, "currentModel");

    const userMessage = message[message.length - 1].message;

    try {
        const response = await axios.post(
            HUGGING_FACE_API_URL,
            { inputs: userMessage },
            {
                headers: {
                    Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
                },
            }
        );

        const botResponse = response.data && response.data[0] && response.data[0].generated_text ? response.data[0].generated_text : "Sorry, I couldn't understand that.";
        console.log(botResponse, "botResponse");

        res.json({
            message: botResponse,
        });
    } catch (error) {
        console.error('Error communicating with Hugging Face API:', error.response ? error.response.data : error.message);
        res.status(500).json({
            message: "Error communicating with Hugging Face API",
        });
    }
});

app.get('/models' , async (req , res) =>{
    const response = await openai.listModels();
    // console.log(response.data.data) ;
    res.json({
        models:response.data.data ,
    });
});

app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
});
