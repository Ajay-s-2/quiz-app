import AuthService from '../services/AuthService.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.validated.email, req.validated.password);

  res.status(200).json({
    status: 200,
    message: 'Logged in successfully',
    data: result,
  });
});

export const signup = asyncHandler(async (req, res) => {
  const host = await AuthService.createUser({
    ...req.validated,
    role: 'host',
    status: 'active',
  });
  const result = await AuthService.login(req.validated.email, req.validated.password);

  res.status(201).json({
    status: 201,
    message: 'Account created successfully',
    data: {
      ...result,
      user: host,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await AuthService.logout(req.authToken);

  res.status(200).json({
    status: 200,
    message: 'Logged out successfully',
  });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'User retrieved successfully',
    data: req.user,
  });
});

export const getHosts = asyncHandler(async (req, res) => {
  const hosts = await AuthService.getHosts();

  res.status(200).json({
    status: 200,
    message: 'Hosts retrieved successfully',
    data: hosts,
  });
});

export const createHost = asyncHandler(async (req, res) => {
  const host = await AuthService.createUser({
    ...req.validated,
    role: 'host',
    status: 'active',
  });

  res.status(201).json({
    status: 201,
    message: 'Host created successfully',
    data: host,
  });
});

export const updateHost = asyncHandler(async (req, res) => {
  const host = await AuthService.updateHost(req.params.userId, req.validated);

  res.status(200).json({
    status: 200,
    message: 'Host updated successfully',
    data: host,
  });
});

export const deleteHost = asyncHandler(async (req, res) => {
  await AuthService.deleteHost(req.params.userId);

  res.status(200).json({
    status: 200,
    message: 'Host deleted successfully',
  });
});

export default {
  login,
  signup,
  logout,
  me,
  getHosts,
  createHost,
  updateHost,
  deleteHost,
};
