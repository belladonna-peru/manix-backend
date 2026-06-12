import { getAlerts } from "./alerts.service.js";

const listAlerts = async (req, res) => {
  try {
    const alerts = await getAlerts(req.user.id);

    res.json(alerts);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export { listAlerts };