const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;
const password = "Sup3rSecur3";

bcrypt
  .genSalt(SALT_ROUNDS)
  .then(salt => bcrypt.hash(password, salt))
  .then(hashedPassword => console.log(hashedPassword));

function compare(plainTextPassword, hashedPassword) {
  bcrypt
    .compare(plainTextPassword, hashedPassword)
    .then(matches => console.log(matches));
}
