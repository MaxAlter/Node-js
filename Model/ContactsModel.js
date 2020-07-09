const fs = require("fs");
const path = require("path");
const { promises: fsPromises } = fs;

const contactsPath = path.join(__dirname, "../db/contacts.json");

class ContactsModel {
  listContacts = async () => {
    const List = await fsPromises.readFile(contactsPath, "utf-8");

    return JSON.parse(List);
  };

  getContactById = async (contactId) => {
    const List = await this.listContacts();
    const targetContact = List.find((user) => user.id === contactId);

    return targetContact;
  };

  removeContact = async (contactId) => {
    const List = await this.listContacts();

    const targetContact = List.findIndex((contact) => contact.id === contactId);

    if (targetContact === -1) {
      return false;
    }

    contactsList.splice(targetContact, 1);

    await fsPromises.writeFile(contactsPath, JSON.stringify(contactsList));

    return true;
  };

  addContact = async (candidateContact) => {
    const List = await this.listContacts();

    const newContact = {
      ...candidateContact,
      id: List.length + 1,
    };

    await fsPromises.writeFile(
      contactsPath,
      JSON.stringify([...List, newContact])
    );

    return newContact;
  };

  updateContact = async (id, updatedFields) => {
    const List = await this.listContacts();

    const targetContact = List.findIndex((contact) => contact.id === id);

    if (targetContact === -1) {
      return null;
    }

    const updatedContact = {
      ...List[targetContact],
      ...updatedFields,
    };

    List[targetContact] = updatedContact;

    await fsPromises.writeFile(contactsPath, JSON.stringify(List));

    return updatedContact;
  };
}

module.exports = new ContactsModel();
