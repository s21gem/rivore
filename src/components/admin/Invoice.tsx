import React from 'react';

interface InvoiceProps {
  order: any;
  mode: 'a4' | 'thermal';
}

export default function Invoice({ order, mode }: InvoiceProps) {
  if (!order) return null;

  const date = new Date(order.createdAt).toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' });

  // Thermal / POS Layout
  if (mode === 'thermal') {
    return (
      <div className="print-only invoice-pos">
        <div className="text-center pb-2 mb-2 border-b border-dashed border-[#ccc]">
          <h1 className="mb-1">RIVORÉ</h1>
          <p className="text-[9px] uppercase tracking-wider">Premium Fragrances</p>
          <p>Dhaka, Bangladesh</p>
          <p>www.rivore.com</p>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between">
            <span className="font-bold">Order ID:</span>
            <span>{order._id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Date:</span>
            <span>{date.split(',')[0]}</span>
          </div>
          <div className="border-t border-dashed border-[#ccc] my-1 pt-1">
            <p className="font-bold uppercase">Customer Details:</p>
            <p>{order.customer.name}</p>
            <p>{order.customer.phone}</p>
            <p className="mt-0.5">
              {order.customer.address}, {order.customer.city}
            </p>
          </div>
        </div>

        <table className="w-full text-left mb-2 border-t border-dashed border-[#ccc] pt-1 mt-1 border-collapse">
          <thead>
            <tr className="border-b border-dashed border-[#ccc]">
              <th className="pb-1 pt-1 font-bold w-[70%]">Item</th>
              <th className="pb-1 pt-1 font-bold text-center w-[10%]">Q</th>
              <th className="pb-1 pt-1 font-bold text-right w-[20%]">Tk</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any, idx: number) => (
              <tr key={idx}>
                <td className="py-1 pr-1 break-words leading-tight">{item.name}</td>
                <td className="py-1 text-center align-top font-bold">{item.quantity}</td>
                <td className="py-1 text-right align-top">{(item.price * item.quantity).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-[#ccc] pt-1 pb-1 mb-4">
          <div className="flex justify-between font-bold text-[13px]">
            <span>TOTAL:</span>
            <span>৳{order.totalAmount.toFixed(0)}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Payment:</span>
            <span className="font-bold">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between mt-0.5">
            <span>Status:</span>
            <span>{order.paymentStatus || 'Pending'}</span>
          </div>
        </div>

        <div className="text-center text-[9px] mt-4 pb-2 border-t border-dashed border-[#ccc] pt-2">
          <p className="font-bold mb-0.5">Thank you!</p>
          <p>Please preserve this receipt.</p>
        </div>
      </div>
    );
  }

  // A4 Standard Layout
  return (
    <div className="print-only invoice-a4">
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-4xl font-serif tracking-widest uppercase font-bold mb-1">RIVORÉ</h1>
        <p className="text-gray-600 text-sm tracking-[0.2em] uppercase font-semibold">Premium Fragrances</p>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-wider text-black mb-1">INVOICE</h2>
          <p className="font-bold text-black text-lg">#{order._id.slice(-8).toUpperCase()}</p>
          <p className="text-gray-600 font-medium">{date}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-1">Company Info</p>
          <p className="font-bold text-black">RIVORÉ</p>
          <p className="text-gray-600">Dhaka, Bangladesh</p>
          <p className="text-gray-600">contact@rivore.com</p>
        </div>
      </div>

      <div className="flex gap-16 mb-12">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-2 border-b border-gray-300 pb-1">Billed To</p>
          <p className="font-bold text-lg text-black">{order.customer.name}</p>
          <p className="text-black font-medium mt-1">{order.customer.phone}</p>
          {order.customer.email && <p className="text-gray-700">{order.customer.email}</p>}
          <div className="mt-2 text-gray-800 leading-relaxed">
             <p>{order.customer.address}</p>
             <p>{order.customer.city}, {order.customer.zip || ''}</p>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-2 border-b border-gray-300 pb-1">Order Details</p>
          <table className="w-full text-left text-sm">
             <tbody>
                <tr>
                   <td className="py-1.5 text-gray-600 font-medium">Order Status:</td>
                   <td className="py-1.5 font-bold text-black text-right uppercase">{order.status}</td>
                </tr>
                <tr>
                   <td className="py-1.5 text-gray-600 font-medium">Payment Method:</td>
                   <td className="py-1.5 font-bold text-black text-right">{order.paymentMethod}</td>
                </tr>
                <tr>
                   <td className="py-1.5 text-gray-600 font-medium">Payment Status:</td>
                   <td className="py-1.5 font-bold text-black text-right">{order.paymentStatus || 'Pending'}</td>
                </tr>
             </tbody>
          </table>
        </div>
      </div>

      <table className="w-full text-left mb-12 border-collapse">
        <thead>
          <tr className="border-b-2 border-black text-black">
            <th className="py-3 font-bold uppercase tracking-wider text-xs">Description</th>
            <th className="py-3 font-bold uppercase tracking-wider text-xs text-center w-[15%]">Type</th>
            <th className="py-3 font-bold uppercase tracking-wider text-xs text-center w-[15%]">Qty</th>
            <th className="py-3 font-bold uppercase tracking-wider text-xs text-right w-[15%]">Price</th>
            <th className="py-3 font-bold uppercase tracking-wider text-xs text-right w-[20%]">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item: any, idx: number) => (
            <tr key={idx} className="border-b border-gray-300">
              <td className="py-4 font-bold text-black">{item.name}</td>
              <td className="py-4 text-center text-gray-700 capitalize text-sm">{item.type}</td>
              <td className="py-4 text-center font-bold text-black text-base">{item.quantity}</td>
              <td className="py-4 text-right text-gray-700 font-medium">৳{item.price.toFixed(2)}</td>
              <td className="py-4 text-right font-bold text-black text-base">৳{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end border-t-2 border-black pt-6">
        <div className="w-[40%]">
          <div className="flex justify-between mb-3 text-gray-700">
            <span className="font-bold uppercase tracking-wider text-sm">Subtotal</span>
            <span className="font-bold text-black">৳{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xl font-black mt-4 pt-4 border-t border-gray-300">
            <span className="uppercase tracking-widest text-black">Total</span>
            <span className="text-black">৳{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-20 pt-6 border-t border-gray-300 text-center text-gray-500 text-xs tracking-widest font-medium uppercase page-break">
        <p className="mb-2">Thank you for choosing Rivoré.</p>
        <p className="text-black font-bold">CRAFTED WITH ELEGANCE.</p>
      </div>
    </div>
  );
}
