const { Configuration, OpenAIApi } = require("openai");
const express = require('express') ;
const cors = require('cors');
require('dotenv').config();

const configuration = new Configuration({
    organization : process.env.ORGANIZATION ,
    apiKey : process.env.API_KEY ,
});
const openai = new OpenAIApi(configuration);


const app = express() ;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}))
const port = 3080 ;

app.post('/' , async (req , res) =>{
    const {message , currentModel} = req.body ;
    console.log(message , "message") ;
    console.log(currentModel , "currentModel") ;
    if (currentModel.startsWith("gpt-3.5")){
        const messages = [];
        for (let i = 0; i < message.length; i++) {
            if (message[i].user === "me") {
                messages.push({ role: "user", content: message[i].message });
            } else {
                messages.push({ role: "assistant", content: message[i].message });
            }
        }
        const response = await openai.createChatCompletion({
        model:  `${currentModel}`,
        messages:messages ,
        max_tokens: 300,
        temperature: 0.5,
        });
      console.log(response.data.choices[0].message.content) ;
      res.json({
        message : response.data.choices[0].message.content,
      });
    }else {
        const response = await openai.createCompletion({
        model: `${currentModel}`,
        prompt: `${message[message.length - 1].message}`,
        max_tokens: 100,
        temperature: 0.5,
      });
      console.log(response.data.choices[0].text) ;
      res.json({
        message : response.data.choices[0].text,
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

app.listen(port , () =>{
    console.log(`App is listening at http://localhost:${port}`) ;
}) ;