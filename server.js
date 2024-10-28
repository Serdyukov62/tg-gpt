require("dotenv").config();

const { default: axios } = require("axios");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const { refreshToken } = require("./refreshToken");



// Middleware для обработки JSON
app.use(express.json());
refreshToken();
setInterval(refreshToken, 1800000);

// Обработка GET-запроса
app.get("/", (req, res) => {
  res.send("Hello, Skitterok!");
});

app.post("/api/query", async (req, res) => {
  const userInput = req.body.query;

  try {
    const response = await axios.post(
      "https://gigachat.devices.sberbank.ru/api/v1/chat/completions",
      {
        model: "GigaChat",
        stream: false,
        update_interval: 0,
        messages: [
          {
            role: "system",
            content: "Отвечай как научный сотрудник",
          },
          {
            role: "user",
            content: `${userInput}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send("Error communicating with the API");
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
