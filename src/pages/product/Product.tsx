import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supaBaseClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import './Product.css';
import ProductImageGallery from '../../components/product/ProductImageGallery';
import { useAddToCart } from '../../tanstack/cart.ts';
import { usePlaceOrderSingle } from '../../tanstack/orders.ts';
import { trackProductPreview, trackAddToCart, trackPurchase } from '../../tanstack/tracking.ts';
import GooglePayButton from '@google-pay/button-react';
import {
  buildPaymentRequest,
  getUpdatedPaymentData,
} from '../../components/product/GooglePlay.tsx';
import { processGooglePay } from '../../services/googlePayService.ts';
import { shippingOptions } from '../../config/ShippingOptions.ts';

const Product = () => {
  const { id } = useParams();
  const [orderLoading, setOrderLoading] = useState(false);
  const { user } = useAuth();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [quantity] = useState(1);
  const placeOrderSingleMutation = usePlaceOrderSingle();

  // ── Fetch product (TanStack Query) ───────────────────────────────────────
  const { data: product, isLoading: loading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
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
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // ── Inventory state ──────────────────────────────────────────────────────
  const [stockQty, setStockQty] = useState(null); // null = loading

  const navigate = useNavigate();
  const addCartMutation = useAddToCart();

  const addProduct = async (product) => {
    addCartMutation.mutate({ userId: user?.id, product });
    await trackAddToCart(user?.id, product);
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
      const orderId = await placeOrderSingleMutation.mutateAsync({
        userId: user.id,
        userName: user.full_name || user.name,
        userEmail: user.email,
        data: { ...finalData, payment_status: 'success', shippingMethod: shippingMethodSelected },
        stripe: result,
        product,
        quantity,
      });
      if (orderId) {
        trackPurchase(user?.id, { id: orderId }).catch(() => {});
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

  // ── Track product preview after data loads ───────────────────────────────
  useEffect(() => {
    if (product && user) {
      trackProductPreview(user.id, product);
    }
  }, [product, user]);

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

  const Loading = () => (
    <>
      {/* Details — LEFT column */}
      <div className="productDetails">
        <div className="productName">
          <Skeleton height={26} width="75%" />
        </div>

        <div className="priceRow">
          <Skeleton height={26} width={110} />
        </div>

        <div className="productCartBtn">
          <Skeleton height={64} />
        </div>

        <Skeleton height={48} />
      </div>

      {/* Gallery — RIGHT column */}
      <div className="productGallery">
        <div className="pig-gallery">
          <div className="pig-main">
            <div className="pig-main-image">
              <Skeleton width="100%" height="clamp(360px, 62vh, 680px)" />
            </div>
          </div>
          <div className="pig-dots">
            <Skeleton width={9} height={9} borderRadius="50%" />
            <Skeleton width={9} height={9} borderRadius="50%" />
            <Skeleton width={9} height={9} borderRadius="50%" />
          </div>
        </div>
      </div>
    </>
  );

  const ShowProduct = () => (
    <>
      {/* Product Details — LEFT column */}
      <div className="productDetails">
        <div className="productName">
          <div className="product-page-title">{product.name}</div>
        </div>

        <div className="priceRow">
          <h2 className="productPrice">${product.amount}</h2>
        </div>

        {/* ADD TO CART — big black CTA */}
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

        {/* Google Pay — single button */}
        {paymentRequest && user && stockQty !== 0 && (
          <GooglePayButton
            environment="TEST"
            buttonSizeMode="fill"
            paymentRequest={paymentRequest}
            onLoadPaymentData={handleLoadPaymentData}
            onError={(error) => console.error(error)}
            onPaymentDataChanged={
              ((paymentData: any) => getUpdatedPaymentData(paymentRequest, paymentData)) as any
            }
          />
        )}
      </div>

      {/* Product Gallery — RIGHT column */}
      <div className="productGallery">
        <ProductImageGallery
          images={product.product_images || []}
          productName={product.name || ''}
          bannerUrl={product.banner_url || ''}
        />
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
      </div>
    </>
  );
};

export default Product;
