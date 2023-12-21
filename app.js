const express = require('express')
const cookieJwtAuth = require("./middleware/cookieJwtAuth");
const cookieParser = require('cookie-parser')
const cors = require('cors')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("./model/user")
const Post = require("./model/post")
const cloudinary = require('cloudinary').v2;
const app = express()
const port = 3001
const multer = require('multer');
const streamifier = require('streamifier');
const storage = multer.memoryStorage();
const upload = multer({storage});

require('dotenv').config()

require("./config/database").connect()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: ["http://localhost:3000", 'https://bidimdepru.de'],
    credentials: true
}));

app.post('/changeAvatar', upload.single('avatarFile'), async (req, res) => {
  let cld_upload_stream = cloudinary.uploader.upload_stream(
    {
      folder: "avatar"
    },
    async function(error, result) {
        const query = { username: req.body.username };
        const public_id = result.public_id
        const foundUser = await User.findOneAndUpdate(query, { avatar: {
          pathToAvatar: result.url,
          public_id: public_id
          }});
        let oldPublic_id = foundUser.avatar.public_id
        cloudinary.uploader.destroy(oldPublic_id);
        return res.status(200).json({ pathToAvatar: result.url})
    }
    );
  streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
  });

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
        avatar: { 
          pathToAvatar: "",
          public_id: ""
          },
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
        pathToAvatar: user.avatar.pathToAvatar,
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

// Delete Post
app.post("/deletePost", cookieJwtAuth, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.body._id });
    return res.status(200).send("Post deleted!")
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