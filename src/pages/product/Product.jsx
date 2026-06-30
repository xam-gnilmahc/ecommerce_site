import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../supaBaseClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import './Product.css';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import { FiHeart } from 'react-icons/fi';
import { PiShareNetworkLight } from 'react-icons/pi';
import AdditionalInfo from '../../components/product/AdditionalInfo';
import ProductImageGallery from '../../components/product/ProductImageGallery';
import RelatedProducts from '../../components/product/RelatedProducts';
import { addToCart } from '../../redux/slice/userCart.ts';
import { useAppDispatch } from '../../redux/index.ts';
import { trackProductPreview, trackAddToCart } from '../../utils/tracking.js';
import GooglePayButton from '@google-pay/button-react';
import { fetchTotalCart } from '../../redux/slice/userCart.ts';
import { trackPurchase } from '../../utils/tracking.js';
import {
  buildPaymentRequest,
  getUpdatedPaymentData,
} from '../../components/product/GooglePlay.jsx';
import { processGooglePay } from '../../service/googlePayService.js';
import { shippingOptions } from '../../config/ShippingOptions.jsx';

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const { user, placeOrderSingle } = useAuth();
  const [paymentRequest, setPaymentRequest] = useState(null);

  // ── Inventory state ──────────────────────────────────────────────────────
  const [stockQty, setStockQty] = useState(null); // null = loading

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const addProduct = async (product) => {
    dispatch(addToCart({ userId: user?.id, product }));
    await trackAddToCart(dispatch, user?.id, product);
  };

  async function handleLoadPaymentData(paymentData) {
    setOrderLoading(true);
    try {
      // ── Re-check stock live before processing payment ──────────────────
      const { data: inventoryCheck, error: inventoryError } = await supabase
        .from('inventory')
        .select('stock_quantity')
        .eq('product_id', id)
        .single();

      const latestStock = inventoryError || !inventoryCheck ? 0 : inventoryCheck.stock_quantity;
      setStockQty(latestStock); // update badge UI too

      if (latestStock === 0) {
        toast.error('Sorry, this product is out of stock.');
        setOrderLoading(false);
        return;
      }

      const gpayShippingId = paymentData.shippingOptionData?.id;
      let shippingPrice = 0;
      let shippingMethodSelected = 'free';
      if (gpayShippingId) {
        const opt = shippingOptions.find((o) => o.id === gpayShippingId);
        if (opt) {
          shippingPrice = opt.price;
          shippingMethodSelected = gpayShippingId;
        }
      }
      const totalAmount = Number(product.amount) + shippingPrice;
      const { finalData, result } = await processGooglePay(paymentData, {
        amount: totalAmount,
        name: user?.name || user?.full_name,
        email: user?.email,
      });
      if (result.message != 'Payment successful') {
        toast.error(result?.error || 'Payment processing failed.');
        return;
      }
      const orderId = await placeOrderSingle(
        { ...finalData, payment_status: 'success', shippingMethod: shippingMethodSelected },
        result,
        product,
        quantity
      );
      if (orderId) {
        dispatch(fetchTotalCart(user.id));
        await trackPurchase(dispatch, user?.id, { id: orderId });
        toast.success('Payment processed successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setOrderLoading(false);
    }
  }

  useEffect(() => {
    if (!product || !product.amount) return;
    const newRequest = buildPaymentRequest([
      { label: product.name, price: product.amount.toString(), type: 'LINE_ITEM' },
    ]);
    setPaymentRequest(newRequest);
  }, [product]);

  // ── Fetch product ────────────────────────────────────────────────────────
  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          product_items(id, size, sku_number, color),
          product_images(id, image_url, is_primary),
          product_reviews(
            id,
            user_id,
            picture,
            comment,
            rating,
            created_at,
            users(id, name, email, profile)
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        console.error(error);
        toast.error('Failed to load product');
        setLoading(false);
        return;
      }

      setProduct(data);
      if (user) await trackProductPreview(dispatch, user.id, data);
      setLoading(false);
    };
    getProduct();
  }, [id]);

  // ── Fetch inventory for this product ────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const getInventory = async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('stock_quantity')
        .eq('product_id', id)
        .single();

      if (error || !data) {
        setStockQty(0);
      } else {
        setStockQty(data.stock_quantity);
      }
    };
    getInventory();
  }, [id]);

  const [clicked, setClicked] = useState(false);

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const sizesFullName = ['Extra Small', 'Small', 'Medium', 'Large', 'Extra Large'];
  const [selectSize, setSelectSize] = useState('S');

  const [highlightedColor, setHighlightedColor] = useState('#C8393D');
  const colors = ['#222222', '#C8393D', '#E4E4E4'];
  const colorsName = ['Black', 'Red', 'Grey'];

  const [quantity, setQuantity] = useState(1);
  const increment = () => setQuantity(quantity + 1);
  const decrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };
  const handleInputChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) setQuantity(value);
  };
  const handleWishClick = () => setClicked(!clicked);

  // ── Stock badge helper ───────────────────────────────────────────────────
  const StockBadge = () => {
    if (stockQty === null) {
      // still loading
      return (
        <div className="stockBadge stockLoading">
          <span className="stockDot" />
          Checking stock...
        </div>
      );
    }
    if (stockQty === 0) {
      return (
        <div className="stockBadge stockOut">
          <span className="stockDot" />
          Out of Stock
        </div>
      );
    }
    if (stockQty <= 10) {
      return (
        <div className="stockBadge stockLow">
          <span className="stockDot" />
          Only {stockQty} left in stock
        </div>
      );
    }
    return (
      <div className="stockBadge stockIn">
        <span className="stockDot" />
        In Stock ({stockQty} available)
      </div>
    );
  };

  const Loading = () => (
    <div className="container my-5 py-2">
      <div className="row">
        <div className="col-md-6 py-3">
          <Skeleton height={400} width={400} />
        </div>
        <div className="col-md-6 py-5">
          <Skeleton height={30} width={250} />
          <Skeleton height={90} />
          <Skeleton height={40} width={70} />
          <Skeleton height={50} width={110} />
          <Skeleton height={120} />
          <Skeleton height={40} width={110} inline={true} />
          <Skeleton className="mx-3" height={40} width={110} />
        </div>
      </div>
    </div>
  );

  const ShowProduct = () => (
    <>
      {/* Product Image + Thumbnails — Flipkart-style Gallery */}
      <div className="productGallery">
        <ProductImageGallery
          images={product.product_images || []}
          productName={product.name || ''}
          bannerUrl={product.banner_url || ''}
        />
      </div>

      {/* Product Details */}
      <div className="productDetails">
        <div className="productBreadcrumb">
          <div className="breadcrumbLink">
            <Link to="/">Home</Link>&nbsp;/&nbsp;
            <Link to="/product">The Shop</Link>
          </div>
        </div>

        <div className="productName">
          <div className="product-page-title">{product.name}</div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '100px',
          }}
        >
          <h2 className="productPrice">${product.amount}</h2>
          <p className="productRating">
            {Array.from({ length: 5 }, (_, i) => {
              const rating = product?.rating || 0;
              if (rating >= i + 1) return <i key={i} className="fa fa-star text-warning"></i>;
              if (rating >= i + 0.5)
                return <i key={i} className="fa fa-star-half-o text-warning"></i>;
              return <i key={i} className="fa fa-star-o text-warning"></i>;
            })}
            <div>({product?.rating || 0} / 5)</div>
          </p>
        </div>

        {/* ── Stock Status Badge ── */}
        <StockBadge />

        <h3 className="product-section-title">Description</h3>
        <p className="productDescription text-muted">{product.description?.substring(0, 200)}</p>

        <div className="productSizeColor">
          <div className="productSize">
            <p style={{ margin: 0 }}>Sizes</p>
            <div className="sizeBtn">
              {sizes.map((size, index) => (
                <Tooltip
                  key={size}
                  title={sizesFullName[index]}
                  placement="top"
                  TransitionComponent={Zoom}
                  enterTouchDelay={0}
                  arrow
                >
                  <button
                    style={{ borderColor: selectSize === size ? '#000' : '#e0e0e0' }}
                    onClick={() => setSelectSize(size)}
                  >
                    {size}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
          <div className="productColor">
            <p style={{ margin: 0 }}>Color</p>
            <div className="colorBtn">
              {colors.map((color, index) => (
                <Tooltip
                  key={color}
                  title={colorsName[index]}
                  placement="top"
                  enterTouchDelay={0}
                  TransitionComponent={Zoom}
                  arrow
                >
                  <button
                    className={highlightedColor === color ? 'highlighted' : ''}
                    style={{
                      backgroundColor: color.toLowerCase(),
                      border: highlightedColor === color ? '0px solid #000' : '0px solid white',
                      padding: '8px',
                      margin: '5px',
                      cursor: 'pointer',
                    }}
                    onClick={() => setHighlightedColor(color)}
                  />
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        <div className="productCartQuantity">
          <div className="productQuantity">
            <button onClick={decrement}>-</button>
            <input type="text" value={quantity} onChange={handleInputChange} />
            <button onClick={increment}>+</button>
          </div>
        </div>

        {paymentRequest && user && stockQty !== 0 && (
          <GooglePayButton
            environment="TEST"
            buttonSizeMode="fill"
            paymentRequest={paymentRequest}
            onLoadPaymentData={handleLoadPaymentData}
            onError={(error) => console.error(error)}
            onPaymentDataChanged={(paymentData) =>
              getUpdatedPaymentData(paymentRequest, paymentData)
            }
          />
        )}

        <div className="productCartBtn">
          <button
            disabled={stockQty === 0}
            onClick={() => {
              if (!user) {
                toast.error('Please login to add products to cart.');
                navigate('/login');
                return;
              }
              addProduct(product);
            }}
          >
            {stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>

        <div className="productWishShare">
          <div className="productWishList">
            <button onClick={handleWishClick}>
              <FiHeart color={clicked ? 'red' : ''} size={17} />
              <p style={{ margin: 0 }}>Add to Wishlist</p>
            </button>
          </div>
          <div className="productShare">
            <PiShareNetworkLight size={22} />
            <p style={{ margin: 0 }}>Share</p>
          </div>
        </div>

        <div className="productTags">
          <p>
            <span>SKU: </span>N/A
          </p>
          <p>
            <span>CATEGORIES: </span>Mobile , Tablet , Laptop
          </p>
          <p>
            <span>TAGS: </span>Electronics, Gadgets, Smartphone
          </p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {orderLoading && (
        <div className="payment-overlay">
          <div className="payment-loader-box">
            <div className="payment-spinner"></div>
            <h3>Processing Payment...</h3>
            <p>Please do not refresh or click anything</p>
          </div>
        </div>
      )}
      <div className="productSection">
        <div className="productShowCase">{loading ? <Loading /> : <ShowProduct />}</div>
        <div className="row">
          <AdditionalInfo product_reviews={product?.product_reviews} />
        </div>
        <RelatedProducts brand={product?.brand} category={product?.category} />
      </div>
    </>
  );
};

export default Product;
