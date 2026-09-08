import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter product title'],
    trim: true,
    maxlength: [120, 'Product title cannot exceed 120 characters']
  },
  description: {
    type: String,
    required: [true, 'Please enter product description']
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please select product category'],
    enum: {
      values: [
        'Electronics',
        'Audio',
        'Fashion',
        'Home & Living',
        'Gadgets',
        'Books',
        'Accessories',
        'General'
      ],
      message: 'Please select a valid category'
    }
  },
  brand: {
    type: String,
    default: 'Lumina'
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock count'],
    default: 10,
    min: [0, 'Stock cannot be negative']
  },
  rating: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  numReviews: {
    type: Number,
    default: 0
  },
  images: [
    {
      url: {
        type: String,
        required: true
      },
      public_id: {
        type: String,
        required: true
      }
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ProductSchema.index({ title: 'text', description: 'text', brand: 'text' });

const Product = mongoose.model('Product', ProductSchema);
export default Product;
