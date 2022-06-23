const { usersModel } = require("../models/index");
const cookieParser = require("cookie-parser");
const { v4: uuidv4, v4 } = require("uuid");

const COOKIE_NAME = "demo_uid";
module.exports = {
  async identify(req, res) {
    try {
      const { demo_uid, portal_id } = req.body;
      console.log(demo_uid);
      console.log(portal_id);
      if (Object.keys(demo_uid).length !== 0) {
        console.log("There is Cookie");
        return res.status(200).json({ uid: demo_uid });
      } else {
        console.log("There is no cookies");
        const uid = v4();
        //luu xuong database
        const user = await usersModel.create(uid, portal_id);
        console.log(user);
        return res.status(200).json({ uid });
      }
      //tra uid ve cho browser
      //browser luu uid vao trong cookie
    } catch (err) {
      console.log(err);
    }
  },
};
