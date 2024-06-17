import User from '../models/user.model.js'
import Admin from '../models/admin.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'
import extend from 'lodash/extend.js'

const userProjections = {
  '_id': false,
  '__v': false,
  'hashed_password': false,
  'salt': false
}

const create = async (req, res) => {
  let user, userExist;

  if(req.body.role == 'admin'){
    user = new Admin(req.body);
    userExist = await Admin.findOne({'username': req.body.username});
  } else {
    user = new User(req.body);
    userExist = await User.findOne({'username': req.body.username});
  }

  if(userExist){
    return res.status(500).json({
        error: 'Username already exist'
    });
  }

  try {
    await user.save()
    return res.status(200).json({
      message: 'Successfully signed up'
    })
  } catch (err){
    return res.status(500).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const read = async (req, res) => {
  const user = await User.findOne({username : req.params.username}, userProjections)

  return res.status(200).json(user)
}

const userById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userid)
    req.profile = user
    next()
  } catch (err) {
    return res.status(500).json({
      error: errorHandler.getErrorMessage(err)
    })
  } 
}



export default {
  create,
  read,
  userById
}