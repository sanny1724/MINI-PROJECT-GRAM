import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Dish description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Dish price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Dish category is required'],
      enum: ['starters', 'mains', 'desserts', 'beverages'],
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isGlutenFree: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
