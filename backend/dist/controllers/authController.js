/* FORTRESS ENTERPRISE AUTO-CONVERTED: authController.js */
import User from '../models/User';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { createSendToken, verifyToken } from '../utils/jwt';
// @desc    Registrar usuário com plano
// @route   POST /api/auth/signup
// @access  Public
export const signup = catchAsync(async (req, res, next) => {
    const { name, email, password, passwordConfirm, plan = 'sentinel' } = req.body;
    // 1) Validações básicas
    if (!name || !email || !password || !passwordConfirm) {
        return next(new AppError('Todos os campos são obrigatórios', 400));
    }
    if (password !== passwordConfirm) {
        return next(new AppError('Senhas não coincidem', 400));
    }
    // 2) Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email já cadastrado', 400));
    }
    // 3) Criar usuário
    const newUser = await User.create({
        email,
        password,
        plan,
        profile: {
            name,
            phone: req.body.phone
        }
    });
    // 4) Logar usuário automaticamente
    createSendToken(newUser, 201, res);
});
// @desc    Login usuário
// @route   POST /api/auth/login
// @access  Public
export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // 1) Verificar se email e password existem
    if (!email || !password) {
        return next(new AppError('Por favor informe email e senha', 400));
    }
    // 2) Verificar se usuário existe && password está correto
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password))) {
        return next(new AppError('Email ou senha incorretos', 401));
    }
    // 3) Atualizar último login
    user.lastLogin = new Date();
    await user.save();
    // 4) Se tudo ok, enviar token para cliente
    createSendToken(user, 200, res);
});
// @desc    Middleware de proteção - Verificar se usuário está logado
export const protect = catchAsync(async (req, res, next) => {
    // 1) Pegar token e verificar se existe
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('Você não está logado. Por favor faça login para ter acesso.', 401));
    }
    // 2) Verificar token
    const decoded = verifyToken(token);
    // 3) Verificar se usuário ainda existe
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('O usuário deste token não existe mais.', 401));
    }
    // 4) Verificar se usuário mudou password depois do token ser emitido
    // NOTA: Precisamos implementar changedPasswordAfter no User model
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});
// @desc    Logout usuário
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success',
        message: 'Logout realizado com sucesso'
    });
};
// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        status: 'success',
        data: {
            user: user.getDashboardData()
        }
    });
});
// @desc    Update user password
// @route   PATCH /api/auth/update-password
// @access  Private
export const updatePassword = catchAsync(async (req, res, next) => {
    const { passwordCurrent, password, passwordConfirm } = req.body;
    if (!passwordCurrent || !password || !passwordConfirm) {
        return next(new AppError('Todos os campos de senha são obrigatórios', 400));
    }
    if (password !== passwordConfirm) {
        return next(new AppError('Senhas não coincidem', 400));
    }
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    // 2) Check if current password is correct
    if (!(await user.correctPassword(passwordCurrent))) {
        return next(new AppError('Sua senha atual está errada.', 401));
    }
    // 3) Update password
    user.password = password;
    await user.save();
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});
