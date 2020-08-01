const Joi = require('@hapi/joi');
const bcryptjs = require('bcryptjs');
const usersModel = require('./users.model');
const jwt = require('jsonwebtoken');
const validation = require('../validation/validation');