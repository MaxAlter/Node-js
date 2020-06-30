const fs = require("fs");
const path = require("path");
const { promises: fsPromises } = fs;

const contactsPath = path.join(__dirname, "./db/contacts.json");

async function _readContacts() {
  const list = await fsPromises.readFile(contactsPath, "utf-8");
  return JSON.parse(list);
}

async function listContacts() {
  try {
    const data = await _readContacts();
    console.table(data);
  } catch (err) {
    console.log(err);
  }
}

async function getContactById(contactId) {
  try {
    const contacts = await _readContacts();
    const contact = contacts.find((contact) => contact.id === contactId);
    console.table(contact);
  } catch (err) {
    console.log(err);
  }
}

async function editContacts(data) {
  try {
    return await fsPromises.writeFile(
      contactsPath,
      JSON.stringify(data, null, 2)
    );
  } catch (err) {
    console.log(err);
  }
}

async function removeContact(contactId) {
  try {
    let contacts = await fsPromises.readFile(contactsPath, "utf-8");
    contacts = JSON.parse(contacts);
    const contact = contacts.filter((contact) => contact.id !== contactId);
    console.log("delete ok");
    return editorContacts(contact);
  } catch (err) {
    console.log(err);
  }
}

async function addContact(name, email, phone) {
  try {
    let contacts = await fsPromises.readFile(contactsPath, "utf-8");
    contacts = JSON.parse(contacts);
    const newContact = { id: contacts.length + 1, name, email, phone };

    contacts.push(newContact);
    console.log(newContact);
    return editorContacts(contacts);
  } catch (err) {
    console.log(err);
  }
}


module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
