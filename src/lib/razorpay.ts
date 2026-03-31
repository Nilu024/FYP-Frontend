declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = (options: any) => {
  return new Promise((resolve, reject) => {
    try {
      if (!options.key) {
        throw new Error("No key passed - Payment gateway not configured");
      }
      
      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.success", (response: any) => {
        resolve(response);
        rzp.close();
      });
      
      rzp.on("payment.failed", (response: any) => {
        reject(response);
        rzp.close();
      });
      
      rzp.open();
    } catch (err: any) {
      reject(new Error(err.message || "Failed to open payment gateway"));
    }
  });
};
