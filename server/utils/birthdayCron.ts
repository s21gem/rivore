import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import Settings from '../models/Settings.js';
import sgMail from '@sendgrid/mail';

export const runBirthdayCron = async () => {
  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.birthdayRewardSettings?.enabled) {
      return;
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate(); // 1-31
    const currentYear = today.getFullYear();

    // Find users with a dob, and who haven't received a coupon this year
    const users = await User.find({
      dob: { $exists: true, $ne: null },
      $or: [
        { lastBirthdayCouponYear: { $ne: currentYear } },
        { lastBirthdayCouponYear: { $exists: false } }
      ]
    });

    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || settings.contactEmail || 'noreply@rivore.com';

    for (const user of users) {
      if (!user.dob) continue;

      const userDob = new Date(user.dob);
      const userMonth = userDob.getMonth() + 1;
      const userDay = userDob.getDate();

      if (userMonth === currentMonth && userDay === currentDay) {
        // It's their birthday! Generate coupon.
        const code = `BDAY-${user._id.toString().substring(0, 6).toUpperCase()}-${currentYear}`;
        
        // 7 days validity
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const newCoupon = new Coupon({
          code,
          discountType: settings.birthdayRewardSettings.discountType,
          discountAmount: settings.birthdayRewardSettings.discountAmount,
          isActive: true,
          usageCount: 0,
          customerId: user._id,
          expiresAt,
          isBirthdayCoupon: true
        });

        await newCoupon.save();

        user.lastBirthdayCouponYear = currentYear;
        await user.save();

        // Send email if configured
        if (apiKey && user.email) {
          sgMail.setApiKey(apiKey);

          const discountText = settings.birthdayRewardSettings.discountType === 'percentage' 
            ? `${settings.birthdayRewardSettings.discountAmount}% OFF` 
            : `৳${settings.birthdayRewardSettings.discountAmount} OFF`;

          const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; text-align: center;">
              <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase;">Rivor&eacute;</h1>
              
              <div style="margin: 40px 0;">
                <h2 style="color: #4f46e5; font-size: 28px; margin-bottom: 10px;">Happy Birthday! 🎉</h2>
                <p style="color: #334155; line-height: 1.6; font-size: 16px;">
                  Hello ${user.fullName || 'there'},<br>
                  We hope your special day brings you all that your heart desires!
                </p>
                <p style="color: #334155; line-height: 1.6; font-size: 16px;">
                  As a special gift from us to you, please enjoy a birthday treat:
                </p>
                
                <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 30px; margin: 30px auto; max-width: 300px;">
                  <div style="font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 10px;">${discountText}</div>
                  <div style="font-size: 14px; color: #64748b; margin-bottom: 15px;">Your exclusive coupon code:</div>
                  <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 20px; font-weight: bold; color: #4f46e5; letter-spacing: 2px;">
                    ${code}
                  </div>
                  <div style="font-size: 12px; color: #94a3b8; margin-top: 15px;">Valid for 7 days.</div>
                </div>

                <a href="${process.env.FRONTEND_URL || 'https://rivore.com'}/shop" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; letter-spacing: 0.05em;">Treat Yourself</a>
              </div>

              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
                  Thank you for being part of the Rivor&eacute; family.<br>
                  Crafted with Elegance.
                </p>
              </div>
            </div>
          `;

          const msg = {
            to: user.email,
            from: fromEmail,
            subject: 'A Birthday Gift For You! 🎉 - Rivoré',
            html,
          };

          try {
            await sgMail.send(msg);
            console.log(`Birthday email sent to ${user.email}`);
          } catch (error) {
            console.error('Error sending birthday email:', error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in birthday cron:', error);
  }
};

// Setup interval to run once a day (every 24 hours)
export const initBirthdayCron = () => {
  // Run immediately on startup
  runBirthdayCron();
  
  // Then run every 24 hours
  setInterval(() => {
    runBirthdayCron();
  }, 24 * 60 * 60 * 1000);
};
