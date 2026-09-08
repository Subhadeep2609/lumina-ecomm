import Product from '../models/Product.js';

// @desc    Get all products with Search, Filtering, Sorting, and Pagination
// @route   GET /api/v1/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const resPerPage = Number(req.query.limit) || 8;
    const currentPage = Number(req.query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    // 1. Build Query Filter Object
    const queryObj = {};

    // Search keyword in title, description, or brand
    if (req.query.keyword && req.query.keyword.trim() !== '') {
      const keywordRegex = { $regex: req.query.keyword.trim(), $options: 'i' };
      queryObj.$or = [
        { title: keywordRegex },
        { description: keywordRegex },
        { brand: keywordRegex }
      ];
    }

    // Category filter
    if (req.query.category && req.query.category !== 'All' && req.query.category !== 'All Categories') {
      queryObj.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) queryObj.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) queryObj.price.$lte = Number(req.query.maxPrice);
    }

    // In-Stock filter
    if (req.query.inStock === 'true') {
      queryObj.stock = { $gt: 0 };
    }

    // Rating filter
    if (req.query.minRating) {
      queryObj.rating = { $gte: Number(req.query.minRating) };
    }

    // 2. Determine Sorting
    let sortQuery = '-createdAt';
    const sortOption = req.query.sortBy || req.query.sort;
    if (sortOption) {
      switch (sortOption) {
        case 'price_asc':
        case 'price':
          sortQuery = 'price';
          break;
        case 'price_desc':
        case '-price':
          sortQuery = '-price';
          break;
        case 'newest':
        case '-createdAt':
          sortQuery = '-createdAt';
          break;
        case 'oldest':
        case 'createdAt':
          sortQuery = 'createdAt';
          break;
        case 'rating_desc':
        case '-rating':
          sortQuery = '-rating';
          break;
        case 'name_asc':
          sortQuery = 'title';
          break;
        default:
          sortQuery = sortOption;
      }
    }

    // 3. Total matching documents count & paginated result query
    const totalProducts = await Product.countDocuments(queryObj);
    const products = await Product.find(queryObj)
      .sort(sortQuery)
      .limit(resPerPage)
      .skip(skip)
      .populate('user', 'name email role');

    const totalPages = Math.ceil(totalProducts / resPerPage) || 1;

    return res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages,
      page: currentPage,
      limit: resPerPage,
      products
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/v1/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('user', 'name email role');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new Product
// @route   POST /api/v1/products
// @access  Private (Seller, Admin)
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, brand, stock, images } = req.body;

    if (!title || !description || price === undefined || !category) {
      return res.status(400).json({ success: false, message: 'Please provide title, description, price, and category.' });
    }

    const defaultImage = {
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      public_id: 'default_prod'
    };

    const finalImages = images && images.length > 0 ? images : [defaultImage];

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      brand: brand || 'Lumina',
      stock: Number(stock || 10),
      images: finalImages,
      user: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Product
// @route   PUT /api/v1/products/:id
// @access  Private (Seller owner or Admin)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let product = await Product.findById(id);

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.user.role !== 'admin' && product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product.' });
    }

    product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Product
// @route   DELETE /api/v1/products/:id
// @access  Private (Seller owner or Admin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.user.role !== 'admin' && product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product.' });
    }

    await product.deleteOne();

    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard product stats
// @route   GET /api/v1/products/stats/summary
// @access  Private (Admin, Seller)
export const getProductStats = async (req, res) => {
  try {
    const list = await Product.find();

    const totalProducts = list.length;
    const outOfStock = list.filter(p => p.stock === 0).length;
    const categoriesCount = new Set(list.map(p => p.category)).size;
    const avgPrice = list.reduce((acc, p) => acc + p.price, 0) / (totalProducts || 1);

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        outOfStock,
        categoriesCount,
        avgPrice: avgPrice.toFixed(2)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
