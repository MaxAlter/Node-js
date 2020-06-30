const yargs = require("yargs");
const contacts = require("./contacts");

const argv = yargs
  .number("id")
  .string("action")
  .string("email")
  .string("name")
  .string("phone").argv;

 function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case "list":
       console.table(contacts.listContacts());
      break;

    case "get":
      contacts.getContactById(id);
      break;

    case "add":
      contacts.addContact(name, email, phone);
      break;

    case "remove":
      contacts.removeContact(id);
      break;

    default:
      console.warn("\x1B[31m Unknown action type!");
  }
}

invokeAction(argv);

// # Получаем и выводим весь список контакстов в виде таблицы (console.table)
// node index.js --action="list"

// # Получаем контакт по id
// node index.js --action="get" --id=5

// # Добавялем контакт
// node index.js --action="add" --name="Mango" --email="mango@gmail.com" --phone="322-22-22"

// # Удаляем контакт
// node index.js --action="remove" --id=3
