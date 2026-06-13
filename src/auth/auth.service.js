import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const createToken = (user) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET no configurado");
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const userSelect = {
  id: true,
  username: true,
  email: true,
  avatar: true,
  vibe: true,
  bio: true,
  accountType: true,
};

export const registerUser = async ({ username, email, password, vibe, phone }) => {
  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (exists) throw new Error("El usuario o correo ya existe");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      vibe: vibe || "🔥 Prendido",
      ...(phone && { phone }),
    },
    select: userSelect,
  });

  return { user, token: createToken(user) };
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Credenciales incorrectas");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new Error("Credenciales incorrectas");

  let business = null;
  if (user.accountType === "business") {
    business = await prisma.business.findFirst({
      where: { ownerId: user.id },
      select: { id: true, name: true, isOpen: true, businessPlan: true },
    });
  }

  const safeUser = {
    id:           user.id,
    username:     user.username,
    email:        user.email,
    avatar:       user.avatar,
    vibe:         user.vibe,
    bio:          user.bio,
    accountType:  user.accountType || "normal",
    isOnline:     user.isOnline,
    zoneName:     user.zoneName,
    locationMode: user.locationMode,
    business,
  };

  return { user: safeUser, token: createToken(user) };
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });
  if (!user) throw new Error("Usuario no encontrado");

  let business = null;
  if (user.accountType === "business") {
    business = await prisma.business.findFirst({
      where: { ownerId: userId },
      select: { id: true, name: true, isOpen: true, businessPlan: true },
    });
  }

  return { ...user, business };
};
