import mongoose from 'mongoose'

export default () => {
  return mongoose.Types.ObjectId().toHexString()
}
