/**
 * Abandoned Cart Notification Handler
 *
 * Previously ran via node-cron inside the Express process (not viable on Vercel serverless).
 * Now exported as a standalone async function to be called by a Vercel Cron HTTP endpoint.
 *
 * Usage: POST /api/cron/abandoned-carts  (secured by CRON_SECRET header)
 * Vercel cron entry in server/vercel.json:
 *   { "path": "/api/cron/abandoned-carts", "schedule": "0 * * * *" }
 */

const Cart = require('../models/Cart');
const Notification = require('../models/Notification');

const runAbandonedCartJob = async () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Find carts that belong to a user, have items, and were last updated > 24 hours ago
  const abandonedCarts = await Cart.find({
    user: { $exists: true, $ne: null },
    items: { $not: { $size: 0 } },
    updatedAt: { $lt: twentyFourHoursAgo }
  });

  let notified = 0;
  for (const cart of abandonedCarts) {
    // Check if we already sent an abandoned cart notification recently
    const recentNotif = await Notification.findOne({
      user: cart.user,
      type: 'promo',
      title: 'You left something behind!',
      createdAt: { $gte: twentyFourHoursAgo }
    });

    if (!recentNotif) {
      await Notification.create({
        user: cart.user,
        title: 'You left something behind!',
        message: 'Your cart is waiting. Complete your purchase now and use code COMEBACK-10 for 10% off!',
        type: 'promo',
        actionUrl: '/cart'
      });
      notified++;
    }
  }

  return { checked: abandonedCarts.length, notified };
};

module.exports = runAbandonedCartJob;
