const fs = require("fs");
const path = require("path");
const { promises: fsPromises } = fs;

const contactsPath = path.join(__dirname, "./db/contacts.json");
async function listContacts() {
  try {
    const data = await fsPromises.readFile(contactsPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.log(err);
  }
}

async function getContactById(contactId) {
  try {
    const contacts = await listContacts();
    const contact = contacts.find((contact) => contact.id === contactId);
    return JSON.parse(contact);
  } catch (err) {
    console.log(err);
  }
}

async function editorContacts(data) {
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
