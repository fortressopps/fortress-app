import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import { createSendToken, verifyToken } from "../utils/jwt";
import {
  findUserByEmail,
  createUser,
  findUserById,
  updateUserPassword,
  updateLastLogin,
  verifyUserPassword,
  getDashboardData,
} from "../services/userService";
import { fortressLogger } from "../utils/logger";

// @desc    Registrar usuário com plano
export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, passwordConfirm, plan = "sentinel", phone } = req.body;

  if (!name || !email || !password || !passwordConfirm) {
    return next(new AppError("Todos os campos são obrigatórios", 400));
  }
  if (password !== passwordConfirm) {
    return next(new AppError("Senhas não coincidem", 400));
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return next(new AppError("Email já cadastrado", 400));
  }

  const newUser = await createUser({ email, password, plan, profile: { name, phone } });
  if (!newUser) {
    return next(new AppError("Erro ao criar usuário", 500));
  }

  fortressLogger.info({ event: "USER_SIGNUP", email, plan });
  createSendToken(newUser, 201, res);
});

// @desc    Login usuário
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Por favor informe email e senha", 400));
  }

  const user = await findUserByEmail(email);
  if (!user || !(await verifyUserPassword(user, password))) {
    fortressLogger.warn({ event: "LOGIN_FAILED", email });
    return next(new AppError("Email ou senha incorretos", 401));
  }

  await updateLastLogin(user.id);
  fortressLogger.info({ event: "USER_LOGIN", email, id: user.id });
  createSendToken(user, 200, res);
});

// @desc    Middleware de proteção
export const protect = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("Você não está logado. Por favor faça login para ter acesso.", 401));
  }

  const decoded = verifyToken(token);
  const currentUser = await findUserById(decoded.id);
  if (!currentUser) {
    return next(new AppError("O usuário deste token não existe mais.", 401));
  }

  req.user = currentUser;
  fortressLogger.info({ event: "AUTH_PROTECT", userId: currentUser.id });
  next();
});

// @desc    Logout usuário
export const logout = (_req: Request, res: Response) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  fortressLogger.info({ event: "USER_LOGOUT" });
  res.status(200).json({ status: "success", message: "Logout realizado com sucesso" });
};

// @desc    Get current user
export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await findUserById(req.user.id);
  if (!user) throw new AppError("Usuário não encontrado", 404);

  fortressLogger.info({ event: "USER_GET_ME", userId: user.id });
  res.status(200).json({
    status: "success",
    data: { user: getDashboardData(user) },
  });
});

// @desc    Update user password
export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;

  if (!passwordCurrent || !password || !passwordConfirm) {
    return next(new AppError("Todos os campos de senha são obrigatórios", 400));
  }
  if (password !== passwordConfirm) {
    return next(new AppError("Senhas não coincidem", 400));
  }

  const user = await findUserById(req.user.id);
  if (!user) return next(new AppError("Usuário não encontrado", 404));

  const isCorrect = await verifyUserPassword(user, passwordCurrent);
  if (!isCorrect) {
    fortressLogger.warn({ event: "PASSWORD_UPDATE_FAILED", userId: user.id });
    return next(new AppError("Sua senha atual está errada.", 401));
  }

  const updated = await updateUserPassword(user.id, password);
  if (!updated) return next(new AppError("Erro ao atualizar senha", 500));

  fortressLogger.info({ event: "PASSWORD_UPDATED", userId: user.id });
  createSendToken(user, 200, res);
});