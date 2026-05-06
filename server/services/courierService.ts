import Settings from '../models/Settings';
import { IOrder } from '../models/Order';
import axios from 'axios';

/**
 * Validates and sends an order to Steadfast Courier
 */
export const sendOrderToSteadfast = async (order: IOrder) => {
  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.deliverySteadfast || !settings.deliverySteadfast.enabled) {
      console.log('Steadfast Delivery is disabled or settings missing.');
      return null;
    }

    const { apiKey, secretKey, baseUrl } = settings.deliverySteadfast;

    // PART 6: VALIDATION
    // Phone must be 11 digit Bangladesh format
    const phone = order.customer.phone.replace(/\D/g, '');
    if (phone.length !== 11) {
      throw new Error('Customer phone number must be exactly 11 digits (e.g., 01XXXXXXXXX)');
    }

    // COD Amount calculation
    const codAmount = Math.round(order.totalAmount);
    if (isNaN(codAmount) || codAmount <= 0) {
      throw new Error(`Invalid COD amount: ${codAmount}`);
    }

    // Build item_description for Steadfast

    const itemDescription = order.items.map(item => {
      let desc = `${item.name} x${item.quantity}`;
      if (item.size) desc += ` [${item.size}]`;
      return desc;
    }).join(', ');

    // Build note with full order details
    const noteLines = [
      `Order #${order._id.toString().slice(-8).toUpperCase()}`,
      `---`,
      ...order.items.map((item, idx) => {
        let line = `${idx + 1}. ${item.name}`;
        if (item.size) line += ` (${item.size})`;
        line += ` | Qty: ${item.quantity} | ৳${(item.price * item.quantity).toFixed(0)}`;
        if (item.image) line += ` | Img: ${item.image}`;
        return line;
      }),
      `---`,
      `Total: ৳${codAmount}`,
      (order.discountApplied && order.discountApplied > 0) ? `Discount: -৳${order.discountApplied}` : '',
      `Payment: ${order.paymentMethod || 'COD'}`,
    ].filter(Boolean).join('\n');

    // Prepare Payload
    const payload = {
      invoice: order._id.toString(),
      recipient_name: order.customer.name,
      recipient_phone: phone,
      recipient_address: `${order.customer.address}, ${order.customer.city}`,
      cod_amount: codAmount,
      note: noteLines,
      item_description: itemDescription
    };

    console.log('Sending to Steadfast:', payload);

    const response = await axios.post(`${baseUrl}/create_order`, payload, {
      headers: {
        'Api-Key': apiKey,
        'Secret-Key': secretKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.status === 200) {
      // Success response from Steadfast
      return {
        success: true,
        consignmentId: response.data.consignment_id || '',
        trackingCode: response.data.tracking_code || '',
        data: response.data
      };
    } else {
      // API error response
      throw new Error(response.data?.message || 'Failed to create order in Steadfast');
    }

  } catch (error: any) {
    console.error('Steadfast Service Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};
