"use client";

import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { ShoppingBag } from "lucide-react";

// Components
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import MenuTab from "./components/tabs/MenuTab";
import OrdersTab from "./components/tabs/OrdersTab";
import ProfileTab from "./components/tabs/ProfileTab";

// Modals
import CartModal from "./components/modals/CartModal";
import SuccessModal from "./components/modals/SuccessModal";
import PageLoading from "../components/ui/PageLoading";
import {
  EditProfileModal,
  AddressesModal,
  AddAddressModal,
  LogoutModal,
} from "./components/modals/ProfileModals";
import ProductDetailSheet from "./components/modals/ProductDetailSheet";

// Types
import { Product, CartItem, Order, Promo, Category, Address } from "./types";

// Type untuk Supabase realtime payload
interface OrderUpdatePayload {
  new: Order;
}

// ==================== HELPER FUNCTIONS (Di luar component) ====================

// Validate checkout requirements
function validateCheckout(
  cart: CartItem[],
  customerName: string,
  customerPhone: string,
  orderType: "pickup" | "delivery",
  selectedAddressId: string | null,
  setIsEditProfileOpen: (value: boolean) => void,
) {
  if (cart.length === 0) {
    return { valid: false, error: "empty_cart" };
  }

  if (!customerName || !customerPhone) {
    toast.error("Profil belum lengkap!", {
      description:
        "Mohon lengkapi Nama dan Nomor WhatsApp untuk melanjutkan pemesanan.",
      duration: 4000,
    });
    setIsEditProfileOpen(true);
    return { valid: false, error: "profile_incomplete" };
  }

  if (orderType === "delivery" && !selectedAddressId) {
    toast.error("Mohon pilih alamat pengiriman.");
    return { valid: false, error: "no_address" };
  }

  return { valid: true, error: null };
}

// Check product stock
async function checkProductStock(cart: CartItem[]) {
  const { data: productsInCart, error: productError } = await supabase
    .from("products")
    .select("id, name, stock")
    .in(
      "id",
      cart.map((item) => item.id),
    );

  if (productError) throw new Error(productError.message);
  if (!productsInCart || productsInCart.length !== cart.length) {
    throw new Error("Some products not found.");
  }

  for (const item of cart) {
    const product = productsInCart.find((p) => p.id === item.id);
    if (!product) throw new Error(`Produk "${item.name}" tidak ditemukan!`);

    const currentStock = product.stock || 0;
    if (currentStock < item.quantity) {
      throw new Error(`Stok "${item.name}" habis! (Sisa: ${currentStock})`);
    }
  }
}

// Create order in database
async function createOrder(
  userId: string | undefined,
  customerName: string,
  customerPhone: string,
  orderType: "pickup" | "delivery",
  finalAddress: string,
  cart: CartItem[],
  cartTotal: number,
) {
  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      customer_name: customerName,
      customer_phone: customerPhone,
      order_type: orderType,
      address: finalAddress,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        note: item.note || "",
      })),
      total_amount: cartTotal,
      status: "new",
    })
    .select("id")
    .single();

  if (orderError) throw new Error(orderError.message);
  if (!newOrder) throw new Error("Failed to create order.");

  return newOrder.id;
}

// Update product stock
async function updateProductStock(cart: CartItem[]) {
  const { error: stockUpdateError } = await supabase.rpc(
    "decrement_stock_bulk",
    {
      items: cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    },
  );

  if (stockUpdateError) {
    console.error("Stock update failed:", stockUpdateError);
  }
}

// Save pending order to localStorage
function savePendingOrder(
  orderId: string,
  cart: CartItem[],
  cartTotal: number,
  orderType: "pickup" | "delivery",
  finalAddress: string,
) {
  localStorage.setItem(
    "pendingOrder",
    JSON.stringify({
      orderId,
      items: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        note: item.note,
      })),
      total: cartTotal,
      orderType: orderType,
      address: orderType === "delivery" ? finalAddress : "Ambil di Kasir",
    }),
  );
}

// ==================== MAIN COMPONENT ====================

