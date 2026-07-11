import { getWalletWithHistory, rechargeWallet, payBusiness, donateToStreamer, redeemCoins, sendMoney } from "./wallet.service.js";

export const send = async (req, res) => {
  try {
    const result = await sendMoney({ userId: req.user.id, ...req.body });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const myWallet = async (req, res) => {
  try {
    const wallet = await getWalletWithHistory(req.user.id);
    res.json(wallet);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const recharge = async (req, res) => {
  try {
    const result = await rechargeWallet({ userId: req.user.id, ...req.body });
    res.json(result);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

export const pay = async (req, res) => {
  try {
    const result = await payBusiness({ userId: req.user.id, ...req.body });
    res.json(result);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

export const donate = async (req, res) => {
  try {
    const result = await donateToStreamer({ userId: req.user.id, ...req.body });
    if (req.io) req.io.to(req.body.streamerId).emit("donation:received", {
      amount: req.body.amount, message: req.body.message, from: req.user.username,
    });
    res.json(result);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

export const redeem = async (req, res) => {
  try {
    const result = await redeemCoins({ userId: req.user.id, ...req.body });
    res.json(result);
  } catch (e) { res.status(400).json({ message: e.message }); }
};
