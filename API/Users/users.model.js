const mongoose = require("mongoose");
// const { token } = require("morgan");
const Schema = mongoose.Schema;

const usersSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarURL: { type: String },
  subscription: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  token: String,
});

usersSchema.statics.findUserByIdAndUpdate = findUserByIdAndUpdate;
usersSchema.statics.findUserByEmail = findUserByEmail;
usersSchema.statics.updateToken = updateToken;

async function updateToken(id, newToken) {
  return this.findByIdAndUpdate(id, { token: newToken });
}

async function findUserByEmail(email) {
  return this.findOne({ email });
}

async function findUserByIdAndUpdate(userId, updatedParams) {
  return this.findByIdAndUpdate(
    userId,
    {
      $set: updatedParams,
    },
    { new: true }
  );
}

const usersModel = mongoose.model("Users", usersSchema, "users");

module.exports = usersModel;
