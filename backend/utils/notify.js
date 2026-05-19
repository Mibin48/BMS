const pool = require('../config/db');
const socket = require('./socket');

const genNotifId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NOTIF-${ts}-${rand}`;
};

const createNotification = async ({
  user_id,
  role,
  type,
  title,
  message,
  link = null,
  priority = 'normal'
}) => {
  try {
    const id = genNotifId();
    const notification = {
      notification_id: id,
      user_id,
      role,
      type,
      title,
      message,
      link,
      priority,
      is_read: 0,
      created_at: new Date()
    };

    await pool.query(`
      INSERT INTO Notification (
        notification_id,
        user_id,
        role,
        type,
        title,
        message,
        link,
        priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, user_id, role, type, title, message, link, priority]);

    // REAL-TIME EMIT
    socket.sendToUser(user_id, 'notification', notification);

    return id;
  } catch (err) {
    console.error('[notify] Failed:', err.message);
    return null;
  }
};

const notifyMany = async (users, payload) => {
  return Promise.allSettled(
    users.map(u => createNotification({
      ...payload,
      user_id: u.user_id,
      role: u.role
    }))
  );
};

const notifyAdmins = async (payload) => {
  try {
    const [admins] = await pool.query(`
      SELECT user_id FROM Users
      WHERE role = 'admin' AND is_active = 1
    `);
    return notifyMany(
      admins.map(a => ({ ...a, role: 'admin' })),
      payload
    );
  } catch (err) {
    console.error('[notifyAdmins] Failed:', err.message);
  }
};

const notifyInventoryAlert = async (bank_id, group, units, capacity) => {
    try {
        const ratio = units / capacity;
        const percentage = Math.round(ratio * 100);
        if (ratio > 0.15) return; // Only notify if <= 15%

        const [users] = await pool.query(
            "SELECT user_id FROM Users WHERE entity_id = ? AND role = 'bloodbank'",
            [bank_id]
        );
        
        for (const u of users) {
          await createNotification({
              user_id: u.user_id,
              role: 'bloodbank',
              type: ratio <= 0.10 ? 'low_stock_critical' : 'inventory_alert',
              title: ratio <= 0.10 ? `️🔴 CRITICAL STOCK: ${group}` : `⚠️ Low Stock: ${group}`,
              message: `Blood Group ${group} is currently at ${percentage}% capacity (${units}/${capacity} units). ${ratio <= 0.10 ? 'Please arrange a donation camp immediately.' : 'Consider the recall donor option.'}`,
              link: '/bloodbank/inventory',
              priority: ratio <= 0.10 ? 'high' : 'normal'
          });
        }
    } catch (err) {
        console.error('[notifyInventoryAlert] Failed:', err.message);
    }
};

module.exports = {
  createNotification,
  notifyMany,
  notifyAdmins,
  notifyInventoryAlert,
  genNotifId
};
