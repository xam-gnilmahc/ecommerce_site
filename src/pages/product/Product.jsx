import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../supaBaseClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import { FiHeart } from 'react-icons/fi';
import { PiShareNetworkLight } from 'react-icons/pi';
import AdditionalInfo from '../../components/product/AdditionalInfo';
import ProductImageGallery from '../../components/product/ProductImageGallery';
import RelatedProducts from '../../components/product/RelatedProducts';
import { addToCart } from '../../redux/slice/userCart.ts';
import { useAppDispatch } from '../../redux/index.ts';
import { trackProductPreview, trackAddToCart } from '../../utils/tracking.ts';
import GooglePayButton from '@google-pay/button-react';
import { fetchTotalCart } from '../../redux/slice/userCart.ts';
import { trackPurchase } from '../../utils/tracking.ts';
import {
  buildPaymentRequest,
  getUpdatedPaymentData,
} from '../../components/product/GooglePlay.tsx';
import { processGooglePay } from '../../service/googlePayService.ts';
import { shippingOptions } from '../../config/ShippingOptions.ts';

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const { user, placeOrderSingle } = useAuth();
  const [paymentRequest, setPaymentRequest] = useState(null);

  const [stockQty, setStockQty] = useState(null);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const addProduct = async (product, qty = 1) => {
    dispatch(addToCart({ userId: user?.id, product, quantity: qty }));
    await trackAddToCart(dispatch, user?.id, product);
  };

  async function handleLoadPaymentData(paymentData) {
    setOrderLoading(true);
    try {
      const { data: inventoryCheck, error: inventoryError } = await supabase
        .from('inventory')
        .select('stock_quantity')
        .eq('product_id', id)
        .single();

      const latestStock = inventoryError || !inventoryCheck ? 0 : inventoryCheck.stock_quantity;
      setStockQty(latestStock);

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

  const StockBadge = () => {
    if (stockQty === null) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold w-fit bg-gray-100 text-gray-400 border border-gray-200">
          <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0 animate-pulse" />
          Checking stock...
        </div>
      );
    }
    if (stockQty === 0) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold w-fit bg-red-50 text-red-700 border border-red-200">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          Out of Stock
        </div>
      );
    }
    if (stockQty <= 10) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold w-fit bg-orange-50 text-orange-600 border border-orange-200">
          <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 animate-pulse" />
          Only {stockQty} left in stock
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold w-fit bg-green-50 text-green-700 border border-green-200">
        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 animate-pulse" />
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
      <div className="flex-1 flex flex-col items-stretch pt-8 min-w-0">
        <ProductImageGallery
          images={product.product_images || []}
          productName={product.name || ''}
          bannerUrl={product.banner_url || ''}
        />
      </div>

      <div className="flex-1 flex flex-col gap-4 bg-white p-4 md:p-6 lg:p-8 rounded-xl border border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Link to="/" className="no-underline text-gray-500 text-sm font-medium uppercase hover:text-gray-900">Home</Link>
            <span className="text-gray-500 text-sm font-medium uppercase">/&nbsp;</span>
            <Link to="/product" className="no-underline text-gray-500 text-sm font-medium uppercase hover:text-gray-900">The Shop</Link>
          </div>
        </div>

        <div>
          <div className="text-xl m-0 text-gray-900 font-medium leading-tight block break-words overflow-hidden text-ellipsis">
            {product.name}
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900 m-0">${product.amount}</h2>
          <p className="flex gap-2 items-center text-amber-500 m-0">
            {Array.from({ length: 5 }, (_, i) => {
              const rating = product?.rating || 0;
              if (rating >= i + 1) return <i key={i} className="fa fa-star text-warning"></i>;
              if (rating >= i + 0.5)
                return <i key={i} className="fa fa-star-half-o text-warning"></i>;
              return <i key={i} className="fa fa-star-o text-warning"></i>;
            })}
            <div className="text-sm text-gray-500 ml-1">({product?.rating || 0} / 5)</div>
          </p>
        </div>

        <StockBadge />

        <h3 className="my-2 mx-0 text-base font-semibold text-gray-900">Description</h3>
        <p className="text-base leading-relaxed text-gray-500 m-0 mb-4">{product.description?.substring(0, 200)}</p>

        <div className="flex gap-6 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <p className="m-0">Sizes</p>
            <div className="flex gap-2">
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
                    className="bg-white border py-2 px-3 cursor-pointer rounded-sm font-medium text-gray-900 text-sm hover:border-gray-300 hover:bg-gray-50"
                    style={{ borderColor: selectSize === size ? '#000' : '#e0e0e0' }}
                    onClick={() => setSelectSize(size)}
                  >
                    {size}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="m-0">Color</p>
            <div className="flex gap-2 items-center">
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
                    className="w-8 h-8 rounded-full border-2 p-0 cursor-pointer transition-colors duration-200 hover:border-gray-900"
                    style={{
                      backgroundColor: color.toLowerCase(),
                      border: highlightedColor === color ? '2px solid #000' : '2px solid #e5e7eb',
                      padding: '8px',
                      margin: '5px',
                    }}
                    onClick={() => setHighlightedColor(color)}
                  />
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 md:gap-6 items-center flex-wrap mt-1">
          <div className="flex border border-gray-200 rounded-sm overflow-hidden">
            <button className="bg-white border-none py-2 px-3 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50" onClick={decrement}>-</button>
            <input className="w-12 text-center border-none border-l border-r border-gray-200 font-semibold text-sm" type="text" value={quantity} onChange={handleInputChange} />
            <button className="bg-white border-none py-2 px-3 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50" onClick={increment}>+</button>
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

        <div>
          <button
            className={`py-3 px-6 md:px-10 w-full font-semibold text-white border-none rounded-md cursor-pointer transition-colors duration-200 text-sm md:text-base ${
              stockQty === 0
                ? 'bg-gray-300 cursor-not-allowed hover:bg-gray-300'
                : 'bg-gray-900 hover:bg-gray-800'
            }`}
            disabled={stockQty === 0}
            onClick={() => {
              if (!user) {
                toast.error('Please login to add products to cart.');
                navigate('/login');
                return;
              }
              addProduct(product, quantity);
            }}
          >
            {stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>

        <div className="flex gap-6 mt-4 items-center">
          <div>
            <button className="bg-transparent border-none flex gap-2 items-center cursor-pointer text-sm uppercase text-gray-500 transition-colors duration-200 hover:text-gray-900" onClick={handleWishClick}>
              <FiHeart color={clicked ? 'red' : ''} size={17} />
              <p className="m-0">Add to Wishlist</p>
            </button>
          </div>
          <div className="bg-transparent border-none flex gap-2 items-center cursor-pointer text-sm uppercase text-gray-500 transition-colors duration-200 hover:text-gray-900">
            <PiShareNetworkLight size={22} />
            <p className="m-0">Share</p>
          </div>
        </div>

        <div>
          <p className="my-1 mx-0 text-gray-500 text-sm">
            <span className="font-semibold text-gray-900">SKU: </span>N/A
          </p>
          <p className="my-1 mx-0 text-gray-500 text-sm">
            <span className="font-semibold text-gray-900">CATEGORIES: </span>Mobile , Tablet , Laptop
          </p>
          <p className="my-1 mx-0 text-gray-500 text-sm">
            <span className="font-semibold text-gray-900">TAGS: </span>Electronics, Gadgets, Smartphone
          </p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-stock {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {orderLoading && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-[99999] flex items-center justify-center pointer-events-all">
          <div className="text-center text-white">
            <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full mx-auto mb-6" style={{ animation: 'spin 1s linear infinite' }}></div>
            <h3>Processing Payment...</h3>
            <p>Please do not refresh or click anything</p>
          </div>
        </div>
      )}
      <div className="px-4 py-4 md:px-6 lg:px-8 bg-transparent">
        <div className="flex gap-8 items-start max-w-7xl mx-auto flex-col md:flex-row">
          {loading ? <Loading /> : <ShowProduct />}
        </div>
        <div className="row">
          <AdditionalInfo product_reviews={product?.product_reviews} />
        </div>
        <RelatedProducts brand={product?.brand} category={product?.category} />
      </div>
    </>
  );
};

export default Product;
