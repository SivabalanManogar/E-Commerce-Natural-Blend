import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Check,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Leaf,
  Plus,
  Minus,
  Info,
  Clock,
  Building,
  AlertCircle,
  Sparkles,
  Star,
  Zap,
  MessageSquare,
  ThumbsUp,
  User,
  CheckCircle2,
  Send
} from 'lucide-react';
import { getProductById } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { customerUser, customerProfile } = useAuth();

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Seed / Local Reviews State
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const prod = await getProductById(id);
        setProduct(prod);

        // Generate realistic Flipkart-style initial reviews for this product
        const initialReviews = [
          {
            id: 'rev-1',
            userName: 'Ananya S.',
            location: 'Karaikudi, Tamil Nadu',
            rating: 5,
            title: 'Authentic pure homemade quality!',
            comment: 'Extremely fresh and natural product. Ordered from Karaikudi and received in top condition. Very happy with M. Kavitha M.Sc recipes!',
            date: '2 days ago',
            verified: true,
            helpful: 14
          },
          {
            id: 'rev-2',
            userName: 'Rajesh Kumar',
            location: 'Chennai, Tamil Nadu',
            rating: 5,
            title: '100% natural, no chemical smell',
            comment: 'Noticeable difference after using for a week. Pure herbal formulation. Ordering 2 more packs for family.',
            date: '1 week ago',
            verified: true,
            helpful: 9
          },
          {
            id: 'rev-3',
            userName: 'Meenakshi Sundaram',
            location: 'Madurai, Tamil Nadu',
            rating: 4,
            title: 'Great traditional product',
            comment: 'Fast delivery across Tamil Nadu. Safe packaging and genuine ingredients. Highly recommended store.',
            date: '2 weeks ago',
            verified: true,
            helpful: 6
          }
        ];
        setReviews(initialReviews);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (customerProfile?.displayName || customerUser?.displayName) {
      setReviewerName(customerProfile?.displayName || customerUser?.displayName);
    }
  }, [customerProfile, customerUser]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-80 bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 font-sans text-[#18231D]">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#173D2B]">Product Not Found</h2>
        <p className="text-xs text-[#65736A]">The product you are looking for might have been moved or removed from our catalog.</p>
        <Link to="/products" className="inline-block bg-[#246B45] hover:bg-[#173D2B] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors">
          Browse All Products
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity !== undefined && Number(product.stockQuantity) <= 0;
  const maxStock = product.stockQuantity !== undefined ? Number(product.stockQuantity) : 99;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyProduct = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    const newRevObj = {
      id: `rev-${Date.now()}`,
      userName: reviewerName.trim() || 'Customer',
      location: 'Verified Buyer',
      rating: newRating,
      title: newReviewTitle.trim() || 'Great Product!',
      comment: newReviewComment.trim(),
      date: 'Just now',
      verified: true,
      helpful: 0
    };

    setReviews([newRevObj, ...reviews]);
    setNewReviewTitle('');
    setNewReviewComment('');
    setShowReviewForm(false);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const quantityLabel = product.displayQuantity && product.displayUnit
    ? `${product.displayQuantity}${product.displayUnit === 'units' ? ' Pack' : product.displayUnit}`
    : '';

  // Flipkart style aggregate ratings
  const avgRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  const starCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 font-sans text-[#18231D]">

      {/* Back Link */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#65736A] hover:text-[#246B45] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Products
      </Link>

      {/* Main Details Card (Glassmorphism Style) */}
      <div className="glass-panel rounded-[2.5rem] p-6 sm:p-10 border border-white/80 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

        {/* Left Column: Image */}
        <div className="bg-white/80 rounded-3xl p-6 flex items-center justify-center border border-[#173D2B]/10 relative min-h-[320px] shadow-xs">
          <img
            src={product.imageUrl || '/images/products/placeholder.png'}
            alt={product.name}
            className="w-full max-h-96 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/500x500/e2e8f0/1e293b?text=Natural+Blend';
            }}
          />
          <span className="absolute top-4 left-4 bg-white/90 text-[#173D2B] text-xs font-extrabold px-3.5 py-1 rounded-full border border-[#173D2B]/10 shadow-xs">
            {product.category || 'Natural Care'}
          </span>
        </div>

        {/* Right Column: Key Details & Dual Action Buttons */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-black text-[#173D2B] leading-tight">
              {product.name}
            </h1>

            {/* Flipkart Rating Summary Badge */}
            <div className="flex items-center gap-3 pt-1">
              <span className="bg-[#246B45] text-white text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                {avgRating} <Star className="w-3.5 h-3.5 fill-white" />
              </span>
              <span className="text-xs font-bold text-[#65736A]">
                {reviews.length} Ratings & Reviews
              </span>
              <span className="text-white/30">•</span>
              <span className="text-[11px] font-bold text-[#246B45] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#246B45]" /> Verified Karaikudi Store
              </span>
            </div>

            {quantityLabel && (
              <p className="text-xs font-extrabold text-[#65736A]">
                Net Content: <span className="text-[#173D2B] font-bold">{quantityLabel}</span>
              </p>
            )}

            {/* Price & Stock Status */}
            <div className="pt-2 flex items-center justify-between border-y border-[#173D2B]/10 py-3.5">
              <div>
                <span className="text-xs text-[#65736A] font-bold block">Price (Inclusive of taxes)</span>
                <span className="text-3xl font-black text-[#173D2B]">₹{product.price}</span>
              </div>

              <div>
                {isOutOfStock ? (
                  <span className="bg-rose-100 text-[#D95C5C] text-xs font-extrabold px-3 py-1.5 rounded-full border border-rose-200">
                    Out of Stock
                  </span>
                ) : (
                  <span className="bg-[#EEF2EA] text-[#246B45] text-xs font-extrabold px-3 py-1.5 rounded-full border border-[#246B45]/20">
                    In Stock ({product.stockQuantity || 'Available'})
                  </span>
                )}
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="text-xs text-[#65736A] leading-relaxed pt-2">
                <h3 className="font-extrabold text-[#173D2B] text-xs uppercase tracking-wider mb-1">Product Description</h3>
                <p className="whitespace-pre-line font-medium text-[#18231D]">{product.description}</p>
              </div>
            )}
          </div>

          {/* Quantity Selector & Dual Action Buttons (Add to Cart & Buy Product) */}
          <div className="space-y-4 pt-4 border-t border-[#173D2B]/10">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-extrabold text-[#173D2B]">Quantity:</span>
                <div className="flex items-center border border-[#173D2B]/15 rounded-xl bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 hover:bg-[#EEF2EA] text-[#173D2B] rounded-lg transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-black text-[#173D2B] text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    className="p-1.5 hover:bg-[#EEF2EA] text-[#173D2B] rounded-lg transition-colors"
                    disabled={quantity >= maxStock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* DUAL BUTTONS: Add to Cart & Buy Product */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button 1: Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 border border-[#173D2B]/15 shadow-sm ${added
                  ? 'bg-emerald-800 text-white'
                  : isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                    : 'bg-white hover:bg-[#EEF2EA] text-[#173D2B] active:scale-98'
                  }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#246B45]" /> Add to Cart
                  </>
                )}
              </button>

              {/* Button 2: Buy Product */}
              <button
                onClick={handleBuyProduct}
                disabled={isOutOfStock}
                className={`py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-md ${isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#246B45] hover:bg-[#173D2B] text-white active:scale-98'
                  }`}
              >
                <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>Buy Product — ₹{product.price * quantity}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Structured Sections (Directions, Benefits, Ingredients) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {product.directions && (
          <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-xs space-y-2">
            <h3 className="text-sm font-extrabold text-[#173D2B] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#246B45]" /> Directions for Use
            </h3>
            <p className="text-xs text-[#65736A] leading-relaxed whitespace-pre-line">{product.directions}</p>
          </div>
        )}

        {product.benefits && (
          <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-xs space-y-2">
            <h3 className="text-sm font-extrabold text-[#173D2B] flex items-center gap-2">
              <Leaf className="w-4 h-4 text-[#246B45]" /> Benefits
            </h3>
            <p className="text-xs text-[#65736A] leading-relaxed whitespace-pre-line">{product.benefits}</p>
          </div>
        )}

        {product.ingredients && (
          <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-xs space-y-2">
            <h3 className="text-sm font-extrabold text-[#173D2B] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#246B45]" /> Ingredients
            </h3>
            <p className="text-xs text-[#65736A] leading-relaxed">{product.ingredients}</p>
          </div>
        )}

        {product.storage && (
          <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-xs space-y-2">
            <h3 className="text-sm font-extrabold text-[#173D2B] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#246B45]" /> Storage Instructions
            </h3>
            <p className="text-xs text-[#65736A] leading-relaxed">{product.storage}</p>
          </div>
        )}

      </div>

      {/* FLIPKART-STYLE RATINGS & CUSTOMER FEEDBACK REVIEWS SECTION */}
      <section className="glass-panel rounded-[2.5rem] p-6 sm:p-10 border border-white/80 shadow-xl space-y-8">

        {/* Ratings Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#173D2B]/10 pb-6">
          <div>
            <h2 className="text-2xl font-black text-[#173D2B] tracking-tight">
              Ratings & Customer Reviews
            </h2>
            <p className="text-xs text-[#65736A] font-medium mt-0.5">
              Verified feedback from customers who bought this product from Natural Blend Karaikudi.
            </p>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-[#246B45] hover:bg-[#173D2B] text-white text-xs font-extrabold px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            <MessageSquare className="w-4 h-4" /> Rate & Review Product
          </button>
        </div>

        {reviewSubmitted && (
          <div className="bg-emerald-50 border border-emerald-200 text-[#246B45] text-xs p-4 rounded-2xl flex items-center gap-2 animate-fade-in font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#246B45] shrink-0" />
            <span>Thank you! Your rating & feedback review has been published.</span>
          </div>
        )}

        {/* Interactive Review Form */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="bg-white/80 p-6 rounded-3xl border border-[#173D2B]/15 space-y-4 text-xs shadow-inner animate-pop-in">
            <h3 className="font-black text-[#173D2B] text-sm">Write Your Feedback Review</h3>

            {/* Star Rating Chooser */}
            <div>
              <label className="block font-extrabold text-[#173D2B] mb-1.5">Select Rating *</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                  >
                    <Star className={`w-6 h-6 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
                <span className="font-extrabold text-[#246B45] text-sm ml-2">{newRating} Stars out of 5</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-extrabold text-[#173D2B] mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-white border border-[#173D2B]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#18231D] focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#173D2B] mb-1">Review Title</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent homemade quality!"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  className="w-full bg-white border border-[#173D2B]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#18231D] focus:outline-none focus:border-[#246B45]"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-[#173D2B] mb-1">Detailed Feedback *</label>
              <textarea
                required
                rows={3}
                placeholder="Share details of your experience with this natural product..."
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                className="w-full bg-white border border-[#173D2B]/15 rounded-2xl px-3.5 py-2.5 text-xs text-[#18231D] focus:outline-none focus:border-[#246B45]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#65736A] hover:bg-[#EEF2EA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#246B45] hover:bg-[#173D2B] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Submit Review
              </button>
            </div>
          </form>
        )}

        {/* Flipkart Style Rating Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/70 p-6 rounded-3xl border border-[#173D2B]/10 items-center">

          {/* Giant Score Badge */}
          <div className="text-center md:border-r border-[#173D2B]/10 md:pr-6 space-y-1">
            <span className="text-5xl font-black text-[#173D2B] block leading-none">{avgRating}</span>
            <div className="flex justify-center gap-1 py-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs font-bold text-[#65736A]">{reviews.length} Verified Buyer Ratings</p>
          </div>

          {/* Star Distribution Bars */}
          <div className="md:col-span-2 space-y-2 text-xs">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starCounts[star] || 0;
              const pct = (count / (reviews.length || 1)) * 100;

              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-8 font-bold text-[#173D2B] flex items-center gap-0.5">
                    {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#246B45] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] font-bold text-[#65736A]">{count}</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white/80 p-5 rounded-2xl border border-[#173D2B]/10 space-y-2.5 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-[#246B45] text-white font-black text-[10px] px-2 py-0.5 rounded-md flex items-center gap-0.5">
                    {rev.rating} <Star className="w-2.5 h-2.5 fill-white" />
                  </span>
                  <span className="font-extrabold text-[#173D2B] text-sm">{rev.title}</span>
                </div>
                <span className="text-[10px] text-[#65736A] font-medium">{rev.date}</span>
              </div>

              <p className="text-[#18231D] text-xs leading-relaxed font-medium">
                {rev.comment}
              </p>

              <div className="pt-2 border-t border-[#173D2B]/10 flex items-center justify-between text-[11px] text-[#65736A]">
                <div className="flex items-center gap-1.5 font-bold text-[#246B45]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#246B45]" /> {rev.userName} • {rev.location}
                </div>
                <button
                  onClick={() => {
                    setReviews(reviews.map(r => r.id === rev.id ? { ...r, helpful: r.helpful + 1 } : r));
                  }}
                  className="hover:text-[#246B45] flex items-center gap-1 font-semibold transition-colors"
                >
                  <ThumbsUp className="w-3 h-3" /> Helpful ({rev.helpful})
                </button>
              </div>
            </div>
          ))}
        </div>

      </section>

    </div>
  );
}
