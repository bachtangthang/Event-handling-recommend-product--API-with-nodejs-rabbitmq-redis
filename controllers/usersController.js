const { usersModel } = require("../models/index");
const { v4 } = require("uuid");

module.exports = {
  async identify(req, res) {
    try {
      const { demo_uid, portal_id } = req.body;

      if (Object.keys(demo_uid).length !== 0) {
        console.log("There is Cookie");
        return res.status(200).json({ uid: demo_uid });
      } else {
        console.log("There is no cookies");
        const uid = v4();
        const user = await usersModel.create(uid, portal_id);
        console.log(user);
        return res.status(200).json({ uid });
      }
    } catch (err) {
      let data = {
        success: false,
        message: err.message,
      };
      return res.status(500).json(data);
    }
  },
};
