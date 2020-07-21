import mongoose, { mongo } from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { OrderStatus } from '@bevticketing/common'

interface OrderAttrs {
  id: string
  status: OrderStatus
  version: number
  userId: string
  price: number
}

interface OrderDoc extends mongoose.Document {
  status: OrderStatus
  version: number
  userId: string
  price: number
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc
  findByIdAndPreviousVersion(event: { id: string; version: number }): Promise<OrderDoc>
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)

orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.findByIdAndPreviousVersion = (event: { id: string; version: number }) => {
  return Order.findOne({ _id: event.id, version: event.version - 1 })
}

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    status: attrs.status,
    userId: attrs.userId,
    price: attrs.price,
  })
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
