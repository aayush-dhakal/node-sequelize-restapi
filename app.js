const express = require("express");

const db = require("./models");
const { User, Post } = require("./models");

const app = express();
app.use(express.json());

app.post("/users", async (req, res) => {
  const { name, email, role } = req.body;

  try {
    const user = await User.create({
      name: name,
      email: email,
      role: role,
    });

    // if the names are same then for short
    // const user=await User.create({
    //   name
    //   email,
    //   role,
    // })

    return res.json(user);
  } catch (err) {
    // customized status code error(400) for sequelize validation error
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json(err);
    }
    console.log(err);
    return res.status(500).json(err);
  }
});

// get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();

    return res.json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// get a single user
app.get("/users/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  try {
    const user = await User.findOne({
      where: { uuid: uuid },
      // or short form
      // where: { uuid}

      // if you want to include the posts of this particular user as well then
      include: [Post], // and if you want the response of posts to be in lowercase then follow the alias patter as in /posts api
    });

    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.delete("/users/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  try {
    const user = await User.findOne({
      where: { uuid },
    });

    await user.destroy();

    return res.json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.put("/users/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  const { name, email, role } = req.body;

  try {
    const user = await User.findOne({
      where: { uuid },
    });

    user.name = name;
    user.email = email;
    user.role = role;

    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.post("/posts", async (req, res) => {
  const { userUuid, body } = req.body;

  try {
    const user = await User.findOne({ where: { uuid: userUuid } });

    const post = await Post.create({ body, userId: user.id });

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// get all posts
app.get("/posts", async (req, res) => {
  try {
    // const posts = await Post.findAll(); // will fetch only posts info ie doesn't include user info
    // const posts = await Post.findAll({ include: [User] }); // will fetch posts info along with the User info as an User object
    // const posts = await Post.findAll({ include: [{ model: User, as: "user" }]}); // will fetch posts info along with the User info as an user object(with lowercase user)

    // or use the alias that is defined in Post model association
    const posts = await Post.findAll({ include: ["user"] });

    // if there is only one model then no need to put in array as well
    // const posts = await Post.findAll({ include: "user" });

    return res.json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

app.listen({ port: 5000 }, async () => {
  console.log("Server is up on port 5000");

  // execute database without use of migration
  // await db.sequelize.sync({ force: true }); // if the table already exists then force updates the existing table while alter creates an entirely new table

  // with migration use authenticate. This will not run the database command evertime the server is run but only if there is changes in the migration
  await db.sequelize.authenticate();

  console.log("Database synced!");
});
