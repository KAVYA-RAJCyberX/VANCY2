/**
 * Vercel Cron endpoint: POST /api/cron/abandoned-carts
 * Scheduled hourly via vercel.json crons config.
 * Protected by CRON_SECRET header to prevent public invocation.
 */

const express = require('express');
const router = express.Router();
const runAbandonedCartJob = require('../../utils/cronJobs');

router.post('/abandoned-carts', async (req, res) => {
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const result = await runAbandonedCartJob();
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error('Abandoned cart cron error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
