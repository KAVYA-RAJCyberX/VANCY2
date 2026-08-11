const cron = require('node-cron');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');

const initCronJobs = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Find carts that belong to a user, have items, and were last updated > 24 hours ago
      // Actually, Cart model uses timestamps: true, so we can use updatedAt
      const abandonedCarts = await Cart.find({
        user: { $exists: true, $ne: null },
        items: { $not: { $size: 0 } },
        updatedAt: { $lt: twentyFourHoursAgo }
      });

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
        }
      }
    } catch (error) {
      console.error('Error running abandoned cart cron job:', error);
    }
  });
};

module.exports = initCronJobs;
