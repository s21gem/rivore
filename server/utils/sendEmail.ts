import sgMail from '@sendgrid/mail';

export const sendOrderConfirmationEmail = async (order: any, settings: any) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || settings?.contactEmail || 'noreply@rivore.com';

  if (!apiKey) {
    console.log('SendGrid API key not configured. Skipping confirmation email.');
    return;
  }

  if (!order.customer.email) {
    console.log('No customer email provided. Skipping confirmation email.');
    return;
  }

  sgMail.setApiKey(apiKey);

  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #334155;">
        ${item.name} <span style="color: #94a3b8; font-size: 0.8em;">${item.type !== 'product' ? `(${item.type})` : ''}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #334155;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-weight: 500;">৳${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase;">Rivor&eacute;</h1>
        <p style="color: #64748b; font-size: 13px; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.05em;">Order Confirmation</p>
      </div>

      <p style="color: #334155; line-height: 1.6;">Hello <strong>${order.customer.name}</strong>,</p>
      <p style="color: #334155; line-height: 1.6;">Thank you for shopping with us! Your order <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> has been successfully received and is now being processed.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 30px 0; font-size: 14px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Item</th>
            <th style="padding: 12px 10px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Qty</th>
            <th style="padding: 12px 10px; text-align: right; border-bottom: 2px solid #e2e8f0; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 15px 10px 5px; text-align: right; color: #64748b;">Subtotal</td>
            <td style="padding: 15px 10px 5px; text-align: right; color: #334155;">৳${order.totalAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 5px 10px; text-align: right; color: #64748b; border-bottom: 1px solid #e2e8f0;">Shipping</td>
            <td style="padding: 5px 10px; text-align: right; color: #334155; border-bottom: 1px solid #e2e8f0;">৳0.00</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: 600; color: #0f172a; font-size: 16px;">Total Expected</td>
            <td style="padding: 15px 10px; text-align: right; font-weight: 600; color: #0f172a; font-size: 16px;">৳${order.totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Order Details</h3>
        <p style="color: #334155; margin-bottom: 5px; font-size: 14px;"><strong>Shipping Address:</strong><br>
        ${order.customer.address}<br>${order.customer.city} ${order.customer.zip}</p>
        <p style="color: #334155; margin-bottom: 0; font-size: 14px;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://rivore.com'}/track" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; letter-spacing: 0.05em;">Track Your Order</a>
        <p style="color: #64748b; font-size: 12px; margin-top: 15px;">Use your phone number (${order.customer.phone}) to track</p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
          If you have any questions, please contact us at <a href="mailto:${settings?.contactServiceEmail || 'support@rivore.com'}" style="color: #4f46e5; text-decoration: none;">${settings?.contactServiceEmail || 'support@rivore.com'}</a>.<br>
          ${settings?.invoiceFooter || 'Thank you for choosing Rivor&eacute;. Crafted with Elegance.'}
        </p>
      </div>
    </div>
  `;

  const msg = {
    to: order.customer.email,
    from: fromEmail,
    subject: `Order Confirmation #${order._id.toString().slice(-6).toUpperCase()} - Rivoré`,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Confirmation email sent to ${order.customer.email}`);
  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};
