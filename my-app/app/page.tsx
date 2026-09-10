import CustomerApp from "./customer/CustomerApp";
import { DesktopBlocker } from "./components/DesktopBlocker";

export default function Home() {
  return (
    <>
      {/* 1. DESKTOP BLOCKER (Visible only on PC/Laptop > 1024px) */}
      <DesktopBlocker />

      {/* 2. CUSTOMER CONTENT (Visible only on Mobile/Tablet) */}
      <div className="customer-content min-h-screen bg-stone-950 flex justify-center">
        <CustomerApp />
      </div>
    </>
  );
}
