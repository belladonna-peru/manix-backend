import prisma from "../config/prisma.js";

// ── Obtener o crear wallet ────────────────────────────────────────────────────

export const getOrCreateWallet = async (userId) => {
  try {
    let wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0, coins: 50 },
      });
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "reward",
          amount: 0,
          coins: 50,
          description: "Bienvenida a MANIX — 50 coins gratis",
          status: "completed",
        },
      });
    }
    return wallet;
  } catch (e) {
    console.error("getOrCreateWallet error:", e.message);
    throw new Error("No se pudo cargar la wallet");
  }
};

// ── Obtener wallet con transacciones ──────────────────────────────────────────

export const getWalletWithHistory = async (userId) => {
  const wallet = await getOrCreateWallet(userId);
  const transactions = await prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return { ...wallet, transactions };
};

// ── Recargar saldo ───────────────────────────────────────────────────────────

export const rechargeWallet = async ({ userId, amount, method }) => {
  if (amount <= 0) throw new Error("Monto inválido");
  if (amount > 5000) throw new Error("Monto máximo: S/ 5,000");

  const wallet = await getOrCreateWallet(userId);
  const bonusCoins = Math.floor(amount / 10) * 5;

  const updated = await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: { increment: amount },
      totalEarned: { increment: amount },
      coins: { increment: bonusCoins },
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: "recharge",
      amount,
      coins: bonusCoins,
      description: "Recarga via " + method + (bonusCoins > 0 ? " · +" + bonusCoins + " coins bonus" : ""),
      status: "completed",
      referenceType: method,
    },
  });

  return { ...updated, bonusCoins };
};

// ── Pagar a un negocio ───────────────────────────────────────────────────────

export const payBusiness = async ({ userId, businessId, orderId, amount }) => {
  if (amount <= 0) throw new Error("Monto inválido");

  const wallet = await getOrCreateWallet(userId);
  if (wallet.balance < amount) throw new Error("Saldo insuficiente");

  const business = await prisma.business.findFirst({ where: { id: businessId } });
  if (!business) throw new Error("Negocio no encontrado");

  const cashbackCoins = Math.floor(amount * 3);

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: { decrement: amount },
      totalSpent: { increment: amount },
      coins: { increment: cashbackCoins },
    },
  });

  const bizWallet = await getOrCreateWallet(business.ownerId);
  await prisma.wallet.update({
    where: { id: bizWallet.id },
    data: {
      balance: { increment: amount * 0.95 },
      totalEarned: { increment: amount * 0.95 },
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id, type: "payment", amount: -amount, coins: cashbackCoins,
      description: "Pago a " + business.name, referenceId: orderId, referenceType: "order", status: "completed",
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: bizWallet.id, type: "income", amount: amount * 0.95,
      description: "Venta recibida", referenceId: orderId, referenceType: "order", status: "completed",
    },
  });

  return { success: true, newBalance: wallet.balance - amount, cashbackCoins };
};

// ── Donar a un streamer ──────────────────────────────────────────────────────

export const donateToStreamer = async ({ userId, streamerId, amount, message }) => {
  if (amount <= 0) throw new Error("Monto inválido");
  if (userId === streamerId) throw new Error("No puedes donarte a ti mismo");

  const wallet = await getOrCreateWallet(userId);
  if (wallet.balance < amount) throw new Error("Saldo insuficiente");

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { decrement: amount }, totalDonated: { increment: amount } },
  });

  const streamerWallet = await getOrCreateWallet(streamerId);
  await prisma.wallet.update({
    where: { id: streamerWallet.id },
    data: { balance: { increment: amount * 0.85 }, totalEarned: { increment: amount * 0.85 } },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id, type: "donation_sent", amount: -amount,
      description: message ? "Donacion · " + message : "Donacion a streamer",
      referenceId: streamerId, referenceType: "donation", status: "completed",
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: streamerWallet.id, type: "donation_received", amount: amount * 0.85,
      description: message ? "Donacion recibida · " + message : "Donacion recibida",
      referenceId: userId, referenceType: "donation", status: "completed",
    },
  });

  return { success: true, newBalance: wallet.balance - amount };
};

// ── Enviar dinero a otro usuario (el "Yape" de MANIX, sin comisión) ───────────

export const sendMoney = async ({ userId, toUserId, toUsername, amount, note }) => {
  if (amount <= 0) throw new Error("Monto inválido");
  if (amount > 5000) throw new Error("Monto máximo: S/ 5,000");

  // Resolver destinatario por id o por username (para QR / búsqueda)
  let receiver = null;
  if (toUserId) {
    receiver = await prisma.user.findUnique({ where: { id: toUserId }, select: { id: true, username: true } });
  } else if (toUsername) {
    receiver = await prisma.user.findFirst({
      where: { username: toUsername.replace(/^@/, "") },
      select: { id: true, username: true },
    });
  }
  if (!receiver) throw new Error("Destinatario no encontrado");
  if (receiver.id === userId) throw new Error("No puedes enviarte dinero a ti mismo");

  const wallet = await getOrCreateWallet(userId);
  if (wallet.balance < amount) throw new Error("Saldo insuficiente");

  const me = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });

  // Débito
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { decrement: amount }, totalSpent: { increment: amount } },
  });
  // Crédito
  const rxWallet = await getOrCreateWallet(receiver.id);
  await prisma.wallet.update({
    where: { id: rxWallet.id },
    data: { balance: { increment: amount }, totalEarned: { increment: amount } },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id, type: "transfer_sent", amount: -amount,
      description: (note ? "Envío · " + note : "Envío a @" + receiver.username),
      referenceId: receiver.id, referenceType: "transfer", status: "completed",
    },
  });
  await prisma.walletTransaction.create({
    data: {
      walletId: rxWallet.id, type: "transfer_received", amount,
      description: (note ? "Recibido de @" + (me?.username || "usuario") + " · " + note : "Recibido de @" + (me?.username || "usuario")),
      referenceId: userId, referenceType: "transfer", status: "completed",
    },
  });

  return { success: true, newBalance: wallet.balance - amount, to: receiver.username };
};

// ── Canjear coins ────────────────────────────────────────────────────────────

export const redeemCoins = async ({ userId, coins }) => {
  if (coins < 100) throw new Error("Minimo 100 coins para canjear");

  const wallet = await getOrCreateWallet(userId);
  if (wallet.coins < coins) throw new Error("Coins insuficientes");

  const soles = coins * 0.01;

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { coins: { decrement: coins }, balance: { increment: soles } },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id, type: "redeem", amount: soles, coins: -coins,
      description: "Canje de " + coins + " coins a S/ " + soles.toFixed(2), status: "completed",
    },
  });

  return { success: true, newBalance: wallet.balance + soles, newCoins: wallet.coins - coins };
};
