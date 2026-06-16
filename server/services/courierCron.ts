import cron from 'node-cron';
import Order from '../models/Order';
import { checkSteadfastStatus } from './courierService';

// Maps Steadfast status strings to Rivore local Order statuses
const statusMap: Record<string, string> = {
  'pending': 'Processing',
  'picked_up': 'Courier Received',
  'in_transit': 'In Transit',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled'
};

export const startCourierCron = () => {
  // Run every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    console.log('[CRON] Starting Courier Status Sync...');
    try {
      // Find orders that have been sent to courier but are not yet delivered or cancelled
      const activeOrders = await Order.find({
        'delivery.status': 'sent',
        status: { $nin: ['Delivered', 'Cancelled'] }
      });

      console.log(`[CRON] Found ${activeOrders.length} orders to check.`);

      for (const order of activeOrders) {
        if (!order.delivery?.consignmentId) continue;

        try {
          const result = await checkSteadfastStatus(order.delivery.consignmentId);
          if (result?.success && result.delivery_status) {
            const mappedStatus = statusMap[result.delivery_status];
            
            // Only update if we have a valid mapping and it's a change
            if (mappedStatus && mappedStatus !== order.status) {
              console.log(`[CRON] Updating Order ${order._id} from ${order.status} to ${mappedStatus}`);
              order.status = mappedStatus;
              await order.save();
            }
          }
        } catch (err) {
          console.error(`[CRON] Error checking order ${order._id}:`, err);
        }
        
        // Sleep 1s to avoid hitting courier API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('[CRON] Courier Status Sync Completed.');
    } catch (error) {
      console.error('[CRON] Error during Courier Status Sync:', error);
    }
  });

  console.log('[CRON] Courier Sync Background Task Registered (Runs every 2 hours).');
};