export default function CustomerApp() {
  const {
    user,
    profile,
    loading: authLoading,
    signOut,
    refreshProfile,
  } = useAuth();
  const [activeTab, setActiveTab] = useState<"menu" | "status" | "profile">(
    "menu",
  );
  const router = useRouter();

  // 1. Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // UI States (Modals)
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedProductForDetail, setSelectedProductForDetail] =
    useState<Product | null>(null);

  // Form States
  const customerName = profile?.full_name ?? "Pelanggan";
  const [activeCategory, setActiveCategory] = useState("all");
  const customerPhone = profile?.phone ?? "";
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [orderRefresher, setOrderRefresher] = useState(0);

  // --- Cart State ---
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load Cart from LocalStorage
  useEffect(() => {
    if (!user?.id) return;

    const key = `cart_${user.id}`;
    const savedCart = localStorage.getItem(key);

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart) as CartItem[]);
      } catch (e) {
        console.error("Failed to parse cart from local storage", e);
      }
    } else {
      setCart([]);
    }
  }, [user?.id]);

  // Save Cart to LocalStorage
  useEffect(() => {
    if (!user?.id) return;
    const key = `cart_${user.id}`;
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, user?.id]);

  // --- Fetch My Orders ---
  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching my orders:", error);
        toast.error("Gagal memuat pesanan Anda.");
      } else if (data) {
        setMyOrders(data as Order[]);
      }
    };

    fetchMyOrders();

    // Realtime Subscription for Orders
    const orderChannel = supabase
      .channel("my_orders_updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload: OrderUpdatePayload) => {
          const updatedOrder = payload.new;
          console.log("Order update received!", payload);
          setOrderRefresher((prev) => prev + 1);

          if (updatedOrder.status === "processing") {
            toast.success("Pesanan Anda sedang diproses!");
          } else if (updatedOrder.status === "ready") {
            toast.success("Pesanan siap diambil/diantar!");
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
    };
  }, [user, orderRefresher]);

  // --- Fetch Products (Realtime) ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("name", { ascending: true });

        if (error) throw error;
        if (data) setProducts(data as Product[]);
      } catch (error) {
        console.error("Error fetching products:", error);
        if (loading) toast.error("Gagal memuat menu.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    const channel = supabase
      .channel("public:products_customer")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          console.log("[CustomerApp] Product update received");
          fetchProducts();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loading]);

  // --- Fetch Promos ---
  useEffect(() => {
    const fetchPromos = async () => {
      const { data, error } = await supabase
        .from("promos")
        .select("*")
        .eq("is_active", true);

      if (!error && data) {
        setPromos(
          data.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            image: p.image_url,
            badge: p.badge || "PROMO",
            color: p.color_gradient || "from-amber-400 to-amber-600",
            product_id: p.product_id || undefined,
          })),
        );
      }
    };

    fetchPromos();

    const promoChannel = supabase
      .channel("public:promos_customer")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "promos" },
        () => {
          console.log("[CustomerApp] Promo update received!");
          fetchPromos();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(promoChannel);
    };
  }, []);

  // --- Fetch Addresses ---
  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    setLoadingAddresses(true);
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    if (error) {
      console.error("Error fetching addresses:", error);
    } else {
      setAddresses(data || []);
      if (data && data.length > 0) {
        const def = data.find((a) => a.is_default);
        setSelectedAddressId(def ? def.id : data[0].id);
      } else {
        setSelectedAddressId(null);
      }
    }
    setLoadingAddresses(false);
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // --- Fetch Categories ---
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  // --- Cart Functions ---
  const addToCart = (product: Product, quantity = 1, note?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.note === note,
      );

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity,
        };
        return newCart;
      }

      return [...prev, { ...product, quantity, note }];
    });
    toast.success(`${product.name} telah masuk keranjang!`, {
      icon: <ShoppingBag className="text-amber-500" size={16} />,
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- Checkout (REFACTORED) ---
  const handleCheckout = async () => {
    const validation = validateCheckout(
      cart,
      customerName,
      customerPhone,
      orderType,
      selectedAddressId,
      setIsEditProfileOpen,
    );

    if (!validation.valid) return;

    setIsPageLoading(true);

    try {
      const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
      const finalAddress =
        orderType === "delivery" ? selectedAddress?.detail || "" : "";

      await checkProductStock(cart);
      const orderId = await createOrder(
        user?.id,
        customerName,
        customerPhone,
        orderType,
        finalAddress,
        cart,
        cartTotal,
      );
      await updateProductStock(cart);
      savePendingOrder(orderId, cart, cartTotal, orderType, finalAddress);

      setCart([]);
      setIsCartOpen(false);
      setOrderRefresher((prev) => prev + 1);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push("/payment");
    } catch (error) {
      console.error("Gagal Checkout:", error);
      toast.error("Gagal memproses pesanan", {
        description: error instanceof Error ? error.message : "Unknown error",
        duration: 5000,
      });
    } finally {
      setIsPageLoading(false);
    }
  };

  // --- Filter ---
  const filteredProducts = products.filter(
    (p) => activeCategory === "all" || p.category === activeCategory,
  );

  // Auth loading
  if (authLoading || (!user && !authLoading)) {
    return <PageLoading isOpen={true} message="Memproses autentikasi..." />;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white font-sans selection:bg-amber-400 selection:text-stone-900 overflow-x-hidden">
      <Navbar
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="max-w-xl mx-auto bg-stone-950 relative min-h-screen pb-32">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-amber-600/10 to-transparent pointer-events-none" />

        {activeTab === "menu" && (
          <MenuTab
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            filteredProducts={filteredProducts}
            loading={loading}
            addToCart={(product) => setSelectedProductForDetail(product)}
            promos={promos}
            categories={categories}
            customerName={customerName}
            onPromoClick={(promo) => {
              if (promo.product_id) {
                const product = products.find((p) => p.id === promo.product_id);
                if (product) {
                  setSelectedProductForDetail(product);
                } else {
                  toast.error("Produk promo tidak ditemukan");
                }
              }
            }}
          />
        )}

        {activeTab === "status" && (
          <OrdersTab myOrders={myOrders} setActiveTab={setActiveTab} />
        )}

        {activeTab === "profile" && (
          <ProfileTab
            setIsEditProfileOpen={setIsEditProfileOpen}
            setIsAddressesOpen={setIsAddressesOpen}
            setIsLogoutOpen={setIsLogoutModalOpen}
            setActiveTab={setActiveTab}
            profile={profile}
            userEmail={user?.email}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myOrders={myOrders}
        profile={profile}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        cartTotal={cartTotal}
        onCheckout={handleCheckout}
        orderType={orderType}
        setOrderType={setOrderType}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
        onManageAddresses={() => {
          setIsCartOpen(false);
          setIsAddressesOpen(true);
        }}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          setActiveTab("status");
        }}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={profile}
        onUpdate={refreshProfile}
      />

      <AddressesModal
        isOpen={isAddressesOpen}
        onClose={() => setIsAddressesOpen(false)}
        onAddNew={() => {
          setAddressToEdit(null);
          setIsAddressesOpen(false);
          setIsAddAddressOpen(true);
        }}
        addresses={addresses}
        loading={loadingAddresses}
        onEdit={(addr) => {
          setAddressToEdit(addr);
          setIsAddressesOpen(false);
          setIsAddAddressOpen(true);
        }}
        onRefresh={fetchAddresses}
        userId={user?.id}
      />

      <AddAddressModal
        isOpen={isAddAddressOpen}
        onClose={() => setIsAddAddressOpen(false)}
        onBack={() => {
          setIsAddAddressOpen(false);
          setIsAddressesOpen(true);
          setAddressToEdit(null);
        }}
        onSuccess={fetchAddresses}
        userId={user?.id}
        addressToEdit={addressToEdit}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          await signOut();
          toast.success("Berhasil keluar.");
          setIsLogoutModalOpen(false);
        }}
      />

      <PageLoading isOpen={isPageLoading} />

      <ProductDetailSheet
        key={selectedProductForDetail?.id || "none"}
        isOpen={!!selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        product={selectedProductForDetail}
        onAddToCart={addToCart}
      />
    </div>
  );
}
