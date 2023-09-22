const express = require('express')
const cookieJwtAuth = require("./middleware/cookieJwtAuth");
const cookieParser = require('cookie-parser')
const cors = require('cors')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("./model/user")
const Post = require("./model/post")
const app = express()
const port = 3001
require('dotenv').config()

require("./config/database").connect()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: ["http://localhost:3000", 'https://bidimdepru.de'],
    credentials: true
}));

// Registrierung
app.post("/register", async (req, res) => {
    try {
      const { name, email, username, password } = req.body;
      // Validieren, ob Eingaben alle vorhanden sind
      if (!(name && email && username && password)) {
        return res.status(400).send("Alle Eingaben werden benötigt!");
      }
      // Check, ob User bereits existiert
      const userQuery = await User.findOne({ 'username': username });
      if (userQuery) {
        return res.status(409).send("Benutzer existiert bereits. Bitte einloggen..!");
      }
      //Passwort verschlüsseln
      encryptedPassword = await bcrypt.hash(password, 10);
      // Create user in our database
      const user = await User.create({
        name: name,
        email: email,
        username: username,
        password: encryptedPassword,
        isAdmin: false,
      });
      // Neuen User zurückgeben
      return res.status(201).json(user);
    } catch (err) {
      console.log(err);
    }
});

// Login
app.post(`/login`, async (req, res) => {
  try {
    // Eingaben extrahieren
    const { username, password } = req.body;
    // Eingaben validieren
    if (!(username && password)) {
      return res.status(400).send("Alle Eingaben werden benötigt!");
    }
    // Validieren, ob User existiert
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Token erstellen
      const token = jwt.sign(
        { user },
        "my_secret_key",
        {
          expiresIn: "2h",
        }
      );
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
      const parseUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        isAdmin: false,
      };

      return res.status(200).json({auth: true, user: parseUser});
    } else return res.status(400).send("Username/Passwort-Kombination stimmt nicht überein.");
  } catch (err) {
    console.log(err);
  }
});

// Route for creating posts
app.post("/post", cookieJwtAuth, async (req, res) => {
  try {
    const { _id, title, body , author} = req.body;
    // Validieren, ob Eingaben alle vorhanden sind
    if (!(_id && title && body)) {
      return res.status(400).send("Alle Eingaben werden benötigt!");
    }
    const post = await Post.create({
      author_id: _id,
      title: title,
      body: body,
      author: author
    });
    // Neuen User zurückgeben
    return res.status(201).json(post);
  } catch (err) {
    console.log(err);
  }
});

// Return all posts
app.get("/getPosts", cookieJwtAuth, async (req, res) => {
  try {
    const all = await Post.find({});
    return res.status(201).json(all);
    } catch (err) {
    console.log(err);
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})